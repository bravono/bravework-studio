import { NextResponse } from "next/server";
import { queryDatabase, withTransaction } from "@/lib/db";
import { hash } from "bcryptjs";
import { v4 as uuidv4 } from "uuid"; // For generating verification tokens
import { sendVerificationEmail } from "../../../../lib/mailer"; // Import your mailer utility
import Joi from "joi";

const baseSignupSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(7).max(100).required(),
  companyName: Joi.string().max(100).allow("").optional(),
  phone: Joi.string().allow("").optional(),
});

const enrollmentSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(7).max(100).required(),
  companyName: Joi.string().max(100).allow("").optional(),
  phone: Joi.string().allow("").optional(),
  preferredSessionTime: Joi.string().required(),
  courseId: Joi.number().required(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    let validationResult;
    // Check for a unique field to determine the schema
    if (body.courseId) {
      validationResult = enrollmentSchema.validate(body);
    } else {
      validationResult = baseSignupSchema.validate(body);
    }

    if (validationResult.error) {
      return NextResponse.json(
        { message: validationResult.error.details[0].message },
        { status: 422 }
      );
    }

    const {
      firstName,
      lastName,
      email,
      password,
      companyName,
      phone,
      preferredSessionTime,
      courseId,
    } = body;

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

    // If user exists, get role "student" and assign to user
    if (newUserId) {
      console.log("Getting student role for user with session");
      const studentRoleResult = await queryDatabase(
        "SELECT * FROM roles WHERE role_name = ($1)",
        ["student"]
      );

      console.log("Student Role Result", studentRoleResult);
      const studentRoleId = studentRoleResult[0].role_id;

      // Assign "student" role to user
      console.log("Assigning student role to user");
      await queryDatabase(
        "INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)",
        [newUserId, studentRoleId]
      );

      // Select pending from order_statuses
      console.log("Getting pending status for enrollment");
      const paymentStatusResult = await queryDatabase(
        "SELECT * FROM order_statuses WHERE name = $1",
        ["pending"]
      );
      const paymentStatusId = paymentStatusResult[0].order_status_id;

      // Get the session ID based on courseId
      const sessionResult = await queryDatabase(
        `SELECT session_id FROM sessions 
          WHERE course_id = $1 AND session_time = $2`,
        [courseId, preferredSessionTime]
      );

      console.log("Session Result", sessionResult);

      if (sessionResult.length === 0) {
        return NextResponse.json(
          { message: "No session found for the selected time." },
          { status: 422 }
        );
      }
      console.log("Session Result", sessionResult);
      const sessionId = sessionResult[0].session_id;

      // Insert into course_enrollments if sessionId exists
      console.log("Enrolling user in course with session");
      await queryDatabase(
        `INSERT INTO course_enrollments (user_id, payment_status, course_id, preferred_session_id, enrollment_date) VALUES ($1, $2, $3, $4, NOW())`,
        [newUserId, paymentStatusId, courseId, sessionId]
      );
    }

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

    try {
      console.log("About to send verification email");
      await sendVerificationEmail(email, verificationToken, name);
    } catch (error) {
      console.log("Failed to send verification email", error.message);
    }

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
