import { NextResponse } from "next/server";
import { queryDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  console.log("Received GET request for courseId:", params.courseId);
  try {
    const { courseId } = params;

    console.log("Fetching course details", courseId);
    const queryText = `
      SELECT
        course_id,
        title,
        description,
        created_at AS date,
        price_in_kobo AS price,
        is_active AS "isActive"
      FROM courses 
      WHERE course_id = $1
      ORDER BY created_at DESC; 
    `;
    const result = await queryDatabase(queryText, [courseId]);

    console.log("Course fetched:", result);

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=59", // Cache for 60 seconds, allow stale for another 59s
      },
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
