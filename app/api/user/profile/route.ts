// app/api/user/profile/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"; // Import getServerSession
import { authOptions } from "@/lib/auth/auth-options";
import { queryDatabase, withTransaction } from "../../../../lib/db"; // Assuming this path is correct for your db utility
import { v4 as uuidv4 } from "uuid";
import { sendEmailChangeVerificationEmail } from "@/lib/mailer";
import { differenceInSeconds } from "date-fns";

export async function GET(request: Request) {
  try {
    // 1. Get the session using getServerSession
    const session = await getServerSession(authOptions);
    console.log(
      "[GET /api/user/profile] Session:",
      JSON.stringify(session, null, 2),
    );

    // 2. Check if the user is authenticated
    if (!session || !session.user || !session.user.email) {
      console.warn("[GET /api/user/profile] Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Optional: Check if email is verified if your profile data depends on it
    // const emailVerified = (session.user as any).email_verified;
    // if (!emailVerified) {
    //   return NextResponse.json({ error: "Email not verified" }, { status: 403 });
    // }

    // 3. Use the user's ID from the session to fetch their profile
    // Assuming you've added 'id' to your session object via NextAuth.js callbacks
    const userId = (session.user as any).id;
    console.log("[GET /api/user/profile] Fetching profile for userId:", userId);

    if (!userId) {
      // This case should ideally not happen if session is properly configured
      console.error("Session user ID is missing.");
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 400 },
      );
    }

    // 4. Fetch user profile from the database using the user ID
    const queryText = `
      SELECT 
        user_id, 
        first_name AS "firstName",
        last_name AS "lastName",
        email, 
        bio, 
        profile_picture_url AS "profileImage", 
        company_name AS "companyName", 
        phone, 
        created_at AS "memberSince", 
        email_verified AS "emailVerified"
      FROM users 
      WHERE user_id = $1`;

    const params = [userId];
    const result = await queryDatabase(queryText, params);
    console.log("[GET /api/user/profile] DB Result count:", result.length);

    if (result.length === 0) {
      console.warn(
        "[GET /api/user/profile] No profile found in DB for userId:",
        userId,
      );
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 },
      );
    }

    // Return the first (and only) row of the profile data
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// You will also need a PATCH/PUT method for updating the profile
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log(
      "[PATCH /api/user/profile] Session:",
      JSON.stringify(session, null, 2),
    );

    if (!session || !session.user || !session.user.email) {
      console.warn("[PATCH /api/user/profile] Unauthorized update attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    console.log(
      "[PATCH /api/user/profile] Updating profile for userId:",
      userId,
    );
    if (!userId) {
      console.error("Session user ID is missing for PATCH.");
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 400 },
      );
    }

    const body = await request.json();
    console.log(
      "[PATCH /api/user/profile] Request Body:",
      JSON.stringify(body, null, 2),
    );
    // Destructure and validate incoming fields
    const { fullName, bio, companyName, phone, email } = body; // Add other editable fields

    // Fetch current user data for comparison and rate limiting
    const currentUserResult = await queryDatabase(
      `SELECT email, first_name, last_name, last_verification_email_sent_at FROM users WHERE user_id = $1`,
      [userId],
    );

    if (currentUserResult.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentUser = currentUserResult[0];
    let emailChangeStarted = false;

    // Handle email change
    if (
      email &&
      email.trim().toLowerCase() !== currentUser.email.toLowerCase()
    ) {
      const newEmail = email.trim().toLowerCase();

      // Check for email uniqueness in users and pending_emails
      const existingUser = await queryDatabase(
        "SELECT user_id FROM users WHERE email = $1 OR pending_email = $1",
        [newEmail],
      );

      if (existingUser.length > 0) {
        return NextResponse.json(
          { error: "Email is already in use" },
          { status: 400 },
        );
      }

      // Rate limit check (e.g., 60 seconds)
      const lastSent = currentUser.last_verification_email_sent_at;
      if (
        lastSent &&
        differenceInSeconds(new Date(), new Date(lastSent)) < 60
      ) {
        return NextResponse.json(
          { error: "Please wait before requesting another verification email" },
          { status: 429 },
        );
      }

      const verificationToken = uuidv4();
      const expires = new Date();
      expires.setHours(expires.getHours() + 24);

      await withTransaction(async (client) => {
        // Update pending_email and last_verification_email_sent_at
        await client.query(
          "UPDATE users SET pending_email = $1, last_verification_email_sent_at = NOW() WHERE user_id = $2",
          [newEmail, userId],
        );

        // Clear any old email_change tokens for this user
        await client.query(
          "DELETE FROM verification_tokens WHERE user_id = $1 AND type = $2",
          [userId, "email_change"],
        );

        // Insert new token
        await client.query(
          "INSERT INTO verification_tokens (user_id, token, expires, type) VALUES ($1, $2, $3, $4)",
          [userId, verificationToken, expires, "email_change"],
        );
      });

      const name = `${currentUser.first_name} ${currentUser.last_name}`;
      await sendEmailChangeVerificationEmail(newEmail, verificationToken, name);
      emailChangeStarted = true;
    }

    // Construct your update query dynamically based on provided fields
    let updateFields: string[] = [];
    let updateParams: any[] = [];
    let paramIndex = 1;

    if (fullName !== undefined) {
      updateFields.push(`full_name = $${paramIndex++}`);
      updateParams.push(fullName);
    }
    if (bio !== undefined) {
      updateFields.push(`bio = $${paramIndex++}`);
      updateParams.push(bio);
    }
    if (companyName !== undefined) {
      updateFields.push(`company_name = $${paramIndex++}`);
      updateParams.push(companyName);
    }
    if (phone !== undefined) {
      updateFields.push(`phone = $${paramIndex++}`);
      updateParams.push(phone);
    }
    // Add other fields like profile_image if you implement upload

    if (updateFields.length === 0) {
      return NextResponse.json(
        { message: "No fields to update" },
        { status: 200 },
      );
    }

    updateParams.push(userId); // Add userId as the last parameter

    const updateQueryText = `
      UPDATE users 
      SET ${updateFields.join(", ")} 
      WHERE user_id = $${paramIndex} 
      RETURNING 
        user_id, 
        first_name AS "firstName",
        last_name AS "lastName",
        email, 
        bio, 
        profile_picture_url AS "profileImage", 
        company_name AS "companyName", 
        phone, 
        created_at AS "memberSince", 
        email_verified AS "emailVerified"
    `;

    console.log("[PATCH /api/user/profile] Executing Query:", updateQueryText);
    console.log(
      "[PATCH /api/user/profile] With Params:",
      JSON.stringify(updateParams, null, 2),
    );

    const updatedResult = await queryDatabase(updateQueryText, updateParams);
    console.log(
      "[PATCH /api/user/profile] Update DB Result count:",
      updatedResult.length,
    );

    if (updatedResult.length === 0) {
      return NextResponse.json(
        { error: "User not found or no update performed" },
        { status: 404 },
      );
    }

    return NextResponse.json(updatedResult[0]);
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
