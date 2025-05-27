import { NextResponse } from "next/server";
import { queryDatabase } from "../../../lib/db"; 

export async function GET(request) {
  try {
    const categories = await queryDatabase("SELECT * FROM product_categories");
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { message: "Error fetching categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newCategory = await queryDatabase(
      "INSERT INTO product_categories (category_name, category_description) VALUES ($1, $2) RETURNING *",
      data
    );

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching categories" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { category_Id } = await request.json();
    const deletedCategory = await queryDatabase(
      "DELETE FROM product_categories WHERE category_Id = $1 RETURNING *",
      [category_Id]
    );

    return NextResponse.json(deletedCategory, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error deleting category" },
      { status: 500 }
    );
  }
}
