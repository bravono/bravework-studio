import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { queryDatabase } from "@/lib/db";
import { generateSecret, generateURI } from "otplib";
import QRCode from "qrcode";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Check if user already has MFA enabled?
  // Ideally, we shouldn't re-generate if already enabled unless requested explicitly (rotate key).
  // For now, let's allow re-generation.

  // 2. Generate Secret
  const secret = generateSecret();

  // 3. Generate otpauth URL
  const otpauth = generateURI({
    label: session.user.email,
    issuer: "Bravework Studio",
    secret,
  });

  // 4. Generate QR Code Data URL
  const qrCodeUrl = await QRCode.toDataURL(otpauth);

  // 5. Store secret in DB (temporarily or permanently? usually verify first, but strict flow requires temp storage)
  // For simplicity: Store in DB but keep enabled = false until verified.
  await queryDatabase(
    "UPDATE users SET two_factor_secret = $1, two_factor_enabled = false WHERE email = $2",
    [secret, session.user.email],
  );

  return NextResponse.json({ secret, qrCodeUrl });
}
