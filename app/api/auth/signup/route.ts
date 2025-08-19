import { NextResponse } from "next/server";
import { queryDatabase, withTransaction } from "@/lib/db";
import { hash } from "bcryptjs";
import { v4 as uuidv4 } from "uuid"; // For generating verification tokens
import { sendVerificationEmail } from "../../../../lib/mailer"; // Import your mailer utility
import Joi from "joi";

const signupSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(7).max(100).required(),
  companyName: Joi.string().max(100).allow("").optional(),
  phone: Joi.string().allow("").optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Joi validation
    const { error } = signupSchema.validate(body);
    if (error) {
      return NextResponse.json(
        { message: error.details[0].message },
        { status: 422 }
      );
    }

    const { firstName, lastName, email, password, companyName, phone } = body;

    // Check if user already exists
    const existingUserResult = await queryDatabase(
      "SELECT user_id FROM users WHERE email = $1",
      [email]
    );
    if (existingUserResult.length > 0) {
      return NextResponse.json(
        { message: "User already exists with that email." },
        { status: 422 }
      );
    }

    const hashedPassword = await hash(password, 12); // Hash password

    // Insert new user with guest role
    console.log("Creating User");
    const insertUserResult = await queryDatabase(
      `INSERT INTO users 
        (first_name, last_name, email, password, company_name, phone, email_verified) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING user_id`,
      [
        firstName,
        lastName,
        email,
        hashedPassword,
        companyName || null,
        phone || null,
        null, // email_verified is null initially
      ]
    );

    console.log("User Result", insertUserResult);
    const newUserId = insertUserResult[0].user_id;
    console.log("New User Id", newUserId);

    console.log("Getting role for user");
    const roleResult = await queryDatabase(
      "SELECT * FROM roles WHERE role_name = ($1)",
      ["user"]
    );

    console.log("Role Result", roleResult);
    const roleId = roleResult[0].role_id;

    // Insert user role into user_roles table
    console.log("Assigning role to user");
    await queryDatabase(
      "INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)",
      [newUserId, roleId]
    );

    // Generate a verification token
    const verificationToken = uuidv4();
    const expires = new Date();
    expires.setHours(expires.getHours() + 24); // Token valid for 24 hours

    // Store the verification token in the database
    console.log("Adding verification token to the db with userId", newUserId);
    await queryDatabase(
      'INSERT INTO verification_tokens ("user_id", token, expires, type) VALUES ($1, $2, $3, $4)',
      [newUserId, verificationToken, expires, "email_verification"]
    );

    // Send the verification email (non-blocking)
    const name = `${firstName} ${lastName}`;
    console.log(
      `Sending verification email to ${email} with token ${verificationToken}`
    );
    await sendVerificationEmail(email, verificationToken, name);

    return NextResponse.json(
      { message: "User created successfully!", newUserId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error during signup:", error.message);
    if (
      error instanceof Error &&
      error.message.includes("duplicate key value violates unique constraint")
    ) {
      return NextResponse.json(
        { message: "A user with this email already exists." },
        { status: 422 }
      );
    }
    return NextResponse.json(
      {
        message: "Failed to create user.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
