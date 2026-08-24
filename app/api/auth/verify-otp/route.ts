import { NextResponse } from "next/server";
import { queryDatabase } from "@/lib/db";
import logger from "@/lib/logger";

// Support CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-CSRF-Token",
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { message: "Email and OTP code are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    logger.info({ email: cleanEmail, otp: cleanOtp }, "Processing mobile OTP verification");

    // 1. Find user by email
    const usersResult = await queryDatabase(
      "SELECT user_id, email, email_verified FROM users WHERE LOWER(email) = $1",
      [cleanEmail]
    );

    if (usersResult.length === 0) {
      return NextResponse.json(
        { message: "No account found with this email address." },
        { status: 404 }
      );
    }

    const user = usersResult[0];

    // If already verified
    if (user.email_verified) {
      return NextResponse.json(
        { success: true, message: "Account is already verified. You may sign in." },
        { status: 200 }
      );
    }

    // 2. Check verification token (matches 6-digit OTP or mobile_otp / email_verification)
    const tokenResult = await queryDatabase(
      `SELECT id, token, expires FROM verification_tokens 
       WHERE user_id = $1 AND token = $2 
       ORDER BY created_at DESC LIMIT 1`,
      [user.user_id, cleanOtp]
    );

    if (tokenResult.length === 0) {
      return NextResponse.json(
        { message: "Invalid verification code. Please double-check the OTP entered." },
        { status: 400 }
      );
    }

    const verificationToken = tokenResult[0];
    const now = new Date();

    if (new Date(verificationToken.expires) < now) {
      // Delete expired token
      await queryDatabase("DELETE FROM verification_tokens WHERE id = $1", [
        verificationToken.id,
      ]);
      return NextResponse.json(
        { message: "The verification code has expired. Please request a new code." },
        { status: 400 }
      );
    }

    // 3. Mark user as verified
    await queryDatabase(
      "UPDATE users SET email_verified = NOW(), updated_at = NOW() WHERE user_id = $1",
      [user.user_id]
    );

    // 4. Delete used tokens for this user
    await queryDatabase(
      "DELETE FROM verification_tokens WHERE user_id = $1",
      [user.user_id]
    );

    logger.info({ userId: user.user_id, email: cleanEmail }, "User successfully verified via mobile OTP");

    return NextResponse.json(
      {
        success: true,
        message: "Email verified successfully! You can now log in.",
        userId: user.user_id,
        email: cleanEmail,
      },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error: any) {
    logger.error({ err: error }, "Error during OTP verification");
    return NextResponse.json(
      { message: error.message || "An unexpected error occurred during OTP verification." },
      { status: 500 }
    );
  }
}
