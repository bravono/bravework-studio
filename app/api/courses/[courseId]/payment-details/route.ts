import { NextResponse } from "next/server";
import { queryDatabase } from "@/lib/db";
import { verifyUser } from "@/lib/auth/user-auth-guard";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = params;
    const user = await verifyUser();
    const isAuthenticated = user.isAuthenticated;
    const userId = user.userId;

    if (!isAuthenticated || !userId) {
      return NextResponse.json(
        { error: "Authentication failed. Please log in." },
        { status: 401 }
      );
    }

    // Fetch the course details
    const queryText = `
      SELECT
        c.course_id AS id,
        c.title,
        c.price_in_kobo AS price,
        c.description,
        c.start_date AS "startDate",
        c.end_date AS "endDate",
        c.is_active AS "isActive"
      FROM courses c
      WHERE c.course_id = $1;
    `;

    const result = await queryDatabase(queryText, [courseId]);

    if (result.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const course = result[0];

    // Check if course is active and can be purchased
    if (!course.isActive) {
      return NextResponse.json(
        { error: "This course is not currently available for enrollment" },
        { status: 400 }
      );
    }

    // Check if user already has an order for this course
    const orderQueryText = `
      SELECT order_id
      FROM orders
      WHERE user_id = $1 
        AND category_id = $2
        AND payment_status_id IN (1, 2, 6);
    `;

    const existingOrders = await queryDatabase(orderQueryText, [
      userId,
      courseId,
    ]);

    let orderId: number;

    if (existingOrders.length > 0) {
      // Use existing order
      orderId = existingOrders[0].order_id;
    } else {
      const categoryResult = await queryDatabase(
        `SELECT category_id FROM product_categories WHERE category_name = $1`,
        ["Course"]
      );

      console.log("Category Result", categoryResult);
      if (categoryResult[0] === 0) {
        NextResponse.json(
          { message: "Order category not found" },
          { status: 404 }
        );
      }

      const categoryId = categoryResult[0].category_id;
      const paid = 1;
      // Create a new order for this course
      const createOrderQuery = `
        INSERT INTO orders (user_id, category_id, payment_status_id, project_description, created_at)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING order_id;
      `;

      const newOrder = await queryDatabase(createOrderQuery, [
        userId,
        categoryId,
        paid,
        `Course Enrollment: ${course.title}`,
      ]);

      orderId = newOrder[0].order_id;
    }

    // Return in the format expected by PaymentContent.tsx
    return NextResponse.json({
      type: "course",
      data: {
        id: course.id,
        title: course.title,
        price: course.price, // in Kobo
        description: course.description,
        startDate: course.startDate,
        endDate: course.endDate,
      },
      orderId: orderId,
    });
  } catch (error) {
    console.error("Error fetching course payment details:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
