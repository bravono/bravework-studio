import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";
import { queryDatabase } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ error: "Coupon code is required." }, { status: 400 });
    }

    const codeUpper = code.trim().toUpperCase();

    // Fetch the coupon details
    const couponRows = await queryDatabase(
      `SELECT coupon_id as id, coupon_code, discount_amount, expiration_date, usage_limit
       FROM coupons
       WHERE UPPER(coupon_code) = $1`,
      [codeUpper]
    );

    if (couponRows.length === 0) {
      return NextResponse.json({ error: "Invalid coupon code." }, { status: 404 });
    }

    const coupon = couponRows[0];

    // Check expiration
    if (new Date(coupon.expiration_date) < new Date()) {
      return NextResponse.json({ error: "Coupon has expired." }, { status: 400 });
    }

    // Check if user has already used this coupon
    const usedRows = await queryDatabase(
      "SELECT 1 FROM user_coupons WHERE user_id = $1 AND coupon_id = $2",
      [session.user.id, coupon.id]
    );

    if (usedRows.length > 0) {
      return NextResponse.json({ error: "You have already used this coupon." }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      id: coupon.id,
      code: coupon.coupon_code,
      discountPercentage: parseFloat(coupon.discount_amount),
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    return NextResponse.json({ error: "Server error during coupon validation." }, { status: 500 });
  }
}
