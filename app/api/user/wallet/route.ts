import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";
import { queryDatabase } from "@/lib/db";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const referralEarningsRes = await queryDatabase(
      "SELECT SUM(amount_kobo) as total FROM referral_earnings WHERE referrer_id = $1",
      [session.user.id]
    );
    const rentalEarningsRes = await queryDatabase(
      "SELECT SUM(amount_kobo) as total FROM rental_earnings WHERE user_id = $1",
      [session.user.id]
    );
    const usagesRes = await queryDatabase(
      "SELECT SUM(amount_kobo) as total FROM wallet_usages WHERE user_id = $1",
      [session.user.id]
    );

    const totalEarnings =
      Number(referralEarningsRes[0]?.total || 0) +
      Number(rentalEarningsRes[0]?.total || 0);
    const totalUsed = Number(usagesRes[0]?.total || 0);
    const balance = totalEarnings - totalUsed;

    return NextResponse.json({
      balance,
      breakdown: {
        referral: Number(referralEarningsRes[0]?.total || 0),
        rental: Number(rentalEarningsRes[0]?.total || 0),
        used: totalUsed,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
