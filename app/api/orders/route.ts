import { NextResponse } from "next/server";
import { queryDatabase } from "../../../lib/db";

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
};

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newOrder = await queryDatabase(
      "INSERT INTO orders (user_id, product_id, quantity, total_price, order_date) VALUES ($1, $2, $3, $4, NOW()) RETURNING *",
      [data.user_id, data.product_id, data.quantity, data.total_price]
    );
    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { message: "Error creating order" },
      { status: 500 }
    );
  }
}