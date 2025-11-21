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
    const referrals = await queryDatabase(
      `SELECT 
         u.first_name || ' ' || u.last_name as name,
         u.created_at as date_joined,
         COALESCE(re.amount_kobo, 0) as commission_earned
       FROM users u
       LEFT JOIN referral_earnings re ON re.referred_user_id = u.user_id
       WHERE u.referred_by_id = $1
       ORDER BY u.created_at DESC`,
      [session.user.id]
    );
    
    return NextResponse.json(referrals);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
