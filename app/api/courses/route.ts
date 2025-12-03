import { NextResponse } from "next/server";
import { queryDatabase } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const courseResults = await queryDatabase(`SELECT 
        c.course_id AS id,
        title,
        c.description,
        is_active AS "isActive",
        start_Date AS "startDate",
        end_date AS "endDate",
        max_students AS "maxStudents",
        thumbnail_url AS "thumbnailUrl",
        i.first_name AS "firstName",
        i.last_name AS "lastName",
        level,
        language,
        price_in_kobo AS price,
        early_bird_discount AS "discount",
        discount_start_date AS "discountStartDate",
        discount_end_date AS "discountEndDate",
        i.bio,
        cc.category_name AS category,
        COALESCE(t_agg.tags, '[]') AS tags
        FROM courses c
        LEFT JOIN (
        SELECT
          course_id,
          json_agg(json_build_object(
            'datetime', session_timestamp,
            'link', session_link,
            'duration', hour_per_session
          )) AS sessions
        FROM sessions
        GROUP BY course_id
      ) s ON c.course_id = s.course_id
        LEFT JOIN instructors i ON c.instructor_id = i.instructor_id
        LEFT JOIN course_categories cc ON c.course_category_id = cc.category_id
        LEFT JOIN (
          SELECT
            ct.course_id,
            json_agg(t.tag_name) AS tags
          FROM course_tags ct
          JOIN tags t ON ct.tag_id = t.tag_id
          GROUP BY ct.course_id
        ) t_agg ON c.course_id = t_agg.course_id`);

    return NextResponse.json(courseResults, { status: 200 });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { message: "Error fetching courses" },
      { status: 500 }
    );
  }
}
