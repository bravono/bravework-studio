import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";
import { queryDatabase, withTransaction } from "@/lib/db";
import { createTrackingId } from "@/lib/utils/tracking";
import { hash } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { sendOrderReceivedEmail, sendVerificationEmail } from "@/lib/mailer";
import Joi from "joi";

// Define Joi schemas
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

const enrollExistingUserSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  companyName: Joi.string().max(100).allow("").optional(),
  phone: Joi.string().allow("").optional(),
  preferredSessionTime: Joi.string().required(),
  courseId: Joi.number().required(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  try {
    const body = await req.json();

    let validationResult;
    // Determine the correct schema based on the request body and session status
    if (body.courseId) {
      console.log("Session", session);
      if (session && session.user) {
        validationResult = enrollExistingUserSchema.validate(body);
      } else {
        validationResult = enrollmentSchema.validate(body);
      }
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

    // Use a database transaction to ensure data integrity
    const result = await withTransaction(async (client) => {
      let userId;
      let orderId;
      let course;
      const name = `${firstName} ${lastName}`;

      // Scenario 1: Existing, authenticated user enrolling in a course
      if (session && session.user) {
        const existingUserResult = await client.query(
          "SELECT user_id FROM users WHERE email = $1",
          [email]
        );

        userId = existingUserResult.rows[0].user_id;
        if (existingUserResult.length === 0) {
          // This case should ideally not happen if the session is valid, but we handle it
          throw new Error("User not found for the current session.");
        }
        console.log("Enrolling existing user with ID:", userId);
      } else {
        // Scenario 2: New user signing up, potentially with a course enrollment
        const existingUserResult = await client.query(
          "SELECT user_id FROM users WHERE email = $1",
          [email]
        );

        if (existingUserResult.rows.length > 0) {
          throw new Error("A user with this email already exists.");
        }

        const hashedPassword = await hash(password, 12);

        // Insert new user
        const insertUserResult = await client.query(
          `INSERT INTO users
          (first_name, last_name, email, password, company_name, phone)
          VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id`,
          [
            firstName,
            lastName,
            email,
            hashedPassword,
            companyName || null,
            phone || null,
          ]
        );

        userId = insertUserResult.rows[0].user_id;
        console.log("New user created with ID:", userId);

        // Assign 'user' role
        const roleResult = await client.query(
          "SELECT role_id FROM roles WHERE role_name = 'user'",
          []
        );
        const roleId = roleResult.rows[0].role_id;
        await client.query(
          "INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)",
          [userId, roleId]
        );

        // Send verification email
        const verificationToken = uuidv4();
        const expires = new Date();
        expires.setHours(expires.getHours() + 24);
        await client.query(
          'INSERT INTO verification_tokens ("user_id", token, expires, type) VALUES ($1, $2, $3, $4)',
          [userId, verificationToken, expires, "email_verification"]
        );

        try {
          await sendVerificationEmail(email, verificationToken, name, course);
          console.log(`Verification email sent to ${email}`);
        } catch (mailError) {
          console.error("Failed to send verification email:", mailError);
          // Don't fail the entire transaction for a mailer error
        }
      }

      // Logic for course enrollment and order creation (if courseId exists)
      if (courseId) {
        // Get 'student' role
        const studentRoleResult = await client.query(
          "SELECT role_id FROM roles WHERE role_name = 'student'",
          []
        );

        const studentRoleId = studentRoleResult.rows[0].role_id;
        // Assign 'student' role to the user, this also handles the case for a logged-in user
        await client.query(
          "INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT (user_id, role_id) DO NOTHING",
          [userId, studentRoleId]
        );

        // Fetch course details
        const courseResult = await client.query(
          "SELECT title, description, price_in_kobo, start_date, end_date FROM courses WHERE course_id = $1",
          [courseId]
        );
        if (courseResult.length === 0) {
          throw new Error("Course not found.");
        }
        const {
          title: courseTitle,
          description: courseDescription,
          price_in_kobo: price,
          start_date: startDate,
          end_date: endDate,
        } = courseResult.rows[0];

        course = courseTitle;

        // Fetch session ID
        const sessionResult = await client.query(
          `SELECT session_id, session_number FROM sessions WHERE course_id = $1 AND session_number = $2`,
          [courseId, Number(preferredSessionTime)]
        );
        if (sessionResult.length === 0) {
          throw new Error("No session found for the selected time.");
        }

        const { session_id: sessionId, session_number: sessionNumber } =
          sessionResult.rows[0];
        console.log("Session Id", sessionId);

        const paymentStatus = price === 0 ? "paid" : "pending";

        // Fetch 'pending' order status
        const paymentStatusResult = await client.query(
          "SELECT order_status_id FROM order_statuses WHERE name = $1",
          [paymentStatus]
        );

        const paymentStatusId = paymentStatusResult.rows[0].order_status_id;
        console.log("Preferred session time:", preferredSessionTime);

        // Insert into course_enrollments, preventing duplicates with ON CONFLICT
        await client.query(
          `INSERT INTO course_enrollments (user_id, payment_status, course_id, preferred_session_id, enrollment_date) 
          VALUES ($1, $2, $3, $4, NOW()) ON CONFLICT (user_id, course_id) DO NOTHING`,
          [userId, paymentStatusId, courseId, sessionId]
        );

        const categoryResult = await client.query(
          `SELECT category_id FROM product_categories WHERE category_name = $1`,
          ["Course"]
        );

        const categoryId = categoryResult.rows[0].category_id;
        // Insert into orders table
        const trackingId = createTrackingId(courseTitle);
        const orderResult = await client.query(
          `INSERT INTO orders 
          (user_id, category_id, title, project_description, start_date, end_date, order_status_id, total_expected_amount_kobo, tracking_id) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING order_id`,
          [
            userId,
            categoryId,
            courseTitle,
            courseDescription,
            startDate,
            endDate,
            paymentStatusId,
            price,
            trackingId,
          ]
        );

        orderId = orderResult.rows[0].order_id;
        console.log("Course order ID:", orderId);

        try {
          await sendOrderReceivedEmail(email, name, orderId, course);
          console.log(`Course order email sent to ${email}`);
        } catch (mailError) {
          console.error("Failed to send course order email:", mailError);
        }
        return { userId, isNewUser: !session };
      }

      try {
        await sendOrderReceivedEmail(email, name, orderId, course);
        console.log(`Course order email sent to ${email}`);
      } catch (mailError) {
        console.error("Failed to send course order email:", mailError);
      }

      return { userId, isNewUser: !session };
    });

    // Final response based on the transaction result
    if (result.isNewUser) {
      return NextResponse.json(
        {
          message:
            "User created successfully! Please check your email to verify your account.",
          userId: result.userId,
        },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        {
          message: "Course enrollment created successfully!",
          userId: result.userId,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error during signup/enrollment:", error);

    let message = "Failed to process request.";
    let status = 500;

    if (
      error.message.includes("duplicate key value violates unique constraint")
    ) {
      message = "A user with this email already exists.";
      status = 422;
    } else if (error.message.includes("not found")) {
      message = error.message;
      status = 404;
    } else {
      message = error.message || "An unknown error occurred.";
    }

    return NextResponse.json({ message }, { status });
  }
}
