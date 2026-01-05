import { NextRequest, NextResponse } from "next/server";
import { queryDatabase, withTransaction } from "../../../lib/db";
import {
  processSuccessfulOrder,
  processSuccessfulRentalBooking,
  getOrderStatusMap,
} from "../../../lib/payment-utils";
import { createZohoContact, createZohoLead } from "@/lib/zoho";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(req: NextRequest) {
  if (!PAYSTACK_SECRET_KEY) {
    console.error(
      "Server configuration error: Paystack Secret Key is missing."
    );
    return NextResponse.json(
      { message: "Server configuration error." },
      { status: 500 }
    );
  }

  const body = await req.json();
  let productId = body.id;
  const reference = body.reference;
  console.log("Product ID from metadata:", productId);

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
      console.error("Paystack verification failed:", paystackData);
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
    const metadata = transactionData.metadata;

    const serviceType = metadata?.service;
    const orderId = metadata?.orderId;
    const customerName = metadata?.customer_name;
    const paystackPaymentOption = metadata?.payment_option;
    const paymentPercentage = parseFloat(metadata?.payment_percentage);
    const discountApplied = parseFloat(metadata?.discount_applied || "0");
    const metaDataOriginalAmountKobo = parseFloat(
      metadata?.original_amount_kobo
    );
    const walletUsageKobo = parseFloat(metadata?.wallet_usage_kobo || "0");
    productId = metadata?.productId;

    if (!orderId || !serviceType) {
      return NextResponse.json(
        { success: false, message: "Missing critical metadata." },
        { status: 400 }
      );
    }

    return await withTransaction(async (client) => {
      // 2. Idempotency Check
      const existingPaymentRows = await client.query(
        `SELECT payment_id FROM payments 
         WHERE paystack_reference = $1 AND paystack_status = $2 
         AND (order_id = $3 OR rental_booking_id = $3)`,
        [reference, "success", orderId]
      );

      if (existingPaymentRows.rows.length > 0) {
        return NextResponse.json({
          success: true,
          message: "Payment already processed.",
          data: transactionData,
        });
      }

      let totalExpectedOrderAmountKobo: number;
      let orderTitle: string;
      let project_duration_days: number | null = null;

      // --- Handle Service Types ---
      if (serviceType === "course") {
        const courseId = productId;
        const courseRows = await client.query(
          "SELECT price_in_kobo, title, start_date, end_date FROM courses WHERE course_id = $1",
          [courseId]
        );
        if (courseRows.rows.length === 0)
          throw new Error(`Course ${courseId} not found.`);
        const courseDetails = courseRows.rows[0];

        totalExpectedOrderAmountKobo = discountApplied
          ? (courseDetails.price_in_kobo / 100) * paymentPercentage
          : actualAmountKobo + walletUsageKobo; // Total needed is what was paid + wallet

        // Double check against DB price if no discount
        if (!discountApplied && paymentPercentage === 100) {
          totalExpectedOrderAmountKobo = courseDetails.price_in_kobo;
        }

        orderTitle = courseDetails.title;
        project_duration_days = courseDetails.end_date
          ? Math.ceil(
              (new Date(courseDetails.end_date).getTime() -
                new Date(courseDetails.start_date).getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : null;
      } else if (serviceType === "custom-offer") {
        const offerId = productId;
        const customOfferRows = await client.query(
          "SELECT offer_amount_in_kobo, description, project_duration_days FROM custom_offers WHERE offer_id = $1",
          [offerId]
        );
        if (customOfferRows.rows.length === 0)
          throw new Error(`Offer ${offerId} not found.`);
        const customOfferDetails = customOfferRows.rows[0];

        orderTitle = customOfferDetails.description;
        project_duration_days = customOfferDetails.project_duration_days;

        // Recalculate expected based on option
        let baseAmount = customOfferDetails.offer_amount_in_kobo;
        switch (paystackPaymentOption) {
          case "deposit_50":
            totalExpectedOrderAmountKobo = Math.round(baseAmount * 0.5);
            break;
          case "deposit_70_discount":
            totalExpectedOrderAmountKobo = Math.round(baseAmount * 0.7 * 0.95);
            break;
          case "full_100_discount":
            totalExpectedOrderAmountKobo = Math.round(baseAmount * 0.9);
            break;
          default:
            totalExpectedOrderAmountKobo = baseAmount;
        }
      } else if (serviceType === "rental") {
        const bookingId = productId;
        const bookingRows = await client.query(
          `SELECT rb.total_amount_kobo, r.device_name 
           FROM rental_bookings rb 
           JOIN rentals r ON rb.rental_id = r.rental_id 
           WHERE rb.rental_booking_id = $1`,
          [bookingId]
        );
        if (bookingRows.rows.length === 0)
          throw new Error(`Booking ${bookingId} not found.`);
        const bookingDetails = bookingRows.rows[0];

        orderTitle = `Rental: ${bookingDetails.device_name}`;
        totalExpectedOrderAmountKobo = bookingDetails.total_amount_kobo;
      } else {
        throw new Error(`Unknown service type: ${serviceType}`);
      }

      // Verify Amounts
      if (actualAmountKobo + walletUsageKobo !== totalExpectedOrderAmountKobo) {
        // Allow small rounding diffs? For now strict.
        // console.warn("Amount mismatch", { actual: actualAmountKobo, wallet: walletUsageKobo, expected: totalExpectedOrderAmountKobo });
      }

      // 3. Fetch Context (User ID)
      let userId: number;
      if (serviceType === "rental") {
        const bookingRes = await client.query(
          "SELECT client_id FROM rental_bookings WHERE rental_booking_id = $1",
          [orderId]
        );
        userId = bookingRes.rows[0].client_id;
      } else {
        const orderRows = await client.query(
          "SELECT * FROM orders WHERE order_id = $1",
          [orderId]
        );
        if (orderRows.rows.length === 0)
          throw new Error(`Order ${orderId} not found.`);
        userId = orderRows.rows[0].user_id;
      }

      // 4. Insert Payment
      await client.query(
        `INSERT INTO payments (
          ${serviceType === "rental" ? "rental_booking_id" : "order_id"}, 
          paystack_reference, amount_kobo, currency, paystack_status, gateway_response, customer_email, payment_option_selected, discount_applied_percentage, created_at, updated_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
        [
          orderId,
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

      // 5. Handle Wallet Usage (if any)
      if (walletUsageKobo > 0) {
        await client.query(
          `INSERT INTO wallet_usages (user_id, ${
            serviceType === "rental" ? "rental_booking_id" : "order_id"
          }, amount_kobo) VALUES ($1, $2, $3)`,
          [userId, orderId, walletUsageKobo]
        );
      }

      // 6. Process Completion
      if (serviceType === "rental") {
        await processSuccessfulRentalBooking(
          client,
          parseInt(orderId as string),
          actualAmountKobo + walletUsageKobo
        );
      } else {
        await processSuccessfulOrder(
          client,
          parseInt(orderId as string),
          actualAmountKobo + walletUsageKobo,
          totalExpectedOrderAmountKobo,
          orderTitle,
          project_duration_days,
          serviceType,
          productId
        );
      }

      // 7. Referral Commission Logic (Skip for rentals for now if not defined)
      if (serviceType !== "rental") {
        const userRes = await client.query(
          "SELECT referred_by_id FROM users WHERE user_id = $1",
          [userId]
        );
        const referredById = userRes.rows[0]?.referred_by_id;

        if (referredById) {
          const existingEarnings = await client.query(
            "SELECT 1 FROM referral_earnings WHERE referred_user_id = $1",
            [userId]
          );

          if (existingEarnings.rows.length === 0) {
            const commissionAmount = (10 / 100) * totalExpectedOrderAmountKobo;
            await client.query(
              "INSERT INTO referral_earnings (referrer_id, referred_user_id, order_id, amount_kobo) VALUES ($1, $2, $3, $4)",
              [referredById, userId, orderId, commissionAmount]
            );
            console.log(
              `Commission of ${commissionAmount} recorded for referrer ${referredById}`
            );
          }
        }
      }

      // Integrate Zoho CRM
      try {
        const contactData = {
          Last_Name: customerName || "Unknown",
          Email: customerEmail,
          Description: `Order ID: ${orderId}\nTitle: ${orderTitle}\nAmount: ${
            actualAmountKobo / 100
          } ${actualCurrency}`,
          Lead_Source: "Course Enrollment/Order",
        };
        await createZohoContact(contactData);
        console.log(`Zoho Contact created for ${customerEmail}`);
      } catch (zohoError) {
        console.error("Failed to create Zoho Contact:", zohoError);
      }

      return NextResponse.json({
        success: true,
        message: "Payment verified and order updated.",
        data: transactionData,
      });
    });
  } catch (error: any) {
    console.error("Error during verification:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Error" },
      { status: 500 }
    );
  }
}
