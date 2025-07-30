import { NextResponse } from "next/server";
import { queryDatabase, withTransaction } from "../../../lib/db";
import { createTrackingId } from "../../../lib/utils/tracking";

export async function GET(request: Request) {
  try {
    const orders = await queryDatabase("SELECT * FROM orders");
    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { message: "Error fetching orders" },
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
        "SELECT user_id FROM users WHERE email = $1",
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

      const orderResult = await client.query(
        "INSERT INTO orders (project_description, budget_range, timeline, user_id, category_id, tracking_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING order_id",
        [projectDescription, budget, timeline, userId, serviceId, trackingId]
      );
      const newOrderId = orderResult.rows[0].order_id;

      if (Array.isArray(files) && files.length > 0) {
        for (const file of files) {
          const { fileName, fileSize, fileUrl } = file;
          await client.query(
            "INSERT INTO order_files (order_id, file_name, file_size, file_url) VALUES ($1, $2, $3, $4)",
            [newOrderId, fileName, fileSize, fileUrl]
          );
        }
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
