import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto"; // Node.js built-in module for cryptographic functions
import { sendPaymentReceivedEmail } from "lib/mailer";

// Import your PostgreSQL database query function and the transaction wrapper
import { queryDatabase, withTransaction } from "../../../lib/db";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// --- Cache for Order Statuses ---
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
  try {
    await loadOrderStatusMap();
    if (!isOrderStatusMapLoaded) {
      console.error("Order status map failed to load. Cannot process webhook.");
      return NextResponse.json(
        { message: "Server is not ready: Order status data unavailable." },
        { status: 503 }
      );
    }
  } catch (error) {
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

      // IMPORTANT: Extract metadata sent from frontend
      const metadata = event.data.metadata;
      const serviceType = metadata?.service || "course"; // Default to 'course' if not present
      orderId = metadata?.orderId;
      clientName = metadata?.customer_name;
      const paystackPaymentOption = metadata?.payment_option;
      const discountApplied = parseFloat(metadata?.discount_applied);
      const originalAmountKoboFromMetadata = parseFloat(
        metadata?.original_amount_kobo
      );
      const courseId = metadata?.courseId;
      const offerId = metadata?.offerId;

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
        `Processing charge.success event for Order ID: ${orderId}, Paystack Ref: ${paystackReference}, Amount: ${paystackAmountKobo}, Currency: ${paystackCurrency}, Service Type: ${serviceType}`
      );

      // Wrap all database operations in a transaction
      try {
        await withTransaction(async (client) => {
          // --- Idempotency Check for Payments Table ---
          const { rows: existingPaymentRows } = await client.query(
            "SELECT payment_id FROM payments WHERE paystack_reference = $1 AND paystack_status = $2",
            [paystackReference, "success"]
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

          let totalExpectedOrderAmountKobo: number;
          let project_duration_days: number | null = null;
          let orderTitle: string;
          let newOrderStatusId: number;

          // --- Handle Different Service Types Based on Metadata ---
          if (serviceType === "course") {
            if (!courseId) {
              throw new Error(
                "Missing courseId in metadata for course payment."
              );
            }
            const courseRows = await client.query(
              "SELECT price_kobo, title, course_duration_days FROM courses WHERE course_id = $1",
              [courseId]
            );
            if (courseRows.rows.length === 0) {
              throw new Error(`Course with ID ${courseId} not found.`);
            }
            const courseDetails = courseRows.rows[0];
            totalExpectedOrderAmountKobo = courseDetails.price_kobo;
            orderTitle = courseDetails.title;
            project_duration_days = courseDetails.course_duration_days;

            if (paystackAmountKobo !== totalExpectedOrderAmountKobo) {
              throw new Error(
                `Amount mismatch for course. Expected: ${totalExpectedOrderAmountKobo}, Actual: ${paystackAmountKobo}`
              );
            }
            newOrderStatusId = orderStatusMap["paid"];
            console.log(
              `TODO: Grant access to course ${courseId} for ${clientName}`
            );
          } else if (serviceType === "custom-offer") {
            if (!offerId) {
              throw new Error("Missing offerId for custom offer.");
            }
            const customOfferRows = await client.query(
              "SELECT offer_amount_in_kobo, description, project_duration_days FROM custom_offers WHERE offer_id = $1",
              [offerId]
            );
            if (customOfferRows.rows.length === 0) {
              throw new Error(`Custom Offer with ID ${offerId} not found.`);
            }
            const customOfferDetails = customOfferRows.rows[0];

            totalExpectedOrderAmountKobo =
              customOfferDetails.offer_amount_in_kobo;
            orderTitle = customOfferDetails.description;
            project_duration_days = customOfferDetails.project_duration_days;

            // Recalculate expected amount on backend (CRUCIAL for security)
            switch (paystackPaymentOption) {
              case "deposit_50":
                totalExpectedOrderAmountKobo = Math.round(
                  totalExpectedOrderAmountKobo * 0.5
                );
                break;
              case "deposit_70_discount":
                totalExpectedOrderAmountKobo = Math.round(
                  totalExpectedOrderAmountKobo * 0.7 * (1 - 5 / 100)
                );
                break;
              case "full_100_discount":
                totalExpectedOrderAmountKobo = Math.round(
                  totalExpectedOrderAmountKobo * (1 - 10 / 100)
                );
                break;
              default:
                throw new Error(
                  `Unknown payment option: ${paystackPaymentOption}`
                );
            }

            if (paystackAmountKobo !== totalExpectedOrderAmountKobo) {
              throw new Error(
                `Amount mismatch for custom offer. Expected: ${totalExpectedOrderAmountKobo}, Actual: ${paystackAmountKobo}`
              );
            }

            // Update custom offer status if applicable
            await client.query(
              `UPDATE custom_offers SET status_id = (SELECT offer_status_id FROM custom_offer_statuses WHERE name = 'accepted'), updated_at = NOW() WHERE offer_id = $1`,
              [offerId]
            );
            console.log(
              `Custom offer ${offerId} status updated to 'accepted'.`
            );
          } else {
            throw new Error(`Unknown service type: ${serviceType}`);
          }

          // --- Fetch Order Data ---
          const { rows: orderRows } = await client.query(
            "SELECT * FROM orders WHERE order_id = $1",
            [orderId]
          );

          if (orderRows.length === 0) {
            throw new Error(
              `Order with ID ${orderId} not found in DB. Cannot process webhook.`
            );
          }
          let order = orderRows[0];
          const amountPaidToDateKobo = order.amount_paid_to_date_kobo || 0;

          // --- Insert new record into `payments` table ---
          await client.query(
            `INSERT INTO payments (order_id, paystack_reference, amount_kobo, currency, paystack_status, gateway_response, customer_email, is_fraudulent, payment_option_selected, discount_applied_percentage, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
            [
              order.order_id,
              paystackReference,
              paystackAmountKobo,
              paystackCurrency,
              paystackStatus,
              gatewayResponse,
              customerEmail,
              false, // is_fraudulent
              paystackPaymentOption,
              discountApplied,
            ]
          );
          console.log(
            `Payment record for Paystack Ref ${paystackReference} inserted into 'payments' table, linked to order ${order.order_id}.`
          );

          // --- Update 'orders' table's running total and status ---
          const newAmountPaidToDateKobo =
            amountPaidToDateKobo + paystackAmountKobo;
          let calculatedOrderStatusId: number;

          if (
            newAmountPaidToDateKobo >= totalExpectedOrderAmountKobo ||
            paystackPaymentOption === "full_100_discount"
          ) {
            calculatedOrderStatusId = orderStatusMap["paid"]; // Fully paid
          } else if (newAmountPaidToDateKobo > 0) {
            calculatedOrderStatusId = orderStatusMap["partially_paid"]; // Partial payment received
          } else {
            calculatedOrderStatusId = orderStatusMap["pending"];
          }
          newOrderStatusId = calculatedOrderStatusId;

          await client.query(
            `UPDATE orders
             SET amount_paid_to_date_kobo = $1,
                 order_status_id = $2,
                 title = $3,
                 start_date = NOW(),
                 end_date = NOW() + INTERVAL '${project_duration_days} days',
                 total_expected_amount_kobo = $4,
                 updated_at = NOW()
             WHERE order_id = $5`,
            [
              newAmountPaidToDateKobo,
              newOrderStatusId,
              orderTitle,
              totalExpectedOrderAmountKobo,
              order.order_id,
            ]
          );
          console.log(
            `Order ${order.order_id} updated: New amount_paid_to_date_kobo = ${newAmountPaidToDateKobo}, Status ID = ${newOrderStatusId}`
          );

          // --- Grant Access & Send Confirmation Email (Placeholder) ---
          const finalOrderStatusName =
            Object.keys(orderStatusMap).find(
              (key) => orderStatusMap[key] === newOrderStatusId
            ) || "unknown";
          console.log(
            `TODO: Grant access and send email to ${
              clientName || customerEmail
            } for Order ID: ${order.order_id} (Status: ${finalOrderStatusName})`
          );
          sendPaymentReceivedEmail(customerEmail, clientName, orderId);

          return NextResponse.json(
            { message: "Webhook received successfully." },
            { status: 200 }
          );
        });
      } catch (error) {
        console.error(
          `Error processing charge.success webhook for Order ID ${orderId}, Ref ${paystackReference}:`,
          error
        );
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
        await withTransaction(async (client) => {
          // Record the failed payment in the payments table
          await client.query(
            `INSERT INTO payments (order_id, paystack_reference, amount_kobo, currency, paystack_status, gateway_response, customer_email, is_fraudulent, payment_option_selected, discount_applied_percentage, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
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
          if (failedOrderId) {
            const { rows: orderRows } = await client.query(
              "SELECT amount_paid_to_date_kobo, order_status_id FROM orders WHERE order_id = $1",
              [failedOrderId]
            );
            if (
              orderRows.length > 0 &&
              orderRows[0].amount_paid_to_date_kobo === 0
            ) {
              const failedStatusId = orderStatusMap["failed"];
              await client.query(
                `UPDATE orders SET order_status_id = $1, updated_at = NOW() WHERE order_id = $2`,
                [failedStatusId, failedOrderId]
              );
              console.log(
                `Order ${failedOrderId} status updated to 'failed' as no payments were made yet.`
              );
            }
          }
        });
      } catch (error) {
        console.error(
          `Error processing charge.failed webhook for Ref ${failedPaystackReference}:`,
          error
        );
        return NextResponse.json(
          { message: "Internal server error processing webhook." },
          { status: 500 }
        );
      }
      break;

    default:
      console.log(`Unhandled Paystack Event: ${event.event}. No action taken.`);
      break;
  }
  return NextResponse.json(
    { message: "Webhook received successfully." },
    { status: 200 }
  );
}

// Initial load of the status map when the serverless function cold starts
loadOrderStatusMap();
