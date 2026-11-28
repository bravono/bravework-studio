import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";
import { withTransaction } from "@/lib/db";
import { processSuccessfulOrder } from "@/lib/payment-utils";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    orderId,
    amountKobo,
    tipAmountKobo,
    serviceType,
    productId,
    orderTitle,
    projectDurationDays,
    totalExpectedAmount,
    couponCode,
  } = await req.json();

  return await withTransaction(async (client) => {
    const userId = session.user.id;

    // 1. Verify Balance
    const referralEarningsRes = await client.query(
      "SELECT SUM(amount_kobo) as total FROM referral_earnings WHERE referrer_id = $1",
      [userId]
    );
    const rentalEarningsRes = await client.query(
      "SELECT SUM(amount_kobo) as total FROM rental_earnings WHERE user_id = $1",
      [userId]
    );
    const usagesRes = await client.query(
      "SELECT SUM(amount_kobo) as total FROM wallet_usages WHERE user_id = $1",
      [userId]
    );
    const balance =
      Number(referralEarningsRes.rows[0]?.total || 0) +
      Number(rentalEarningsRes.rows[0]?.total || 0) -
      Number(usagesRes.rows[0]?.total || 0);

    if (balance < amountKobo) {
      return NextResponse.json(
        { error: "Insufficient wallet balance" },
        { status: 400 }
      );
    }

    // 2. Record Usage
    await client.query(
      "INSERT INTO wallet_usages (user_id, order_id, amount_kobo) VALUES ($1, $2, $3)",
      [userId, orderId, amountKobo]
    );

    // Handle Coupon Code
    if (couponCode) {
      const couponRes = await client.query(
        "SELECT coupon_id, creator_id FROM coupons WHERE UPPER(coupon_code) = $1",
        [couponCode.trim().toUpperCase()]
      );
      if (couponRes.rows.length > 0) {
        const couponId = couponRes.rows[0].coupon_id;
        const creatorId = couponRes.rows[0].creator_id;

        // Record coupon usage
        await client.query(
          "INSERT INTO user_coupons (user_id, coupon_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [userId, couponId]
        );

        // Link creator as referrer
        if (creatorId && creatorId !== userId) {
          await client.query(
            "UPDATE users SET referred_by_id = $1 WHERE user_id = $2 AND referred_by_id IS NULL",
            [creatorId, userId]
          );
        }
      }
    }

    // 3. Process Order
    const tipKobo = Number(tipAmountKobo || 0);
    const orderPaidKobo = Math.max(0, amountKobo - tipKobo);

    await processSuccessfulOrder(
      client,
      orderId,
      orderPaidKobo,
      totalExpectedAmount,
      orderTitle,
      projectDurationDays,
      serviceType,
      productId
    );

    // Referral commission logic for Wallet pay
    if (serviceType !== "rental") {
      const userRes = await client.query(
        "SELECT referred_by_id FROM users WHERE user_id = $1",
        [userId]
      );
      const referredById = userRes.rows[0]?.referred_by_id;

      if (referredById && orderId) {
        const existingEarnings = await client.query(
          "SELECT 1 FROM referral_earnings WHERE referred_user_id = $1 AND order_id = $2",
          [userId, orderId]
        );

        if (existingEarnings.rows.length === 0) {
          const commissionAmount = (10 / 100) * orderPaidKobo;
          await client.query(
            "INSERT INTO referral_earnings (referrer_id, referred_user_id, order_id, amount_kobo) VALUES ($1, $2, $3, $4)",
            [referredById, userId, orderId, Math.round(commissionAmount)]
          );
        }
      }
    }

    return NextResponse.json({ success: true });
  });
}
