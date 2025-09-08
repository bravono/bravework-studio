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

  // Frontend sends the Paystack reference and a key to identify the product
  const { reference, productId, paymentOption } = await req.json();

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
    const actualAmountKobo = transactionData.amount;
    const actualCurrency = transactionData.currency;
    const customerEmail = transactionData.customer.email;
    const gatewayResponse = transactionData.gateway_response;

    // IMPORTANT: Extract metadata sent from frontend
    const metadata = transactionData.metadata;
    const serviceType = metadata?.service;
    const orderId = metadata?.orderId;
    const customerName = metadata?.customer_name;
    const paystackPaymentOption = metadata?.payment_option;
    const paymentPercentage = parseFloat(metadata?.payment_percentage);
    const discountApplied = parseFloat(metadata?.discount_applied);
    const originalAmountKoboFromMetadata = parseFloat(
      metadata?.original_amount_kobo
    );

    // Validate essential metadata fields
    if (!orderId || !serviceType) {
      console.error("Missing critical metadata:", metadata);
      return NextResponse.json(
        { success: false, message: "Missing critical metadata." },
        { status: 400 }
      );
    }

    // Wrap all database operations in a transaction
    return await withTransaction(async (client) => {
      // 2. Idempotency Check
      const existingPaymentRows = await client.query(
        "SELECT payment_id FROM payments WHERE paystack_reference = $1 AND paystack_status = $2 AND order_id = $3",
        [reference, "success", orderId]
      );

      if (existingPaymentRows.rows.length > 0) {
        console.log(
          `Payment with Paystack reference ${reference} for order ${orderId} already processed. Skipping duplicate verification.`
        );
        return NextResponse.json({
          success: true,
          message: "Payment already processed.",
          data: transactionData,
        });
      }

      let totalExpectedOrderAmountKobo: number;
      let calculatedDiscountAmountKobo: number = 0;
      let newOrderStatusId: number;
      let project_duration_days: number | null = null;
      let orderTitle: string;
      let offerId: number;

      // --- Handle Different Service Types Based on Metadata ---
      if (serviceType === "course") {
        console.log("Processing Course payment.");
        const courseId = productId; // Assuming productId from frontend is the courseId
        if (!courseId) {
          throw new Error("Missing courseId in metadata for course payment.");
        }

        // Fetch course details
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

        // Verify amount
        if (actualAmountKobo !== totalExpectedOrderAmountKobo) {
          throw new Error(
            `Amount mismatch for course. Expected: ${totalExpectedOrderAmountKobo}, Actual: ${actualAmountKobo}`
          );
        }

        // --- Grant Access & Update Status for Course ---
        newOrderStatusId = orderStatusMap["paid"]; // Assuming course payments are always full
        console.log(
          `TODO: Grant access to course ${courseId} for ${customerName}`
        );
      } else if (serviceType === "custom-offer") {
        console.log("Processing Custom Offer payment.");
        if (
          !paystackPaymentOption ||
          isNaN(paymentPercentage) ||
          isNaN(discountApplied) ||
          isNaN(originalAmountKoboFromMetadata)
        ) {
          throw new Error("Missing or invalid metadata for custom offer.");
        }

        offerId = productId as number; // Assuming productId from frontend is the offerId
        if (!offerId) {
          throw new Error("Missing offerId for custom offer.");
        }

        // Fetch custom offer details
        const customOfferRows = await client.query(
          "SELECT offer_amount_in_kobo, description, project_duration_days FROM custom_offers WHERE offer_id = $1",
          [offerId]
        );
        if (customOfferRows.rows.length === 0) {
          throw new Error(`Custom Offer with ID ${offerId} not found.`);
        }
        const customOfferDetails = customOfferRows.rows[0];

        totalExpectedOrderAmountKobo = customOfferDetails.offer_amount_in_kobo;
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
            throw new Error(`Unknown payment option: ${paystackPaymentOption}`);
        }

        if (actualAmountKobo !== totalExpectedOrderAmountKobo) {
          throw new Error(
            `Amount mismatch for custom offer. Expected: ${totalExpectedOrderAmountKobo}, Actual: ${actualAmountKobo}`
          );
        }
      } else {
        throw new Error(`Unknown service type: ${serviceType}`);
      }

      // 3. Fetch Order from your database
      const orderRows = await client.query(
        "SELECT * FROM orders WHERE order_id = $1",
        [orderId]
      );
      if (orderRows.rows.length === 0) {
        throw new Error(`Order with ID ${orderId} not found in DB.`);
      }

      let order = orderRows.rows[0];
      const amountPaidToDateKobo = order.amount_paid_to_date_kobo || 0;

      // 4. Insert record into `payments` table
      await client.query(
        `INSERT INTO payments (order_id, paystack_reference, amount_kobo, currency, paystack_status, gateway_response, customer_email, payment_option_selected, discount_applied_percentage, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
        [
          order.order_id,
          reference,
          actualAmountKobo,
          actualCurrency,
          transactionData.status,
          gatewayResponse,
          customerEmail,
          paystackPaymentOption,
          discountApplied,
        ]
      );
      console.log(
        `Payment record for Paystack Ref ${reference} inserted into 'payments' table, linked to order ${order.order_id}.`
      );

      // 5. Update `orders` status and amount paid
      const newAmountPaidToDateKobo = amountPaidToDateKobo + actualAmountKobo;
      let calculatedOrderStatusId: number;

      if (newAmountPaidToDateKobo >= totalExpectedOrderAmountKobo) {
        calculatedOrderStatusId = orderStatusMap["paid"];
      } else if (newAmountPaidToDateKobo > 0) {
        calculatedOrderStatusId = orderStatusMap["partially_paid"];
      } else {
        calculatedOrderStatusId = orderStatusMap["pending"];
      }

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
          calculatedOrderStatusId,
          orderTitle,
          totalExpectedOrderAmountKobo,
          order.order_id,
        ]
      );
      console.log(`Order ${order.order_id} updated.`);

      // 6. Update custom offer status if applicable
      if (serviceType === "custom-offer") {
        await client.query(
          `UPDATE custom_offers
           SET status_id = (SELECT offer_status_id FROM custom_offer_statuses WHERE name = 'accepted'),
           updated_at = NOW()
           WHERE offer_id = $1`,
          [offerId]
        );
        console.log(`Custom offer ${offerId} status updated to 'accepted'.`);
      }

      // --- Grant Access & Send Confirmation Email (Placeholder) ---
      const finalOrderStatusName =
        Object.keys(orderStatusMap).find(
          (key) => orderStatusMap[key] === calculatedOrderStatusId
        ) || "unknown";
      console.log(
        `TODO: Grant access and send email to ${
          customerName || customerEmail
        } for Order ID: ${order.order_id} (Status: ${finalOrderStatusName})`
      );

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
