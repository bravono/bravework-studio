import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto"; // Node.js built-in module for cryptographic functions
import { sendPaymentReceivedEmail } from "lib/mailer";

// Import your PostgreSQL database query function
import { queryDatabase } from "../../../lib/db";

// Ensure your Paystack Secret Key is available as an environment variable.
// This should be your LIVE Secret Key (sk_live_...) for production.
// NEVER expose this key on the client-side.
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// --- Cache for Order Statuses ---
// We'll load status names to IDs mapping once to avoid repeated DB lookups.
interface OrderStatusMap {
  [statusName: string]: number; // Maps status name (string) to status ID (number)
}

let orderStatusMap: OrderStatusMap = {};
let isOrderStatusMapLoaded = false;
let orderStatusLoadPromise: Promise<void> | null = null; // To prevent multiple simultaneous loads

// Helper function to load and cache order statuses from the database
async function loadOrderStatusMap() {
  if (isOrderStatusMapLoaded && Object.keys(orderStatusMap).length > 0) {
    return; // Already loaded successfully
  }

  // If a load is already in progress, wait for it
  if (orderStatusLoadPromise) {
    return orderStatusLoadPromise;
  }

  // Start a new load operation
  orderStatusLoadPromise = (async () => {
    try {
      console.log("Attempting to load order statuses into cache...");
      const { rows } = await queryDatabase(
        "SELECT order_status_id, name FROM order_statuses"
      );
      rows.forEach((row: { order_status_id: number; name: string }) => {
        orderStatusMap[row.name] = row.order_status_id;
      });
      isOrderStatusMapLoaded = true;
      console.log("Order statuses loaded successfully:", orderStatusMap);
    } catch (error) {
      console.error(
        "Failed to load order statuses from DB on startup/request:",
        error
      );
      // Do NOT throw a critical error here. Instead, keep isOrderStatusMapLoaded as false
      // so subsequent requests can retry. The POST handler will return a 500 if needed.
      isOrderStatusMapLoaded = false; // Ensure it's false if loading failed
      orderStatusMap = {}; // Clear map on failure
    } finally {
      orderStatusLoadPromise = null; // Reset the promise after completion (success or failure)
    }
  })();

  return orderStatusLoadPromise;
}

// Define the POST handler for the webhook endpoint
export async function POST(req: NextRequest) {
  // Ensure status map is loaded before processing any database operations.
  // This 'await' will pause execution until loadOrderStatusMap completes (or fails).
  try {
    await loadOrderStatusMap();
    if (!isOrderStatusMapLoaded) {
      // If loadOrderStatusMap completed but didn't set isOrderStatusMapLoaded to true,
      // it means the loading failed (e.g., DB connection issue, table not found).
      console.error("Order status map failed to load. Cannot process webhook.");
      return NextResponse.json(
        { message: "Server is not ready: Order status data unavailable." },
        { status: 503 } // Service Unavailable, indicating a temporary server issue
      );
    }
  } catch (error) {
    // Catch any unexpected errors from loadOrderStatusMap (e.g., if queryDatabase itself throws unhandled)
    console.error("Unexpected error during order status map loading:", error);
    return NextResponse.json(
      { message: "Internal server error during initialization." },
      { status: 500 }
    );
  }

  // 1. Basic Security Check: Ensure Secret Key is configured
  if (!PAYSTACK_SECRET_KEY) {
    console.error(
      "Server configuration error: Paystack Secret Key is missing. Cannot process webhook."
    );
    return NextResponse.json(
      { message: "Server configuration error." },
      { status: 500 }
    );
  }

  // 2. Read the Raw Body for Signature Verification
  const signature = req.headers.get("x-paystack-signature");
  const rawBody = await req.text(); // Get the raw string body

  // 3. Verify the Webhook Signature
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest("hex");

  if (hash !== signature) {
    console.warn(
      "Webhook signature mismatch. Potential unauthorized access attempt."
    );
    return NextResponse.json(
      { message: "Signature verification failed." },
      { status: 400 }
    );
  }

  // 4. Parse the JSON payload after successful verification
  let event;
  try {
    event = JSON.parse(rawBody);
  } catch (error) {
    console.error("Error parsing webhook JSON body:", error);
    return NextResponse.json(
      { message: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  console.log("Received Paystack Webhook Event:", event.event);
  console.log("Event Data:", event.data);

  let customerEmail;
  let orderId;
  let clientName;
  // 5. Handle Different Event Types
  switch (event.event) {
    case "charge.success":
      const paystackReference = event.data.reference; // Unique for THIS payment
      const paystackAmountKobo = event.data.amount;
      const paystackCurrency = event.data.currency;
      customerEmail = event.data.customer.email;
      const gatewayResponse = event.data.gateway_response;
      const paystackStatus = event.data.status; // 'success'
      const paystackPaymentOption = event.payment_option;
      const discountApplied = event.discount_applied;

      // IMPORTANT: Extract order_id from Paystack's metadata.
      orderId = event.data.metadata?.order_id;
      clientName = event.data.metadata?.clientName;

      if (!orderId) {
        console.error(
          `Webhook for reference ${paystackReference} missing order_id in metadata.`
        );
        return NextResponse.json(
          { message: "Missing order_id in metadata." },
          { status: 400 }
        );
      }

      console.log(
        `Processing charge.success event for Order ID: ${orderId}, Paystack Ref: ${paystackReference}, Amount: ${paystackAmountKobo}, Currency: ${paystackCurrency}`
      );

      try {
        // --- Idempotency Check for Payments Table ---
        // Ensure this specific Paystack transaction hasn't been processed before.
        const { rows: existingPaymentRows } = await queryDatabase(
          "SELECT payment_id FROM payments WHERE paystack_reference = $1 AND paystack_status = $2",
          [paystackReference, "success"] // Still checking Paystack's own status string here
        );

        if (existingPaymentRows.length > 0) {
          console.log(
            `Payment with Paystack reference ${paystackReference} already processed. Skipping duplicate webhook.`
          );
          return NextResponse.json(
            { message: "Webhook already processed." },
            { status: 200 }
          );
        }

        // --- Fetch Order Data ---
        const { rows: orderRows } = await queryDatabase(
          "SELECT * FROM orders WHERE order_id = $1",
          [orderId]
        );

        if (orderRows.length === 0) {
          console.error(
            `Order with ID ${orderId} not found in DB. Cannot process webhook.`
          );
          return NextResponse.json(
            { message: "Order not found." },
            { status: 404 }
          );
        }

        let order = orderRows[0]; // The order record

        // --- Fetch Customer Data (Optional, but useful for email/customer relations) ---
        const { rows: customerRows } = await queryDatabase(
          "SELECT * FROM users WHERE user_id = $1",
          [order.customer_id]
        );
        const customer = customerRows.length > 0 ? customerRows[0] : null;

        const totalExpectedAmountKobo = order.total_expected_amount_kobo;
        const expectedCurrency = order.expected_currency;
        const amountPaidToDateKobo = order.amount_paid_to_date_kobo || 0;

        let paymentIsFraudulent = false;
        let fraudReason = "";
        let newOrderStatusId: number | undefined;

        // --- TODO Item 2: Check `paystackCurrency` matches your expected currency. ---
        if (paystackCurrency !== expectedCurrency) {
          console.error(
            `CURRENCY MISMATCH! Order ID: ${orderId}. ` +
              `Expected Currency: ${expectedCurrency}, Received Currency: ${paystackCurrency}`
          );
          paymentIsFraudulent = true;
          fraudReason = "currency_mismatch";
          newOrderStatusId = orderStatusMap["currency_mismatch"];
        }

        // --- TODO Item 1: Compare `paystackAmount` with the actual expected amount for the service and handle installments. ---
        const firstPaymentMinimumKobo = Math.ceil(
          totalExpectedAmountKobo * 0.5
        ); // 50% of total

        // Check if this is the first payment for this order AND it's below the 50% minimum
        if (!paymentIsFraudulent && amountPaidToDateKobo === 0) {
          if (paystackAmountKobo < firstPaymentMinimumKobo) {
            console.error(
              `FRAUD ALERT! Order ID: ${orderId}. First payment too low. ` +
                `Expected at least: ${firstPaymentMinimumKobo} ${expectedCurrency}, Received: ${paystackAmountKobo} ${paystackCurrency}`
            );
            paymentIsFraudulent = true;
            fraudReason = "first_payment_too_low";
            newOrderStatusId = orderStatusMap["first_payment_too_low"];
          }
        }

        // Check for overpayment with this specific transaction
        // Only if not already flagged as fraudulent by currency/first payment rule
        if (
          !paymentIsFraudulent &&
          amountPaidToDateKobo + paystackAmountKobo > totalExpectedAmountKobo
        ) {
          console.error(
            `FRAUD ALERT! Order ID: ${orderId}. Overpayment detected. ` +
              `Total Expected: ${totalExpectedAmountKobo} ${expectedCurrency}, Current Payment: ${paystackAmountKobo}, New Total Paid: ${
                amountPaidToDateKobo + paystackAmountKobo
              }`
          );
          paymentIsFraudulent = true;
          fraudReason = "overpayment_detected";
          newOrderStatusId = orderStatusMap["overpayment_detected"];
        }

        // --- Insert new record into `payments` table ---
        await queryDatabase(
          `INSERT INTO payments (order_id, paystack_reference, amount_kobo, currency, paystack_status, gateway_response, customer_email, is_fraudulent, created_at, updated_at, payment_option_selected, discount_applied_percentage)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
          [
            order.order_id,
            paystackReference,
            paystackAmountKobo,
            paystackCurrency,
            paystackStatus,
            gatewayResponse,
            customerEmail,
            paymentIsFraudulent,
            paystackPaymentOption,
            discountApplied,
          ]
        );
        console.log(
          `Payment record for Paystack Ref ${paystackReference} inserted into 'payments' table.`
        );

        // --- Update 'orders' table's running total and status (only if payment is not fraudulent) ---
        if (!paymentIsFraudulent) {
          const newAmountPaidToDateKobo =
            amountPaidToDateKobo + paystackAmountKobo;
          let calculatedOrderStatusId: number;

          if (newAmountPaidToDateKobo >= totalExpectedAmountKobo) {
            calculatedOrderStatusId = orderStatusMap["paid"]; // Fully paid
          } else if (newAmountPaidToDateKobo > 0) {
            calculatedOrderStatusId = orderStatusMap["partially_paid"]; // Partial payment received
          } else {
            // This case should ideally not be hit with a charge.success event
            calculatedOrderStatusId = orderStatusMap["pending"];
          }

          // Use the calculated status ID unless a specific fraud status was determined
          newOrderStatusId = newOrderStatusId || calculatedOrderStatusId;

          await queryDatabase(
            `UPDATE orders
             SET amount_paid_to_date_kobo = $1, status_id = $2, updated_at = NOW()
             WHERE order_id = $3`,
            [newAmountPaidToDateKobo, newOrderStatusId, order.order_id]
          );
          console.log(
            `Order ${order.order_id} updated: New amount_paid_to_date_kobo = ${newAmountPaidToDateKobo}, Status ID = ${newOrderStatusId}`
          );

          // --- Grant Access to Service (Placeholder) ---
          // Grant access ONLY if the order is fully paid.
          if (newOrderStatusId === orderStatusMap["paid"]) {
            // await grantServiceAccess(customer.email || customerEmail, totalExpectedAmountKobo, order.order_id);
            console.log(
              `TODO: Grant access to service for ${
                customer?.email || customerEmail
              } (Order ID: ${order.order_id})`
            );
          } else if (newOrderStatusId === orderStatusMap["partially_paid"]) {
            console.log(
              `TODO: Order ${order.order_id} is partially paid. Consider conditional access or waiting for full payment.`
            );
          }

          // --- Send Confirmation Email (Placeholder) ---
          // Consider different email templates for full vs. partial payments.
          // You might need to retrieve the status name from newOrderStatusId for the email
          const finalOrderStatusName =
            Object.keys(orderStatusMap).find(
              (key) => orderStatusMap[key] === newOrderStatusId
            ) || "unknown";
          // await sendConfirmationEmail(customer.email || customerEmail, order.order_id, paystackAmountKobo / 100, newAmountPaidToDateKobo / 100, finalOrderStatusName);
          console.log(
            `TODO: Send confirmation email to ${
              customer?.email || customerEmail
            } for Order ID: ${order.order_id} (Status: ${finalOrderStatusName})`
          );
        } else {
          // If payment is fraudulent, you might send a different type of alert email or take other actions
          const finalFraudStatusName =
            Object.keys(orderStatusMap).find(
              (key) => orderStatusMap[key] === newOrderStatusId
            ) || "unknown_fraud";
          console.warn(
            `Payment ${paystackReference} for Order ID ${orderId} marked as fraudulent: ${fraudReason} (Status: ${finalFraudStatusName}). No order update or service granted.`
          );
          // TODO: Send internal fraud alert email.
          // If a specific fraud status was determined and stored, update the order status as well
          if (newOrderStatusId) {
            await queryDatabase(
              `UPDATE orders SET status_id = $1, updated_at = NOW() WHERE order_id = $2`,
              [newOrderStatusId, order.order_id]
            );
            console.log(
              `Order ${order.order_id} status updated to fraud-related status: ${newOrderStatusId}`
            );
          }
        }
      } catch (error) {
        console.error(
          `Error processing charge.success webhook for Order ID ${orderId}, Ref ${paystackReference}:`,
          error
        );
        // It's crucial to log this error and potentially trigger an alert
        // so you can manually investigate and fulfill the order if necessary.
        return NextResponse.json(
          { message: "Internal server error processing webhook." },
          { status: 500 }
        );
      }
      break;

    case "charge.failed":
      const failedPaystackReference = event.data.reference;
      const failedOrderId = event.data.metadata?.order_id;
      const failedAmountKobo = event.data.amount;
      const failedCurrency = event.data.currency;
      const failedCustomerEmail = event.data.customer.email;
      const failedGatewayResponse = event.data.gateway_response;
      const failedPaystackStatus = event.data.status; // 'failed'
      const failedPaymentOption = event.data.payment_option;
      const failedDiscountApplied = event.data.discount_applied;

      console.log(
        `Processing charge.failed event for Order ID: ${failedOrderId}, Paystack Ref: ${failedPaystackReference}, Amount: ${failedAmountKobo}`
      );

      try {
        // Record the failed payment in the payments table
        await queryDatabase(
          `INSERT INTO payments (order_id, paystack_reference, amount_kobo, currency, paystack_status, gateway_response, customer_email, is_fraudulent, created_at, updated_at, payment_option_selected, discount_applied_percentage)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10 NOW(), NOW())`,
          [
            failedOrderId,
            failedPaystackReference,
            failedAmountKobo,
            failedCurrency,
            failedPaystackStatus,
            failedGatewayResponse,
            failedCustomerEmail,
            false,
            failedPaymentOption,
            failedDiscountApplied,
          ]
        );
        console.log(
          `Failed payment record for Paystack Ref ${failedPaystackReference} inserted into 'payments' table.`
        );

        // Optionally update the order status if this was the first/only attempt and no payments were made yet.
        if (failedOrderId) {
          const { rows: orderRows } = await queryDatabase(
            "SELECT amount_paid_to_date_kobo, status_id FROM orders WHERE order_id = $1",
            [failedOrderId]
          );
          if (
            orderRows.length > 0 &&
            orderRows[0].amount_paid_to_date_kobo === 0
          ) {
            const failedStatusId = orderStatusMap["failed"];
            await queryDatabase(
              `UPDATE orders SET status_id = $1, updated_at = NOW() WHERE order_id = $2`,
              [failedStatusId, failedOrderId]
            );
            console.log(
              `Order ${failedOrderId} status updated to 'failed' as no payments were made yet.`
            );
          }
        }
      } catch (error) {
        console.error(
          `Error processing charge.failed webhook for Ref ${failedPaystackReference}:`,
          error
        );
      }
      break;

    // Add more cases for other events you want to handle (e.g., 'transfer.success')
    default:
      console.log(`Unhandled Paystack Event: ${event.event}. No action taken.`);
      break;
  }

  sendPaymentReceivedEmail(customerEmail, clientName, orderId);
  // This tells Paystack you successfully received and acknowledged the webhook.
  return NextResponse.json(
    { message: "Webhook received successfully." },
    { status: 200 }
  );
}

// Initial load of the status map when the serverless function cold starts
// This will run once per instance lifecycle.
// The promise is stored to prevent multiple simultaneous loads.
loadOrderStatusMap();
