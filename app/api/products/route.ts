import { NextResponse } from "next/server";
import { queryDatabase } from "../../../lib/db";

export async function GET(request: Request) {
  try {
    const products = await queryDatabase("SELECT * FROM products");
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { message: "Error fetching products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json(); // Parse the request body
    const newProduct = await queryDatabase(
      "INSERT INTO products (product_name, product_description, price, category_id) VALUES ($1, $2, $3, $4) RETURNING *",
      data
    );

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { message: "Error creating product" },
      { status: 500 }
    );
  }
}
