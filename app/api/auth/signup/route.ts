import { NextResponse } from "next/server";
import { queryDatabase } from "../../../../lib/db";
import { hash } from "bcryptjs";
import Joi from "joi";

const signupSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(7).max(100).required(),
  companyName: Joi.string().max(100).optional(),
  phone: Joi.string().optional(),
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
    const insertUserResult = await queryDatabase(
      `INSERT INTO users 
        (first_name, last_name, email, password, company_name, phone, role_id) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING user_id`,
      [
        firstName,
        lastName,
        email,
        hashedPassword,
        companyName || null,
        phone || null,
        6, // Assuming 6 is the ID for the guest role
      ]
    );

    const newUser = insertUserResult[0];

    return NextResponse.json(
      { message: "User created successfully!", userId: newUser.user_id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error during signup:", error);
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
