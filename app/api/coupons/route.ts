import { NextResponse } from "next/server";
import { queryDatabase } from "../../../lib/db";

export async function GET(request: Request) {
  try {
    const coupons = await queryDatabase("SELECT * FROM coupons");
    return NextResponse.json(coupons, { status: 200 });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json(
      { message: "Error fetching coupons" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newCoupon = await queryDatabase(
      "INSERT INTO coupons (coupon_code, discount_amount, expiration_date) VALUES ($1, $2, $3) RETURNING *",
      data
    );
    return NextResponse.json(newCoupon, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error creating coupon" },
      { status: 500 }
    );
  }
}
