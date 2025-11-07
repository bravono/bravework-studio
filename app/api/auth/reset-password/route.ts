import { NextResponse } from "next/server";
import { queryDatabase } from "@/lib/db";
import { hash } from "bcryptjs";

/**
 * Handle POST request to reset the password.
 */
export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();
    console.log("Token received:", token);
    console.log("New password received:", newPassword ? "****" : "No password");

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Token and new password are required" },
        { status: 400 }
      );
    }

    // 1. Look up the token in the database
    const tokenResult = await queryDatabase(
      "SELECT user_id, expires FROM verification_tokens WHERE token = $1",
      [token]
    );

    if (tokenResult.length === 0) {
      return NextResponse.json(
        { error: "Invalid or already used token." },
        { status: 404 }
      );
    }

    const resetToken = tokenResult[0];
    const userId = resetToken.user_id;
    const expiresAt = new Date(resetToken.expires_at); // Ensure it's a Date object

    // 2. Check if the token has expired
    if (expiresAt < new Date()) {
      await queryDatabase("DELETE FROM verification_tokens WHERE token = $1", [
        token,
      ]);
      return NextResponse.json(
        { error: "Token has expired. Please request a new link." },
        { status: 410 }
      ); // 410 Gone
    }

    const hashedPassword = await hash(newPassword, 12);
    console.log("Hashed password:", hashedPassword);

    // 4. Update the user's password in the 'users' table
    await queryDatabase("UPDATE users SET password = $1 WHERE user_id = $2", [
      hashedPassword,
      userId,
    ]);

    await queryDatabase("DELETE FROM verification_tokens WHERE token = $1", [
      token,
    ]);

    return NextResponse.json(
      {
        message:
          "Password reset successful. You can now log in with your new password.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
