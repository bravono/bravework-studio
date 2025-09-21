import { NextResponse } from "next/server";
import { queryDatabase } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const invoices = await queryDatabase("SELECT * FROM invoices");
    return NextResponse.json(invoices, { status: 200 });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { message: "Error fetching invoices" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newCoupon = await queryDatabase(
      "INSERT INTO invoices (coupon_code, discount_amount, expiration_date) VALUES ($1, $2, $3) RETURNING *",
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
