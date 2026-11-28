import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";
import { queryDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";

const MIN_PAYOUT_KOBO = 500000; // NGN 5,000
const FLAT_TRANSFER_FEE_KOBO = 10000; // NGN 100

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const body = await req.json();
    const { amountKobo, bankCode, bankName, accountNumber, accountName } = body;

    const requestedKobo = Number(amountKobo);
    if (isNaN(requestedKobo) || requestedKobo < MIN_PAYOUT_KOBO) {
      return NextResponse.json(
        { error: "Minimum withdrawal amount is NGN 5,000." },
        { status: 400 }
      );
    }

    if (!accountNumber || !/^\d{10}$/.test(String(accountNumber).trim())) {
      return NextResponse.json(
        { error: "A valid 10-digit NUBAN account number is required." },
        { status: 400 }
      );
    }

    // Verify user's available wallet balance
    const referralEarningsRes = await queryDatabase(
      "SELECT SUM(amount_kobo) as total FROM referral_earnings WHERE referrer_id = $1",
      [userId]
    );
    const rentalEarningsRes = await queryDatabase(
      "SELECT SUM(amount_kobo) as total FROM rental_earnings WHERE user_id = $1",
      [userId]
    );
    const usagesRes = await queryDatabase(
      "SELECT SUM(amount_kobo) as total FROM wallet_usages WHERE user_id = $1",
      [userId]
    );

    const totalEarnings =
      Number(referralEarningsRes[0]?.total || 0) +
      Number(rentalEarningsRes[0]?.total || 0);
    const totalUsed = Number(usagesRes[0]?.total || 0);
    const availableBalance = totalEarnings - totalUsed;

    if (requestedKobo > availableBalance) {
      return NextResponse.json(
        { error: "Requested payout exceeds available wallet balance." },
        { status: 400 }
      );
    }

    // Record wallet usage
    await queryDatabase(
      `INSERT INTO wallet_usages (user_id, amount_kobo, purpose, created_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
      [
        userId,
        requestedKobo,
        `Bank Payout to ${bankName || "Bank"} (${String(accountNumber).slice(-4)})`,
      ]
    );

    // Notify user of submitted payout
    try {
      await queryDatabase(
        `INSERT INTO notifications (user_id, title, message, link)
         VALUES ($1, 'Payout Request Submitted', 'Your withdrawal of NGN ' || ($2 / 100) || ' to ' || $3 || ' is being processed.', '/dashboard')`,
        [userId, requestedKobo, bankName || "Bank"]
      );
    } catch (notifErr) {
      console.error("Error creating payout notification:", notifErr);
    }

    return NextResponse.json({
      success: true,
      message: "Payout request submitted successfully.",
      payout: {
        amountKobo: requestedKobo,
        feeKobo: FLAT_TRANSFER_FEE_KOBO,
        netPayoutKobo: Math.max(0, requestedKobo - FLAT_TRANSFER_FEE_KOBO),
        bankName,
        accountNumber: String(accountNumber).slice(-4),
        accountName,
        status: "processing",
      },
    });
  } catch (error: any) {
    console.error("Error processing payout request:", error);
    return NextResponse.json(
      { error: "Internal server error processing payout." },
      { status: 500 }
    );
  }
}
