import { NextResponse } from "next/server";
import { queryDatabase } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const query = `
      SELECT tool_id AS id, name
      FROM tools
      ORDER BY name ASC;
    `;
    const tools = await queryDatabase(query);
    return NextResponse.json(tools);
  } catch (error: any) {
    console.error("Error fetching tools:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
