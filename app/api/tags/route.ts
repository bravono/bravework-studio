import { NextResponse } from "next/server";
import { queryDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const query = `
      SELECT tag_id AS id, tag_name AS name
      FROM tags
      ORDER BY tag_name ASC;
    `;
    const tags = await queryDatabase(query);
    return NextResponse.json(tags, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error: any) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
