import { NextResponse } from "next/server";
import { queryDatabase } from "../../../../lib/db";
import { verifyAdmin } from "@/lib/auth/admin-auth-guard";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const guardResponse = await verifyAdmin(request);
    if (guardResponse) return guardResponse;

    const queryText = `
      SELECT CONCAT_WS(' ', first_name, last_name) AS "fullName" FROM instructors
    `;

    const instructors = await queryDatabase(queryText);

    console.log("Fetched Courses", instructors);

    return NextResponse.json(instructors); 
  } catch (error: any) {
    console.error("Error fetching instructors:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
