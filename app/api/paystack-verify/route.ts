import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto"; // Node.js built-in module for cryptographic functions

// Import your PostgreSQL database query function
import { queryDatabase } from "../../../lib/db";

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

  // Frontend sends the Paystack reference in the request body
  const { reference } = await req.json();

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
    const orderId = metadata?.orderId; // Expecting order_id directly from frontend metadata
    const paymentOption = metadata?.payment_option; // e.g., '50%', '70%', '100%'
    const paymentPercentage = parseFloat(metadata?.payment_percentage); // e.g., 50, 70, 100
    const discountApplied = parseFloat(metadata?.discount_applied); // e.g., 0, 5, 10
    const customer = metadata?.CustomerName;
    // original_amount_kobo from metadata is just for reference, backend uses DB's offer_amount_in_kobo via order's offer_id

    if (
      !orderId ||
      !paymentOption ||
      isNaN(paymentPercentage) ||
      isNaN(discountApplied)
    ) {
      console.error(
        "Missing or invalid metadata from Paystack verification response:",
        metadata
      );
      return NextResponse.json(
        { success: false, message: "Invalid payment metadata." },
        { status: 400 }
      );
    }

    // 2. Fetch Order from your database (primary entity for payment tracking)
    // Using 'order_id' as the primary key for the 'orders' table
    const orderRows = await queryDatabase(
      "SELECT * FROM orders WHERE order_id = $1",
      [orderId]
    );

    if (orderRows.length === 0) {
      console.error(`Order with ID ${orderId} not found in DB.`);
      return NextResponse.json(
        { success: false, message: "Order not found." },
        { status: 404 }
      );
    }

    let order = orderRows[0];
    const offerId = order.offer_id; // Get the associated offer_id from the order record

    if (!offerId) {
      console.error(`Order ${orderId} does not have an associated offer_id.`);
      return NextResponse.json(
        { success: false, message: "Order is not linked to an offer." },
        { status: 400 }
      );
    }

    // Fetch the custom offer details to get the true original amount, description, and duration
    const customOfferRows = await queryDatabase(
      "SELECT offer_amount_in_kobo, description, project_duration_days FROM custom_offers WHERE offer_id = $1",
      [offerId]
    );


    if (customOfferRows.length === 0) {
      console.error(
        `Custom Offer with ID ${offerId} not found for Order ${orderId}.`
      );
      return NextResponse.json(
        { success: false, message: "Associated custom offer not found." },
        { status: 404 }
      );
    }

    const { offer_amount_in_kobo, description, project_duration_days } =
      customOfferRows[0];

    // totalExpectedOrderAmountKobo will be the undiscounted value of offer_amount_in_kobo from custom_offers
    const totalExpectedOrderAmountKobo = offer_amount_in_kobo;
    const amountPaidToDateKobo = order.amount_paid_to_date_kobo || 0;

    // --- Idempotency Check for Payments Table (for this specific Paystack reference) ---
    // Link payments to orders using order_id
    const existingPaymentRows = await queryDatabase(
      "SELECT payment_id FROM payments WHERE paystack_reference = $1 AND paystack_status = $2 AND order_id = $3",
      [reference, "success", orderId]
    );

    if (existingPaymentRows.length > 0) {
      console.log(
        `Payment with Paystack reference ${reference} for order ${orderId} already processed. Skipping duplicate verification.`
      );
      return NextResponse.json({
        success: true,
        message: "Payment already processed.",
        data: transactionData,
      });
    }

    // 3. Re-calculate expected amount on backend (CRUCIAL for security)
    // Use totalExpectedOrderAmountKobo (from custom_offers.offer_amount_in_kobo) for calculation base
    const multiplier = paymentPercentage / 100;
    const calculatedAmountForOptionKobo =
      totalExpectedOrderAmountKobo * multiplier;

    let calculatedDiscountAmountKobo = Math.floor(
      calculatedAmountForOptionKobo * (discountApplied / 100)
    );
    let backendCalculatedExpectedAmountKobo =
      calculatedAmountForOptionKobo - calculatedDiscountAmountKobo;

    console.log(
      `Backend Calculated Expected Amount for Option: ${backendCalculatedExpectedAmountKobo} kobo`
    );

    console.log(
      `Actual Amount Received from Paystack: ${actualAmountKobo} kobo`
    );

    let paymentIsFraudulent = false;
    let fraudReason = "";
    let newOrderStatusId: number | undefined;

    // --- Validate Currency (Simplified as it's always NGN) ---
    // You might still want to log if actualCurrency is NOT NGN, but won't stop processing.
    if (actualCurrency !== "NGN") {
      console.warn(
        `CURRENCY MISMATCH WARNING: Order ID: ${orderId}. Expected NGN, Received: ${actualCurrency}. Proceeding but investigate.`
      );
      // You could set paymentIsFraudulent = true here if you want to strictly enforce NGN.
    }

    // --- Validate Amount ---
    // Allow a small tolerance for floating point arithmetic if necessary, but exact match is best.
    if (
      !paymentIsFraudulent &&
      actualAmountKobo !== backendCalculatedExpectedAmountKobo
    ) {
      console.error(
        `FRAUD/MISMATCH: Order ID ${orderId}. Amount mismatch. Backend Expected: ${backendCalculatedExpectedAmountKobo}, Actual Received: ${actualAmountKobo}`
      );
      paymentIsFraudulent = true;
      fraudReason = "amount_mismatch";
      newOrderStatusId = orderStatusMap["amount_mismatch"];
    }

    // --- 50% First Payment Rule (if applicable) ---
    // This check is only relevant if this is the first payment for the order
    // and the payment option is for a deposit (50% or 70%).
    if (
      !paymentIsFraudulent &&
      amountPaidToDateKobo === 0 &&
      paymentOption >= "50%"
    ) {
      const minimumFirstPaymentKobo = Math.ceil(
        totalExpectedOrderAmountKobo * 0.5
      );
      if (actualAmountKobo < minimumFirstPaymentKobo) {
        console.error(
          `FRAUD/MISMATCH: Order ID ${orderId}. First payment too low for deposit option. Expected min: ${minimumFirstPaymentKobo}, Received: ${actualAmountKobo}`
        );
        paymentIsFraudulent = true;
        fraudReason = "first_payment_too_low";
        newOrderStatusId = orderStatusMap["first_payment_too_low"];
      }
    }

    // --- Overpayment Check ---
    // This checks if the current payment, when added to previous payments, exceeds the total.
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
      newOrderStatusId = orderStatusMap["overpayment_detected"];
    }

    // 4. Insert record into `payments` table
    await queryDatabase(
      `INSERT INTO payments (order_id, paystack_reference, amount_kobo, currency, paystack_status, gateway_response, customer_email, is_fraudulent, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
      [
        order.order_id, // Corrected to order.order_id
        reference, // Paystack reference for this specific payment
        actualAmountKobo,
        actualCurrency,
        transactionData.status, // 'success' from Paystack
        gatewayResponse,
        customerEmail,
        paymentIsFraudulent,
      ]
    );
    console.log(
      `Payment record for Paystack Ref ${reference} inserted into 'payments' table, linked to order ${order.order_id}.`
    );

    // 5. Update `orders` status and amount_paid_to_date_kobo (only if payment is not fraudulent)
    if (!paymentIsFraudulent) {
      const newAmountPaidToDateKobo = amountPaidToDateKobo + actualAmountKobo;
      let calculatedOrderStatusId: number;

      if (newAmountPaidToDateKobo >= totalExpectedOrderAmountKobo) {
        calculatedOrderStatusId = orderStatusMap["paid"]; // Fully paid
      } else if (newAmountPaidToDateKobo > 0) {
        calculatedOrderStatusId = orderStatusMap["partially_paid"]; // Partial payment received
      } else {
        // This case should ideally not be hit with a charge.success event
        calculatedOrderStatusId = orderStatusMap["pending"];
      }

      // If a fraud-related status was determined, prioritize it. Otherwise, use calculated.
      newOrderStatusId = newOrderStatusId || calculatedOrderStatusId;

      // Update the orders table with the new information
      await queryDatabase(
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
          description, // 1. Insert description into title
          totalExpectedOrderAmountKobo, // 4. Insert undiscounted offer_amount_in_kobo
          order.order_id,
        ]
      );
      console.log(
        `Order ${order.order_id} updated: New amount_paid_to_date_kobo = ${newAmountPaidToDateKobo}, Status ID = ${newOrderStatusId}, Title = ${description}, Start Date = NOW(), End Date calculated, Total Expected Amount = ${totalExpectedOrderAmountKobo}`
      );

      // --- Grant Access to Service (Placeholder) ---
      if (newOrderStatusId === orderStatusMap["paid"]) {
        // await grantServiceAccess(customer?.email || customerEmail, totalExpectedOrderAmountKobo, order.order_id);
        console.log(
          `TODO: Grant full service access for ${
            customer?.email || customerEmail
          } (Order ID: ${order.order_id})`
        );
      } else if (newOrderStatusId === orderStatusMap["partially_paid"]) {
        // await grantPartialAccess(customer?.email || customerEmail, actualAmountKobo, order.order_id);
        console.log(
          `TODO: Grant partial service access or mark for follow-up for ${
            customer?.email || customerEmail
          } (Order ID: ${order.order_id})`
        );
      }

      // --- Send Confirmation Email (Placeholder) ---
      const finalOrderStatusName =
        Object.keys(orderStatusMap).find(
          (key) => orderStatusMap[key] === newOrderStatusId
        ) || "unknown";
      // await sendConfirmationEmail(customer?.email || customerEmail, order.order_id, actualAmountKobo / 100, newAmountPaidToDateKobo / 100, finalOrderStatusName);
      console.log(
        `TODO: Send confirmation email to ${
          customer?.email || customerEmail
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
        await queryDatabase(
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
  } catch (error) {
    console.error(
      "Error during Paystack verification or database update:",
      error
    );
    return NextResponse.json(
      { success: false, message: "Internal server error during verification." },
      { status: 500 }
    );
  }
}

// Initial load of the status map when the serverless function cold starts
loadOrderStatusMap();
