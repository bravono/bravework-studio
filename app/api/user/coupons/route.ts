import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";
import { queryDatabase } from "@/lib/db";

// GET: Fetch all coupons created by this user (if Admin or Instructor)
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userRoles = (session.user as any).roles || [];
  const isAdminOrInstructor = userRoles.some(
    (role: string) => role.toLowerCase() === "admin" || role.toLowerCase() === "instructor"
  );

  if (!isAdminOrInstructor) {
    return NextResponse.json({ error: "Access denied. Admin or Instructor role required." }, { status: 403 });
  }

  try {
    const coupons = await queryDatabase(
      `SELECT coupon_id as id, coupon_code, discount_amount, created_date, expiration_date, usage_limit,
       (SELECT COUNT(*)::int FROM user_coupons uc WHERE uc.coupon_id = c.coupon_id) as usage_count
       FROM coupons c
       WHERE creator_id = $1
       ORDER BY created_date DESC`,
      [session.user.id]
    );

    return NextResponse.json(coupons);
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// POST: Create a new coupon (Admin or Instructor)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userRoles = (session.user as any).roles || [];
  const isAdminOrInstructor = userRoles.some(
    (role: string) => role.toLowerCase() === "admin" || role.toLowerCase() === "instructor"
  );

  if (!isAdminOrInstructor) {
    return NextResponse.json({ error: "Access denied. Admin or Instructor role required." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { couponCode, expirationDate } = body;

    if (!couponCode || !expirationDate) {
      return NextResponse.json({ error: "Coupon code and expiration date are required." }, { status: 400 });
    }

    const codeUpper = couponCode.trim().toUpperCase();

    // Check if code already exists
    const existing = await queryDatabase(
      "SELECT coupon_id FROM coupons WHERE UPPER(coupon_code) = $1",
      [codeUpper]
    );

    if (existing.length > 0) {
      return NextResponse.json({ error: "Coupon code already exists." }, { status: 400 });
    }

    // Default discount amount to 10% (Option B - Fixed discount percentage)
    const discountAmount = 10.0;
    const usageLimit = 9999; // Essentially unlimited overall, but users can use once each

    const newCoupon = await queryDatabase(
      `INSERT INTO coupons (coupon_code, discount_amount, created_date, expiration_date, usage_limit, creator_id)
       VALUES ($1, $2, NOW(), $3, $4, $5)
       RETURNING coupon_id as id, coupon_code, discount_amount, expiration_date`,
      [codeUpper, discountAmount, new Date(expirationDate), usageLimit, session.user.id]
    );

    return NextResponse.json(newCoupon[0], { status: 201 });
  } catch (error) {
    console.error("Error creating coupon:", error);
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}
