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
        c.course_id AS id,
        title,
        description,
        created_at AS "createdAt",
        start_Date AS "startDate",
        end_date AS "endDate",
        price_in_kobo AS price,
        is_active AS "isActive",
        early_bird_discount AS "discount",
        discount_start_date AS "discountStartDate",
        discount_end_date AS "discountEndDate",
        hour_per_session AS "hours",
        s.sessions
      FROM courses c
      LEFT JOIN (
        SELECT
          course_id,
          json_agg(json_build_object(
            'datetime', session_timestamp,
            'link', session_link,
            'number', session_number
          )) AS sessions
        FROM sessions
        GROUP BY course_id
      ) s ON c.course_id = s.course_id
    WHERE c.course_id = $1;
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
