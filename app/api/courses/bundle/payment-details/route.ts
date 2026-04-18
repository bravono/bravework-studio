import { NextResponse } from "next/server";
import { queryDatabase } from "@/lib/db";
import { verifyUser } from "@/lib/auth/user-auth-guard";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get("ids");

    if (!idsParam) {
      return NextResponse.json({ error: "No course IDs provided" }, { status: 400 });
    }

    const courseIds = idsParam.split(",").map(id => Number(id.trim()));
    const user = await verifyUser();
    const isAuthenticated = user.isAuthenticated;
    const userId = user.userId;

    if (!isAuthenticated || !userId) {
      return NextResponse.json(
        { error: "Authentication failed. Please log in." },
        { status: 401 },
      );
    }

    // Fetch course details for all courses in bundle
    const courses = await queryDatabase(
      `SELECT course_id AS id, title, price_in_kobo AS price, description 
       FROM courses 
       WHERE course_id = ANY($1::int[])`,
      [courseIds]
    );

    if (courses.length === 0) {
      return NextResponse.json({ error: "No courses found" }, { status: 404 });
    }

    // Determine discount
    const bundleSize = courses.length;
    const bundleDiscount = bundleSize === 2 ? 0.1 : (bundleSize >= 3 ? 0.2 : 0);

    const categoryResult = await queryDatabase(
      `SELECT category_id FROM product_categories WHERE category_name = $1`,
      ["Course"],
    );
    const categoryId = categoryResult[0].category_id;

    // Find existing orders for these courses
    const orderQueryText = `
      SELECT order_id, title, total_expected_amount_kobo, tracking_id
      FROM orders
      WHERE user_id = $1 
        AND category_id = $2
        AND title = ANY($3::text[])
      ORDER BY created_at DESC
    `;

    const titles = courses.map((c: any) => c.title);
    const existingOrders = await queryDatabase(orderQueryText, [
      userId,
      categoryId,
      titles,
    ]);

    // Extract bundleGroupId from tracking_id (assuming BUNDLE-[GROUPID]-...)
    let bundleGroupId = null;
    const bundleOrder = existingOrders.find((o: any) => o.tracking_id?.startsWith("BUNDLE-"));
    if (bundleOrder) {
      bundleGroupId = bundleOrder.tracking_id.split("-")[1];
    }

    // Use the expected amount from the orders to ensure consistency with what was created in signup
    const totalAmount = existingOrders.reduce((sum: number, o: any) => sum + o.total_expected_amount_kobo, 0);

    return NextResponse.json({
      type: "bundle",
      bundleGroupId,
      courses: courses.map((c: any) => ({
        id: c.id,
        title: c.title,
        price: c.price,
        description: c.description
      })),
      orders: existingOrders.map((o: any) => ({
        orderId: o.order_id,
        title: o.title,
        amount: o.total_expected_amount_kobo
      })),
      totalAmount,
      bundleDiscount: bundleDiscount * 100
    });

  } catch (error) {
    console.error("Error fetching bundle payment details:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
