import { NextResponse } from "next/server";
import { queryDatabase, withTransaction } from "../../../../lib/db";
import { createTrackingId } from "../../../../lib/utils/tracking";
import { sendOrderReceivedEmail } from "lib/mailer";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // 1. Get the session to authenticate the user
    const session = await getServerSession(authOptions);

    // 2. Check if the user is authenticated
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3. Get the user ID from the session
    // Ensure 'id' is added to your session object via NextAuth.js callbacks
    const userId = (session.user as any).id;

    if (!userId) {
      console.error("Session user ID is missing when fetching orders.");
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 400 }
      );
    }

    // 4. Fetch orders from the database where order's user_id matches the current user's ID
    // Adjust column names (e.g., 'user_id', 'order_id', 'category_id', 'created_at', 'order_status_id', 'total_expected_amount_kobo', 'amount_paid_to_date_kobo')
    // to match your actual 'orders' table schema.
    // Use aliases (AS "camelCase") to match your frontend Order interface.
    const queryText = `
      SELECT
        order_id AS id,
        category_id AS service,
        created_at AS date,
        order_status_id AS status,
        total_expected_amount_kobo AS amount,
        amount_paid_to_date_kobo AS amountPaid
      FROM orders
      WHERE user_id = $1
      ORDER BY created_at DESC; -- Order by most recent orders first
    `;

    const params = [userId];
    const result = await queryDatabase(queryText, params);

    // 5. Return the fetched orders
    // Add a revalidate option to the response to control caching behavior.
    // This tells Next.js how long to cache the response of this API route.
    // For example, revalidate every 60 seconds.
    // Note: This 'revalidate' option is typically used with `fetch` in Server Components
    // or when calling `fetch` directly in a Route Handler.
    // When a client component calls this API route, Next.js will cache its response
    // based on default caching rules, or you can explicitly control it on the client-side fetch.
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=59", // Cache for 60 seconds, allow stale for another 59s
      },
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const fields = [
      "serviceId",
      "firstName",
      "lastName",
      "companyName",
      "email",
      "phone",
      "projectDescription",
      "budget",
      "timeline",
      "files",
    ];

    const [
      serviceId,
      firstName,
      lastName,
      companyName,
      email,
      phone,
      projectDescription,
      budget,
      timeline,
      filesRaw,
    ] = fields.map((field) => formData.get(field));

    // Convert file to array from string
    let files: any[] = [];
    if (typeof filesRaw === "string") {
      try {
        files = JSON.parse(filesRaw);
      } catch {
        files = [];
      }
    }

    return await withTransaction(async (client) => {
      const serviceResult = await client.query(
        "SELECT category_name FROM product_categories WHERE category_id = $1",
        [serviceId]
      );

      const serviceType = serviceResult.rows[0]?.category_name;

      const trackingId = createTrackingId(
        typeof serviceType === "string" ? serviceType : ""
      );

      // Check if user with the given email already exists
      const existingUserResult = await client.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );

      let userId: number;
      if (existingUserResult.rows.length > 0) {
        // User exists, use their id
        userId = existingUserResult.rows[0].user_id;
      } else {
        // User does not exist, insert new user
        const userResult = await client.query(
          "INSERT INTO users (first_name, last_name, email, phone, company_name) VALUES ($1, $2, $3, $4, $5) RETURNING user_id",
          [firstName, lastName, email, phone, companyName]
        );
        userId = userResult.rows[0].user_id;
      }

      const orderStatus = await client.query(
        "SELECT order_status_id FROM order_statuses WHERE name = $1",
        ["pending"]
      );

      const orderStatusId = orderStatus.rows[0]?.order_status_id;

      const orderResult = await client.query(
        "INSERT INTO orders (project_description, order_status_id, budget_range, timeline, user_id, category_id, tracking_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING order_id, budget_range",
        [
          projectDescription,
          orderStatusId,
          budget,
          timeline,
          userId,
          serviceId,
          trackingId,
        ]
      );
      const newOrderId = orderResult.rows[0].order_id;
      const newOrderBudget = orderResult.rows[0].budget_range;

      const notificationTitle = "New Order Available!";
      const notificationMessage = `You have received a new order for Order ID ${newOrderId}. Amount: $${newOrderBudget}.`;

      const notificationLink = `/admin/dashboard/notifications/${newOrderId}`; // Link for in-app notification

      await client.query(
        `INSERT INTO notifications (
    user_id, title, message, link
  ) VALUES ($1, $2, $3, $4)`,
        [userId, notificationTitle, notificationMessage, notificationLink]
      );

      if (Array.isArray(files) && files.length > 0) {
        for (const file of files) {
          const { fileName, fileSize, fileUrl } = file;
          await client.query(
            "INSERT INTO order_files (order_id, file_name, file_size, file_url) VALUES ($1, $2, $3, $4)",
            [newOrderId, fileName, fileSize, fileUrl]
          );
        }
      }

      const userResult = existingUserResult.rows[0];
      const clientName = `${userResult.first_name} ${userResult.last_name}`;
      const userEmail = userResult.email;

      try {
        console.log("About to send order received email")
        await sendOrderReceivedEmail(userEmail, clientName, newOrderId);
      } catch (error) {
        console.log("Couldn't send order confirmation email")
      }

      return NextResponse.json(newOrderId, { status: 201 });
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { message: "Error creating order" },
      { status: 500 }
    );
  }
}
