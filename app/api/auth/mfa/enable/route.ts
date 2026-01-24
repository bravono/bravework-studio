import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { queryDatabase } from "@/lib/db";
import { verify } from "otplib";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { token } = await req.json();

  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  // 1. Fetch user secret
  const result = await queryDatabase(
    "SELECT two_factor_secret FROM users WHERE email = $1",
    [session.user.email],
  );
  const user = result[0];

  if (!user || !user.two_factor_secret) {
    return NextResponse.json(
      { error: "MFA setup not initiated" },
      { status: 400 },
    );
  }

  // 2. Verify token
  const isValid = await verify({ token, secret: user.two_factor_secret });

  if (!isValid) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  // 3. Enable MFA
  await queryDatabase(
    "UPDATE users SET two_factor_enabled = true WHERE email = $1",
    [session.user.email],
  );

  return NextResponse.json({ success: true, message: "MFA enabled" });
}
