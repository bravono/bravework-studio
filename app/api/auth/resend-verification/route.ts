import { NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/mailer";
import { queryDatabase, withTransaction } from "@/lib/db";
import { v4 as uuidv4 } from "uuid"; // For generating verification tokens
import { differenceInHours } from "date-fns";

export async function POST(request: Request) {
  console.log("Begining to resend verification email");
  try {
    const email = (await request.json()).email?.trim().toLowerCase();
    console.log("Received email", email);

    const userResult = await queryDatabase(
      `SELECT user_id, first_name, last_name, last_verification_email_sent_at AS "lastVerification" FROM users WHERE email = $1`,
      [email]
    );

    if (!userResult.length) {
      return NextResponse.json(
        { error: "User not found with that email" },
        { status: 404 }
      );
    }

    const userId = userResult[0].user_id;

    const verifyTokenResult = await queryDatabase(
      "SELECT token, expires FROM verification_tokens vt WHERE vt.user_id = $1",
      [userId]
    );
    console.log("Token", verifyTokenResult);

    let verificationToken = verifyTokenResult[0]?.token;
    const expirationDate = verifyTokenResult[0]?.expires_at;
    const now = new Date();
    const lastSent = userResult[0].lastVerification;
    const hoursSinceLast = lastSent
      ? differenceInHours(now, new Date(lastSent))
      : Infinity;

    if (hoursSinceLast < 24) {
      return NextResponse.json({
        message: `You can request a new verification email in ${Math.ceil(
          24 - hoursSinceLast
        )} hour(s).`,
      });
    }

    if (now > expirationDate) {
      console.log("Verification has expired. Creating new one");
      verificationToken = uuidv4();
      const expires = new Date();
      expires.setHours(expires.getHours() + 24); // Token valid for 24 hours

      await withTransaction(async (client) => {
        await client.query(
          "DELETE FROM verification_tokens vt WHERE vt.user_id = $1",
          [userId]
        );

        await client.query(
          'INSERT INTO verification_tokens ("user_id", token, expires, type) VALUES ($1, $2, $3, $4)',
          [userId, verificationToken, expires, "email_verification"]
        );
      });
    }

    const name = `${userResult[0].first_name} ${userResult[0].last_name}`;

    console.log(
      `Email: ${email}, Verification Token: ${verificationToken} Name: ${name}`
    );

    sendVerificationEmail(email, verificationToken, name);

    return NextResponse.json({
      message: "New verification email sent",
      status: 201,
    });
  } catch (error) {
    console.log("Couldn't resend new verification email", error.message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
