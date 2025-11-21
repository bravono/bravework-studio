import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";
import { queryDatabase } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rows = await queryDatabase(
      "SELECT referral_code FROM users WHERE user_id = $1",
      [session.user.id]
    );
    return NextResponse.json({ referralCode: rows[0]?.referral_code });
  } catch (error) {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Generate a simple 8-char code
    const code = uuidv4().substring(0, 8).toUpperCase();
    
    await queryDatabase(
      "UPDATE users SET referral_code = $1 WHERE user_id = $2 AND referral_code IS NULL",
      [code, session.user.id]
    );
    
    return NextResponse.json({ referralCode: code });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate code" }, { status: 500 });
  }
}
