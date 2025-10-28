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
        c.title,
        c.description,
        c.created_at AS "createdAt",
        c.start_date AS "startDate",
        c.end_date AS "endDate",
        c.price_in_kobo AS price,
        c.is_active AS "isActive",
        c.early_bird_discount AS "discount",
        c.discount_start_date AS "discountStartDate",
        c.discount_end_date AS "discountEndDate",
        s.session_number AS "sessionOption",
        CASE s.session_number
          WHEN 1 THEN 'Morning'
          WHEN 2 THEN 'Evening'
          ELSE 'Unknown'
        END AS "sessionLabel",
        s.sessions
      FROM courses c
      JOIN (
        SELECT
          course_id,
          session_number,
          json_agg(json_build_object(
            'datetime', session_timestamp,
            'link', session_link,
            'duration', hour_per_session
          )) AS sessions
        FROM sessions
        WHERE session_number IN (1, 2)
        GROUP BY course_id, session_number
      ) s ON c.course_id = s.course_id
      WHERE c.course_id = $1
      ORDER BY c.created_at DESC, s.session_number;
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
