import { NextResponse } from "next/server";
import { queryDatabase } from "@/lib/db";
import { cleanImageUrl } from "@/lib/utils/cleanImageUrl";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } },
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
        c.is_published AS "isPublished",
        c.max_students AS "maxStudents",
        c.thumbnail_url AS "thumbnailUrl",
        c.level,
        c.language,
        c.slug,
        c.is_for_kids AS "isForKids",
        c.parent_course_id AS "parentCourseId",
        c.early_bird_discount AS "discount",
        c.discount_start_date AS "discountStartDate",
        c.discount_end_date AS "discountEndDate",
        c.content,
        c.excerpt,
        CONCAT_WS(' ', i.first_name, i.last_name) AS instructor,
        i.first_name AS "firstName",
        i.last_name AS "lastName",
        cc.category_name AS category,
        s.session_number AS "sessionOption",
        CASE s.session_number
          WHEN 1 THEN 'Morning'
          WHEN 2 THEN 'Evening'
          ELSE 'Unknown'
        END AS "sessionLabel",
        s.sessions,
        ct_agg.tools AS software,
        (SELECT json_agg(course_id) FROM courses WHERE parent_course_id = c.course_id) AS "childCourseIds",
        c.duration
      FROM courses c
      LEFT JOIN instructors i ON c.instructor_id = i.instructor_id
      LEFT JOIN course_categories cc ON c.course_category_id = cc.category_id
      LEFT JOIN (
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
      LEFT JOIN (
        SELECT
          ct.course_id,
          json_agg(json_build_object(
            'id', t.tool_id,
            'name', t.name
          )) AS tools
        FROM course_tools ct
        JOIN tools t ON ct.tool_id = t.tool_id
        GROUP BY ct.course_id
      ) ct_agg ON c.course_id = ct_agg.course_id
      WHERE c.course_id = $1
      ORDER BY c.created_at DESC, s.session_number;
    `;
    const result = await queryDatabase(queryText, [courseId]);

    const sanitizedResult = result.map((course: any) => ({
      ...course,
      thumbnailUrl: cleanImageUrl(course.thumbnailUrl),
    }));

    console.log("Course fetched:", sanitizedResult);

    return NextResponse.json(sanitizedResult, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=59", // Cache for 60 seconds, allow stale for another 59s
      },
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
