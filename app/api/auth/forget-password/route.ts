import { sendPasswordResetEmail } from "@/lib/mailer";
import { NextResponse } from "next/server";
import { queryDatabase } from "@/lib/db";
import { generateSecureToken } from "@/lib/utils/generateToken";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // 1. Find the user in the database
    const user = await queryDatabase("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    let userId;
    let userEmail;
    let userName;

    if (user.length > 0) {
      userId = user[0].user_id;
      userEmail = user[0].email;
      userName = `${user[0].first_name} ${user[0].last_name}`;
    }

    if (userId) {
      // 3. Generate a secure, time-limited token
      const obj = await generateSecureToken(userId);

      // 5. Send the email with the reset link
      const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${obj.token}`;
      await sendPasswordResetEmail(
        userEmail,
        userName,
        resetLink,
        obj.expiration
      );
    }

    // Always return a success message, even if the user wasn't found (for security)
    return NextResponse.json(
      {
        message:
          "If an account with that email exists, a password reset link has been sent to your inbox.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forget password API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// You can optionally add a generic GET handler to prevent direct access
export async function GET() {
  return NextResponse.json({ message: "Method Not Allowed" }, { status: 405 });
}
