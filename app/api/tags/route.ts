import { NextResponse } from "next/server";
import { queryDatabase } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const query = `
      SELECT tag_id AS id, tag_name AS name
      FROM tags
      ORDER BY tag_name ASC;
    `;
    const tags = await queryDatabase(query);
    return NextResponse.json(tags);
  } catch (error: any) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
