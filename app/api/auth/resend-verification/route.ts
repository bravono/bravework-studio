import { NextResponse } from "next/server";
import {
  sendVerificationEmail,
  sendEmailChangeVerificationEmail,
} from "@/lib/mailer";
import { queryDatabase, withTransaction } from "@/lib/db";
import { v4 as uuidv4 } from "uuid"; // For generating verification tokens
import { differenceInSeconds } from "date-fns";

export const runtime = "nodejs";

export async function POST(request: Request) {
  console.log("Beginning to resend verification email");
  try {
    const email = (await request.json()).email?.trim().toLowerCase();
    console.log("Received email", email);

    // Find user by current email or pending email
    const userResult = await queryDatabase(
      `SELECT user_id, first_name, last_name, email, pending_email, last_verification_email_sent_at AS "lastVerification" FROM users WHERE email = $1 OR pending_email = $1`,
      [email],
    );

    if (!userResult.length) {
      return NextResponse.json(
        { error: "User not found with that email" },
        { status: 404 },
      );
    }

    const user = userResult[0];
    const userId = user.user_id;
    const isEmailChange = user.pending_email === email;

    const verifyTokenResult = await queryDatabase(
      "SELECT * FROM verification_tokens WHERE user_id = $1",
      [userId],
    );
    console.log(
      `Token Result ${verifyTokenResult}, for user with ID ${userId}`,
    );

    let verificationToken = verifyTokenResult[0]?.token;
    let expirationDate = verifyTokenResult[0]?.expires;
    const now = new Date();
    const lastSent = user.lastVerification;
    const secondsSinceLast = lastSent
      ? differenceInSeconds(now, new Date(lastSent))
      : Infinity;

    // Rate limit: 60 seconds
    if (secondsSinceLast < 60) {
      return NextResponse.json(
        {
          message: `Please wait ${Math.ceil(60 - secondsSinceLast)} more seconds before requesting another email.`,
        },
        { status: 429 },
      );
    }

    // If token doesn't exist or is expired, generate a new one
    if (!verificationToken || now > new Date(expirationDate)) {
      console.log("Verification token missing or expired. Creating new one");
      verificationToken = uuidv4();
      const expires = new Date();
      expires.setHours(expires.getHours() + 24); // Token valid for 24 hours

      await withTransaction(async (client) => {
        await client.query(
          "DELETE FROM verification_tokens WHERE user_id = $1",
          [userId],
        );

        await client.query(
          "INSERT INTO verification_tokens (user_id, token, expires, type) VALUES ($1, $2, $3, $4)",
          [
            userId,
            verificationToken,
            expires,
            isEmailChange ? "email_change" : "email_verification",
          ],
        );

        // Update last_verification_email_sent_at
        await client.query(
          "UPDATE users SET last_verification_email_sent_at = NOW() WHERE user_id = $1",
          [userId],
        );
      });
    } else {
      // Token exists and is valid, just update last_verification_email_sent_at
      await queryDatabase(
        "UPDATE users SET last_verification_email_sent_at = NOW() WHERE user_id = $1",
        [userId],
      );
    }

    const name = `${user.first_name} ${user.last_name}`;

    console.log(
      `Email: ${email}, Verification Token: ${verificationToken} Name: ${name}, IsChange: ${isEmailChange}`,
    );

    try {
      console.log("About to send verification email...");
      if (isEmailChange) {
        await sendEmailChangeVerificationEmail(email, verificationToken, name);
      } else {
        await sendVerificationEmail(email, verificationToken, name);
      }
      console.log("Verification email sent.");
    } catch (error) {
      console.error("Failed to send verification email:", error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "Verification email sent",
      status: 201,
    });
  } catch (error) {
    console.log("Couldn't resend new verification email", error.message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
