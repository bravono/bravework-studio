import { NextResponse } from "next/server";
import { queryDatabase } from "../../../../lib/db";
import { verifyAdmin } from "@/lib/auth/admin-auth-guard";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const guardResponse = await verifyAdmin(request);
    if (guardResponse) return guardResponse;

    const queryText = `
     SELECT category_name AS "name" FROM course_categories
    `;

    const categories = await queryDatabase(queryText);

    console.log("Fetched Courses", categories);

    return NextResponse.json(categories);
  } catch (error: any) {
    console.error("Error fetching instructors:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
