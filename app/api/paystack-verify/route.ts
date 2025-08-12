import { NextRequest, NextResponse } from "next/server";

// Import your PostgreSQL database query function
import { queryDatabase, withTransaction } from "../../../lib/db"; // Ensure withTransaction is imported

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

  if (orderStatusLoadPromise) {
    return orderStatusLoadPromise;
  }

  orderStatusLoadPromise = (async () => {
    try {
      console.log("Attempting to load order statuses into cache...");
      // Querying 'order_statuses' as confirmed by user
      const statusResult = await queryDatabase("SELECT * FROM order_statuses");
      statusResult.forEach((row: { order_status_id: number; name: string }) => {
        orderStatusMap[row.name] = row.order_status_id;
      });
      isOrderStatusMapLoaded = true;
      console.log("Order statuses loaded successfully:", orderStatusMap);
    } catch (error) {
      console.error(
        "Failed to load order statuses from DB on startup/request:",
        error
      );
      isOrderStatusMapLoaded = false;
      orderStatusMap = {};
    } finally {
      orderStatusLoadPromise = null;
    }
  })();

  return orderStatusLoadPromise;
}

// Define the POST handler for the verification endpoint
export async function POST(req: NextRequest) {
  // Ensure status map is loaded before processing
  try {
    await loadOrderStatusMap();
    if (!isOrderStatusMapLoaded) {
      console.error(
        "Order status map failed to load. Cannot process verification."
      );
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

  if (!PAYSTACK_SECRET_KEY) {
    console.error(
      "Server configuration error: Paystack Secret Key is missing."
    );
    return NextResponse.json(
      { message: "Server configuration error." },
      { status: 500 }
    );
  }

  // Frontend sends the Paystack reference and offerId in the request body
  const {
    reference,
    offerId: frontendOfferId,
    paymentOption,
  } = await req.json(); // Added paymentOption from frontend

  if (!reference) {
    return NextResponse.json(
      { success: false, message: "No Paystack reference provided." },
      { status: 400 }
    );
  }

  try {
    // 1. Verify transaction with Paystack API
    const paystackVerifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const paystackData = await paystackVerifyResponse.json();

    if (!paystackData.status || paystackData.data.status !== "success") {
      console.error(
        "Paystack verification failed or not successful:",
        paystackData
      );
      return NextResponse.json(
        {
          success: false,
          message: "Paystack verification failed.",
          details: paystackData,
        },
        { status: 400 }
      );
    }

    const transactionData = paystackData.data;
    const actualAmountKobo = transactionData.amount; // Actual amount received from Paystack
    const actualCurrency = transactionData.currency; // Should be NGN
    const customerEmail = transactionData.customer.email;
    const gatewayResponse = transactionData.gateway_response;

    // IMPORTANT: Extract metadata sent from frontend
    const metadata = transactionData.metadata;
    const orderId = metadata?.orderId; // Expecting orderId from frontend metadata
    const paystackPaymentOption = metadata?.payment_option; // e.g., 'deposit_50', 'full_100_discount'
    const paymentPercentage = parseFloat(metadata?.payment_percentage); // e.g., 50, 70, 100
    const discountApplied = parseFloat(metadata?.discount_applied); // e.g., 0, 5, 10
    const customerName = metadata?.customer_name;
    const originalAmountKoboFromMetadata = parseFloat(
      metadata?.original_amount_kobo
    ); // Original offer amount from metadata

    if (
      !orderId ||
      !paystackPaymentOption || // Use paystackPaymentOption from metadata
      isNaN(paymentPercentage) ||
      isNaN(discountApplied) ||
      isNaN(originalAmountKoboFromMetadata) ||
      !frontendOfferId // Ensure offerId from frontend is present
    ) {
      console.error(
        "Missing or invalid metadata from Paystack verification response:",
        metadata,
        "Frontend Offer ID:",
        frontendOfferId
      );
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment metadata or missing offer ID.",
        },
        { status: 400 }
      );
    }

    // Wrap all database operations in a transaction
    return await withTransaction(async (client) => {
      // 2. Fetch Order from your database (primary entity for payment tracking)
      const orderRows = await client.query(
        // Use client for transaction
        "SELECT * FROM orders WHERE order_id = $1",
        [orderId]
      );

      if (orderRows.rows.length === 0) {
        console.error(`Order with ID ${orderId} not found in DB.`);
        throw new Error("Order not found."); // Throw to trigger rollback
      }

      let order = orderRows.rows[0];
      const offerId = order.offer_id; // Get the associated offer_id from the order record

      // CRITICAL SECURITY CHECK: Ensure the offerId from the order matches the one from frontend
      if (offerId !== Number(frontendOfferId)) {
        console.error(
          `SECURITY ALERT: Mismatch between order's offer_id (${offerId}) and frontend offerId (${frontendOfferId}) for order ${orderId}.`
        );
        throw new Error("Security mismatch: Invalid offer association."); // Rollback
      }

      if (!offerId) {
        console.error(`Order ${orderId} does not have an associated offer_id.`);
        throw new Error("Order is not linked to an offer."); // Throw to trigger rollback
      }

      // Fetch the custom offer details to get the true original amount, description, and duration
      const customOfferRows = await client.query(
        // Use client for transaction
        "SELECT offer_amount_in_kobo, description, project_duration_days FROM custom_offers WHERE offer_id = $1",
        [offerId]
      );

      if (customOfferRows.rows.length === 0) {
        console.error(
          `Custom Offer with ID ${offerId} not found for Order ${orderId}.`
        );
        throw new Error("Associated custom offer not found."); // Throw to trigger rollback
      }

      const { offer_amount_in_kobo, description, project_duration_days } =
        customOfferRows.rows[0];

      // totalExpectedOrderAmountKobo will be the undiscounted value of offer_amount_in_kobo from custom_offers
      const totalExpectedOrderAmountKobo = offer_amount_in_kobo;
      const amountPaidToDateKobo = order.amount_paid_to_date_kobo || 0;

      // --- Idempotency Check for Payments Table (for this specific Paystack reference) ---
      const existingPaymentRows = await client.query(
        // Use client for transaction
        "SELECT payment_id FROM payments WHERE paystack_reference = $1 AND paystack_status = $2 AND order_id = $3",
        [reference, "success", orderId]
      );

      if (existingPaymentRows.rows.length > 0) {
        console.log(
          `Payment with Paystack reference ${reference} for order ${orderId} already processed. Skipping duplicate verification.`
        );
        return NextResponse.json({
          // Return success for idempotency
          success: true,
          message: "Payment already processed.",
          data: transactionData,
        });
      }

      // 3. Re-calculate expected amount on backend (CRUCIAL for security)
      // Use totalExpectedOrderAmountKobo (from custom_offers.offer_amount_in_kobo) for calculation base
      let backendCalculatedExpectedAmountKobo: number;
      let calculatedDiscountAmountKobo: number = 0;

      switch (paystackPaymentOption) {
        case "deposit_50":
          backendCalculatedExpectedAmountKobo = Math.round(
            totalExpectedOrderAmountKobo * 0.5
          );
          break;
        case "deposit_70_discount":
          backendCalculatedExpectedAmountKobo = Math.round(
            totalExpectedOrderAmountKobo * 0.7 * (1 - 5 / 100)
          );
          calculatedDiscountAmountKobo = Math.round(
            totalExpectedOrderAmountKobo * 0.7 * (5 / 100)
          );
          break;
        case "full_100_discount":
          backendCalculatedExpectedAmountKobo = Math.round(
            totalExpectedOrderAmountKobo * (1 - 10 / 100)
          );
          calculatedDiscountAmountKobo = Math.round(
            totalExpectedOrderAmountKobo * (10 / 100)
          );
          break;
        default:
          console.error(
            `Unknown payment option received: ${paystackPaymentOption}`
          );
          throw new Error("Invalid payment option detected."); // Rollback
      }

      console.log(
        `Backend Calculated Expected Amount for Option (${paystackPaymentOption}): ${backendCalculatedExpectedAmountKobo} kobo`
      );
      console.log(
        `Actual Amount Received from Paystack: ${actualAmountKobo} kobo`
      );

      let paymentIsFraudulent = false;
      let fraudReason = "";
      let newOrderStatusId: number | undefined;

      // --- Validate Currency (Simplified as it's always NGN) ---
      if (actualCurrency !== "NGN") {
        console.warn(
          `CURRENCY MISMATCH WARNING: Order ID: ${orderId}. Expected NGN, Received: ${actualCurrency}. Proceeding but investigate.`
        );
        // You could set paymentIsFraudulent = true here if you want to strictly enforce NGN.
      }

      // --- Validate Amount ---
      // Allow a small tolerance for floating point arithmetic if necessary, but exact match is best.
      // Use a small epsilon for floating point comparison if needed, but Math.round should help.
      if (
        !paymentIsFraudulent &&
        actualAmountKobo !== backendCalculatedExpectedAmountKobo
      ) {
        console.error(
          `FRAUD/MISMATCH: Order ID ${orderId}. Amount mismatch. Backend Expected: ${backendCalculatedExpectedAmountKobo}, Actual Received: ${actualAmountKobo}`
        );
        paymentIsFraudulent = true;
        fraudReason = "amount_mismatch";
        newOrderStatusId = orderStatusMap["amount_mismatch"]; // Ensure this status exists
      }

      if (
        !paymentIsFraudulent &&
        amountPaidToDateKobo + actualAmountKobo > totalExpectedOrderAmountKobo
      ) {
        console.error(
          `FRAUD/MISMATCH: Order ID ${orderId}. Overpayment detected. Total Expected: ${totalExpectedOrderAmountKobo}, New Total Paid: ${
            amountPaidToDateKobo + actualAmountKobo
          }`
        );
        paymentIsFraudulent = true;
        fraudReason = "overpayment_detected";
        newOrderStatusId = orderStatusMap["overpayment_detected"]; // Ensure this status exists
      }

      // 4. Insert record into `payments` table
      await client.query(
        // Use client for transaction
        `INSERT INTO payments (order_id, paystack_reference, amount_kobo, currency, paystack_status, gateway_response, customer_email, is_fraudulent, created_at, updated_at, payment_option_selected, discount_applied_percentage)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW(), $9, $10)`,
        [
          order.order_id,
          reference, // Paystack reference for this specific payment
          actualAmountKobo,
          actualCurrency,
          transactionData.status, // 'success' from Paystack
          gatewayResponse,
          customerEmail,
          paymentIsFraudulent,
          paystackPaymentOption, // Store the selected option
          discountApplied, // Store the discount applied
        ]
      );
      console.log(
        `Payment record for Paystack Ref ${reference} inserted into 'payments' table, linked to order ${order.order_id}.`
      );

      // 5. Update `orders` status and amount_paid_to_date_kobo (only if payment is not fraudulent)
      if (!paymentIsFraudulent) {
        const newAmountPaidToDateKobo = amountPaidToDateKobo + actualAmountKobo;
        let calculatedOrderStatusId: number;

        // Determine new order status based on total amount paid
        if (
          newAmountPaidToDateKobo >= totalExpectedOrderAmountKobo ||
          paymentOption === "full_100_discount"
        ) {
          calculatedOrderStatusId = orderStatusMap["paid"]; // Fully paid
        } else if (newAmountPaidToDateKobo > 0) {
          calculatedOrderStatusId = orderStatusMap["partially_paid"]; // Partial payment received
        } else {
          calculatedOrderStatusId = orderStatusMap["pending"]; // Should not happen with successful payment
        }

        // If a fraud-related status was determined, prioritize it. Otherwise, use calculated.
        newOrderStatusId = newOrderStatusId || calculatedOrderStatusId;

        // Update the orders table with the new information
        await client.query(
          // Use client for transaction
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
            description, // Use offer description as order title
            totalExpectedOrderAmountKobo, // Store undiscounted offer_amount_in_kobo as total expected
            order.order_id,
          ]
        );
        console.log(
          `Order ${order.order_id} updated: New amount_paid_to_date_kobo = ${newAmountPaidToDateKobo}, Status ID = ${newOrderStatusId}, Title = ${description}, Start Date = NOW(), End Date calculated, Total Expected Amount = ${totalExpectedOrderAmountKobo}`
        );

        await client.query(
          // Use client for transaction
          `UPDATE custom_offers
                SET status_id = (SELECT offer_status_id FROM custom_offer_statuses WHERE name = 'accepted'),
                updated_at = NOW()
                WHERE offer_id = $1`,
          [offerId]
        );
        console.log(`Custom offer ${offerId} status updated to 'accepted'.`);

        // --- Grant Access to Service (Placeholder) ---
        if (newOrderStatusId === orderStatusMap["paid"]) {
          // await grantServiceAccess(customerName || customerEmail, totalExpectedOrderAmountKobo, order.order_id);
          console.log(
            `TODO: Grant full service access for ${
              customerName || customerEmail
            } (Order ID: ${order.order_id})`
          );
        } else if (newOrderStatusId === orderStatusMap["partially_paid"]) {
          // await grantPartialAccess(customerName || customerEmail, actualAmountKobo, order.order_id);
          console.log(
            `TODO: Grant partial service access or mark for follow-up for ${
              customerName || customerEmail
            } (Order ID: ${order.order_id})`
          );
        }

        // --- Send Confirmation Email (Placeholder) ---
        const finalOrderStatusName =
          Object.keys(orderStatusMap).find(
            (key) => orderStatusMap[key] === newOrderStatusId
          ) || "unknown";
        // await sendConfirmationEmail(customerName || customerEmail, order.order_id, actualAmountKobo / 100, newAmountPaidToDateKobo / 100, finalOrderStatusName);
        console.log(
          `TODO: Send confirmation email to ${
            customerName || customerEmail
          } for Order ID: ${order.order_id} (Status: ${finalOrderStatusName})`
        );
      } else {
        // Payment was fraudulent. Update order status to a fraud-related status if not already set.
        const finalFraudStatusName =
          Object.keys(orderStatusMap).find(
            (key) => orderStatusMap[key] === newOrderStatusId
          ) || "unknown_fraud";
        console.warn(
          `Payment ${reference} for Order ID ${orderId} marked as fraudulent: ${fraudReason} (Status: ${finalFraudStatusName}). No order update or service granted.`
        );
        // TODO: Send internal fraud alert email.
        if (newOrderStatusId) {
          await client.query(
            // Use client for transaction
            `UPDATE orders SET order_status_id = $1, updated_at = NOW() WHERE order_id = $2`,
            [newOrderStatusId, order.order_id]
          );
          console.log(
            `Order ${order.order_id} status updated to fraud-related status: ${newOrderStatusId}`
          );
        }
      }

      return NextResponse.json({
        success: true,
        message: "Payment verified and order updated.",
        data: transactionData,
      });
    }); // End of withTransaction
  } catch (error: any) {
    console.error(
      "Error during Paystack verification or database update:",
      error
    );
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal server error during verification.",
      },
      { status: 500 }
    );
  }
}

// Initial load of the status map when the serverless function cold starts
loadOrderStatusMap();
