import { NextResponse } from "next/server";
import { queryDatabase } from "../../../../lib/db";
import { redirect } from "next/navigation"; // For redirection

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    redirect("/auth/error?message=No verification token provided.");
  }

  try {
    // Find the token in the database
    const tokenResult = await queryDatabase(
      'SELECT "user_id", expires FROM verification_tokens WHERE token = $1 AND type = $2',
      [token, 'email_verification']
    );
    const verificationToken = tokenResult[0];

    if (!verificationToken) {
      redirect("/auth/error?message=Invalid verification token.");
    }

    // Check if the token has expired
    const now = new Date();
    if (new Date(verificationToken.expires) < now) {
      await queryDatabase('DELETE FROM verification_tokens WHERE token = $1', [token]);
      redirect("/auth/error?message=Verification token has expired. Please sign up again.");
    }

    // Mark the user's email as verified
    await queryDatabase(
      'UPDATE users SET "email_verified" = $1 WHERE id = $2',
      [now, verificationToken.user_id]
    );

    // Delete the used token from the database
    await queryDatabase('DELETE FROM verification_tokens WHERE token = $1', [token]);

    // Redirect to a success page or login page
    redirect("/auth/signin?verified=true");

  } catch (error) {
    console.error("Error verifying email:", error);
    redirect("/auth/error?message=An error occurred during verification.");
  }
}