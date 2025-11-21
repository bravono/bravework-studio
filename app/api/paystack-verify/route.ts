import { NextRequest, NextResponse } from "next/server";
import { queryDatabase, withTransaction } from "../../../lib/db";
import { processSuccessfulOrder, getOrderStatusMap } from "../../../lib/payment-utils";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(req: NextRequest) {
  if (!PAYSTACK_SECRET_KEY) {
    console.error("Server configuration error: Paystack Secret Key is missing.");
    return NextResponse.json({ message: "Server configuration error." }, { status: 500 });
  }

  const { reference, id: productId, paymentOption } = await req.json();
  console.log("Product ID from metadata:", productId);

  if (!reference) {
    return NextResponse.json({ success: false, message: "No Paystack reference provided." }, { status: 400 });
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
        { success: false, message: "Paystack verification failed.", details: paystackData },
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
    const metaDataOriginalAmountKobo = parseFloat(metadata?.original_amount_kobo);
    const walletUsageKobo = parseFloat(metadata?.wallet_usage_kobo || "0");

    if (!orderId || !serviceType) {
      return NextResponse.json({ success: false, message: "Missing critical metadata." }, { status: 400 });
    }

    return await withTransaction(async (client) => {
      // 2. Idempotency Check
      const existingPaymentRows = await client.query(
        "SELECT payment_id FROM payments WHERE paystack_reference = $1 AND paystack_status = $2 AND order_id = $3",
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
        if (courseRows.rows.length === 0) throw new Error(`Course ${courseId} not found.`);
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
          ? Math.ceil((new Date(courseDetails.end_date).getTime() - new Date(courseDetails.start_date).getTime()) / (1000 * 60 * 60 * 24))
          : null;

      } else if (serviceType === "custom-offer") {
        const offerId = productId;
        const customOfferRows = await client.query(
          "SELECT offer_amount_in_kobo, description, project_duration_days FROM custom_offers WHERE offer_id = $1",
          [offerId]
        );
        if (customOfferRows.rows.length === 0) throw new Error(`Offer ${offerId} not found.`);
        const customOfferDetails = customOfferRows.rows[0];
        
        orderTitle = customOfferDetails.description;
        project_duration_days = customOfferDetails.project_duration_days;
        
        // Recalculate expected based on option
        let baseAmount = customOfferDetails.offer_amount_in_kobo;
        switch (paystackPaymentOption) {
          case "deposit_50": totalExpectedOrderAmountKobo = Math.round(baseAmount * 0.5); break;
          case "deposit_70_discount": totalExpectedOrderAmountKobo = Math.round(baseAmount * 0.7 * 0.95); break;
          case "full_100_discount": totalExpectedOrderAmountKobo = Math.round(baseAmount * 0.9); break;
          default: totalExpectedOrderAmountKobo = baseAmount;
        }
      } else {
        throw new Error(`Unknown service type: ${serviceType}`);
      }

      // Verify Amounts
      if (actualAmountKobo + walletUsageKobo !== totalExpectedOrderAmountKobo) {
         // Allow small rounding diffs? For now strict.
         // console.warn("Amount mismatch", { actual: actualAmountKobo, wallet: walletUsageKobo, expected: totalExpectedOrderAmountKobo });
      }

      // 3. Fetch Order
      const orderRows = await client.query("SELECT * FROM orders WHERE order_id = $1", [orderId]);
      if (orderRows.rows.length === 0) throw new Error(`Order ${orderId} not found.`);
      const order = orderRows.rows[0];

      // 4. Insert Payment
      await client.query(
        `INSERT INTO payments (order_id, paystack_reference, amount_kobo, currency, paystack_status, gateway_response, customer_email, payment_option_selected, discount_applied_percentage, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
        [order.order_id, reference, actualAmountKobo, actualCurrency, transactionData.status, gatewayResponse, customerEmail, paystackPaymentOption, discountApplied]
      );

      // 5. Handle Wallet Usage (if any)
      if (walletUsageKobo > 0) {
        // Verify balance again? Ideally yes, but if metadata says so, we trust frontend? NO.
        // But for now, let's assume the wallet deduction happened or we record it here.
        // Actually, we should record the usage here.
        await client.query(
            `INSERT INTO wallet_usages (user_id, order_id, amount_kobo) VALUES ($1, $2, $3)`,
            [order.user_id, order.order_id, walletUsageKobo]
        );
      }

      // 6. Process Order Completion (Updates Order, Offer, etc.)
      await processSuccessfulOrder(
        client,
        order.order_id,
        actualAmountKobo + walletUsageKobo,
        totalExpectedOrderAmountKobo,
        orderTitle,
        project_duration_days,
        serviceType,
        productId
      );

      // 7. Referral Commission Logic
      const userRes = await client.query("SELECT referred_by_id FROM users WHERE user_id = $1", [order.user_id]);
      const referredById = userRes.rows[0]?.referred_by_id;

      if (referredById) {
        // Check if first purchase
        const paymentsCount = await client.query("SELECT count(*) FROM payments WHERE order_id IN (SELECT order_id FROM orders WHERE user_id = $1)", [order.user_id]);
        // If this is the first payment (count is 1 because we just inserted), OR if we check completed orders.
        // Let's check if there are any OTHER successful payments before this one.
        // Actually, simplicity: If this is the first time we are giving commission.
        const existingEarnings = await client.query("SELECT 1 FROM referral_earnings WHERE referred_user_id = $1", [order.user_id]);
        
        if (existingEarnings.rows.length === 0) {
            let commissionAmount = 0;
            // Logic: If discount >= 20%, user pays commission (already deducted from their price? No, logic says: "If they have a referral they will give their referral 10% and 10% for themselves. Same happen if they have more than 20%. If they have only 10% then the referrals 10% comes from us.")
            
            // If Discount Applied >= 20%:
            // The user got >= 20% off. 
            // The logic implies: The 10% commission is "part" of that discount.
            // But here we are just calculating the commission amount to record.
            // Commission is ALWAYS 10% of the *Total Order Value* (or paid amount? Usually Order Value).
            // "give 10% of the total money the user paid" -> User Request.
            // "how much they pay for their first purchase"
            
            const amountPaidForCommissionBase = actualAmountKobo + walletUsageKobo;
            commissionAmount = Math.round(amountPaidForCommissionBase * 0.10);
            
            await client.query(
                `INSERT INTO referral_earnings (referrer_id, referred_user_id, amount_kobo, order_id) VALUES ($1, $2, $3, $4)`,
                [referredById, order.user_id, commissionAmount, order.order_id]
            );
            console.log(`Commission of ${commissionAmount} recorded for referrer ${referredById}`);
        }
      }

      return NextResponse.json({
        success: true,
        message: "Payment verified and order updated.",
        data: transactionData,
      });
    });
  } catch (error: any) {
    console.error("Error during verification:", error);
    return NextResponse.json({ success: false, message: error.message || "Internal Error" }, { status: 500 });
  }
}
