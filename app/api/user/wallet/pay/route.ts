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
    serviceType,
    productId,
    orderTitle,
    projectDurationDays,
    totalExpectedAmount,
  } = await req.json();

  return await withTransaction(async (client) => {
    // 1. Verify Balance
    const referralEarningsRes = await client.query(
      "SELECT SUM(amount_kobo) as total FROM referral_earnings WHERE referrer_id = $1",
      [session.user.id]
    );
    const rentalEarningsRes = await client.query(
      "SELECT SUM(amount_kobo) as total FROM rental_earnings WHERE user_id = $1",
      [session.user.id]
    );
    const usagesRes = await client.query(
      "SELECT SUM(amount_kobo) as total FROM wallet_usages WHERE user_id = $1",
      [session.user.id]
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
      [session.user.id, orderId, amountKobo]
    );

    // 3. Process Order
    await processSuccessfulOrder(
      client,
      orderId,
      amountKobo,
      totalExpectedAmount,
      orderTitle,
      projectDurationDays,
      serviceType,
      productId
    );

    return NextResponse.json({ success: true });
  });
}
