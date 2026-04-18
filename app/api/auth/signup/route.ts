import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";
import { withTransaction } from "@/lib/db";
import { createTrackingId } from "@/lib/utils/tracking";
import { hash } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { sendOrderReceivedEmail, sendVerificationEmail } from "@/lib/mailer";
import { createZohoLead } from "@/lib/zoho";
import Joi from "joi";
import logger from "@/lib/logger";

// Define Joi schemas
const baseSignupSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(7)
    .max(100)
    .required()
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*?~])"))
    .message(
      "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character (!@#$%^&*?~)",
    ),
  companyName: Joi.string().max(100).allow("").optional(),
  phone: Joi.string().allow("").optional(),
  referralCode: Joi.string().allow("").optional(),
});

const enrollmentSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(7)
    .max(100)
    .required()
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*?~])"))
    .message(
      "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character (!@#$%^&*?~)",
    ),
  companyName: Joi.string().max(100).allow("").optional(),
  phone: Joi.string().allow("").optional(),
  courseId: Joi.number().optional(),
  bundle: Joi.string().allow("").optional(),
  includeHardware: Joi.boolean().optional(),
  referralCode: Joi.string().allow("").optional(),
});

const enrollExistingUserSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  companyName: Joi.string().max(100).allow("").optional(),
  phone: Joi.string().allow("").optional(),
  preferredSessionTime: Joi.string().required(),
  courseId: Joi.number().optional(),
  bundle: Joi.string().allow("").optional(),
  includeHardware: Joi.boolean().optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  try {
    const body = await req.json();

    let validationResult;
    // Determine the correct schema based on the request body and session status
    if (body.courseId || body.bundle) {
      logger.debug({ session }, "Signup session check");
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
        { status: 422 },
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
      bundle,
      includeHardware,
      referralCode,
    } = body;

    // Use a database transaction to ensure data integrity
    const result = await withTransaction(async (client) => {
      let userId;
      let orderId;
      let orderIds = [];
      let course;
      const name = `${firstName} ${lastName}`;

      // Scenario 1: Existing, authenticated user enrolling in a course
      if (session && session.user) {
        const existingUserResult = await client.query(
          "SELECT user_id FROM users WHERE email = $1",
          [email],
        );

        userId = existingUserResult.rows[0].user_id;
        if (existingUserResult.rows.length === 0) {
          // This case should ideally not happen if the session is valid, but we handle it
          throw new Error("User not found for the current session.");
        }
        logger.info({ userId }, "Enrolling existing user");
      } else {
        // Scenario 2: New user signing up, potentially with a course enrollment
        const existingUserResult = await client.query(
          "SELECT user_id FROM users WHERE email = $1",
          [email],
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
          ],
        );

        userId = insertUserResult.rows[0].user_id;

        // Handle Referral
        if (referralCode) {
          const referrerResult = await client.query(
            "SELECT user_id FROM users WHERE referral_code = $1",
            [referralCode],
          );
          logger.debug({ referrerResult }, "Referrer result");
          if (referrerResult.rows.length > 0) {
            const referrerId = referrerResult.rows[0].user_id;
            await client.query(
              "UPDATE users SET referred_by_id = $1 WHERE user_id = $2",
              [referrerId, userId],
            );
            logger.info({ userId, referrerId }, "User referred");
          }
        }
        logger.info({ userId }, "New user created");

        // Assign 'user' role
        const roleResult = await client.query(
          "SELECT role_id FROM roles WHERE role_name = 'user'",
          [],
        );
        const roleId = roleResult.rows[0].role_id;
        await client.query(
          "INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)",
          [userId, roleId],
        );

        // Send verification email
        const verificationToken = uuidv4();
        const expires = new Date();
        expires.setHours(expires.getHours() + 24);
        await client.query(
          'INSERT INTO verification_tokens ("user_id", token, expires, type) VALUES ($1, $2, $3, $4)',
          [userId, verificationToken, expires, "email_verification"],
        );

        try {
          await sendVerificationEmail(email, verificationToken, name, course);
          logger.info({ email }, "Verification email sent");

          // Add to Sender.net Marketing List
          const senderApiKey = process.env.SENDER_API_KEY;
          if (senderApiKey) {
            fetch("https://api.sender.net/v2/subscribers", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${senderApiKey}`,
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({
                email,
                firstname: firstName,
                lastname: lastName,
                // Automatically add to "marketing" list plus their specific role/course group
                groups: courseId
                  ? ["marketing", "student"]
                  : ["marketing", "user"],
              }),
            })
              .then((res) => res.json())
              .then((data) =>
                logger.info({ data }, "Sender marketing subscription result"),
              )
              .catch((err) =>
                logger.error({ err: err.message }, "Sender subscription error"),
              );
          }
        } catch (mailError) {
          logger.error({ err: mailError }, "Failed to send verification email");
        }
      }

      const hasHardware = includeHardware === true;
      if (hasHardware) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        await client.query(
          "UPDATE users SET hardware_discount_expiry = $1 WHERE user_id = $2",
          [expiryDate, userId],
        );
      }

      // Logic for course enrollment and order creation (if courseId or bundle exists)
      if (courseId || bundle) {
        const courseIds = bundle
          ? bundle.split(",").map((id) => Number(id.trim()))
          : [Number(courseId)];

        const bundleSize = courseIds.length;
        const bundleDiscount =
          bundleSize === 2 ? 0.1 : bundleSize >= 3 ? 0.2 : 0;
        const bundleGroupId = uuidv4().split("-")[0].toUpperCase();

        // Get 'student' role
        const studentRoleResult = await client.query(
          "SELECT role_id FROM roles WHERE role_name = 'student'",
          [],
        );

        const studentRoleId = studentRoleResult.rows[0].role_id;
        await client.query(
          "INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT (user_id, role_id) DO NOTHING",
          [userId, studentRoleId],
        );

        const categoryResult = await client.query(
          `SELECT category_id FROM product_categories WHERE category_name = $1`,
          ["Course"],
        );
        const categoryId = categoryResult.rows[0].category_id;

        for (const cId of courseIds) {
          const courseResult = await client.query(
            `SELECT title, description, price_in_kobo, start_date, end_date, 
                    early_bird_discount, discount_start_date, discount_end_date 
             FROM courses WHERE course_id = $1`,
            [cId],
          );
          if (courseResult.rows.length === 0) continue;

          const {
            title: courseTitle,
            description: courseDescription,
            price_in_kobo: originalPrice,
            start_date: startDate,
            end_date: endDate,
            early_bird_discount: ebDiscount,
            discount_start_date: ebStart,
            discount_end_date: ebEnd,
          } = courseResult.rows[0];

          // Calculate Price with stacking discounts
          let currentPrice = originalPrice;
          const now = new Date();
          const isEarlyBirdActive =
            ebDiscount &&
            ebStart &&
            ebEnd &&
            now >= new Date(ebStart) &&
            now <= new Date(ebEnd);

          if (isEarlyBirdActive) {
            currentPrice = Math.round(currentPrice * (1 - ebDiscount / 100));
          }

          const discountedPrice = Math.round(
            currentPrice * (1 - bundleDiscount),
          );

          const sessionResult = await client.query(
            `SELECT session_id, session_number FROM sessions WHERE course_id = $1 AND session_number = $2`,
            [cId, Number(preferredSessionTime)],
          );

          let sessionId = null;
          if (sessionResult.rows.length > 0) {
            sessionId = sessionResult.rows[0].session_id;
          } else {
            // Fallback to first session if preferred not found for this course in bundle
            const fallbackSession = await client.query(
              `SELECT session_id FROM sessions WHERE course_id = $1 LIMIT 1`,
              [cId],
            );
            sessionId = fallbackSession.rows[0]?.session_id;
          }

          const paymentStatus = discountedPrice === 0 ? "paid" : "pending";

          const paymentStatusResult = await client.query(
            "SELECT payment_status_id FROM payment_statuses WHERE name = $1",
            [paymentStatus],
          );
          const paymentStatusId =
            paymentStatusResult.rows[0]?.payment_status_id;

          // Insert into course_enrollments
          await client.query(
            `INSERT INTO course_enrollments (user_id, course_id, preferred_session_id, enrollment_date) 
            VALUES ($1, $2, $3, NOW()) ON CONFLICT (user_id, course_id) DO NOTHING`,
            [userId, cId, sessionId],
          );

          // Insert into orders table
          const bundlePrefix = bundleSize > 1 ? `BUNDLE-${bundleGroupId}-` : "";
          const trackingId = `${bundlePrefix}${createTrackingId(courseTitle)}`;

          const projectDescription =
            bundleSize > 1
              ? `${courseDescription}\n\n[Bundle Order - Group ${bundleGroupId}]`
              : courseDescription;

          const orderResult = await client.query(
            `INSERT INTO orders 
             (user_id, category_id, title, project_description, start_date, end_date, payment_status_id, total_expected_amount_kobo, tracking_id) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT (user_id, title) DO UPDATE SET
               total_expected_amount_kobo = EXCLUDED.total_expected_amount_kobo,
               tracking_id = EXCLUDED.tracking_id,
               project_description = EXCLUDED.project_description,
               payment_status_id = CASE 
                 WHEN orders.payment_status_id = 1 THEN orders.payment_status_id -- if already paid, keep paid
                 ELSE EXCLUDED.payment_status_id 
               END
             RETURNING order_id`,
            [
              userId,
              categoryId,
              courseTitle,
              projectDescription,
              startDate,
              endDate,
              paymentStatusId || 3, // Default to pending (3) if id not found
              discountedPrice,
              trackingId,
            ],
          );

          if (orderResult.rows.length > 0) {
            orderId = orderResult.rows[0].order_id;
            orderIds.push(orderResult.rows[0].order_id);
          }
        }

        // Integrate Zoho CRM for Free Courses
        if (bundleSize === 1) {
          // For simplicity, only do automated tracking for single courses or first course if free
          // We can expand this later to loop through orderIds if needed
        }

        return { userId, isNewUser: !session, orderIds };
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
        { status: 201 },
      );
    } else {
      return NextResponse.json(
        {
          message: "Course enrollment created successfully!",
          userId: result.userId,
        },
        { status: 200 },
      );
    }
  } catch (error) {
    logger.error({ err: error }, "Error during signup/enrollment");

    let message = "Failed to process request.";
    let status = 500;

    if (error instanceof Error && error.message.includes("duplicate key")) {
      if (error.message.includes("unique_user_title_orders")) {
        return NextResponse.json(
          {
            message:
              "You already have this order. Please check your dashboard.",
          },
          { status: 400 },
        );
      }
      // Redirect to dashboard if already enrolled
      return NextResponse.redirect(new URL("/user/dashboard", req.url));
    } else if (error instanceof Error && error.message.includes("not found")) {
      message = error.message;
      status = 404;
    } else if (error instanceof Error) {
      message = error.message || "An unknown error occurred.";
    } else {
      message = "An unknown error occurred.";
    }

    return NextResponse.json({ message }, { status });
  }
}
