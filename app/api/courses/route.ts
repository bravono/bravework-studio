import { NextResponse } from "next/server";
import { queryDatabase } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const courseResults = await queryDatabase(`SELECT 
        c.course_id AS id,
        title,
        description,
        is_active AS "isActive",
        start_Date AS "startDate",
        end_date AS "endDate",
        max_students AS "maxStudents",
        thumbnail_url AS "thumbnailUrl",
        i.first_name AS "firstName",
        i.last_name AS "lastName",
        level,
        language,
        price_in_kobo AS amount,
        early_bird_discount AS "discount",
        discount_start_date AS "discountStartDate",
        discount_end_date AS "discountEndDate",
        i.bio
        FROM courses c
        LEFT JOIN (
        SELECT
          course_id,
          json_agg(json_build_object(
            'datetime', session_timestamp,
            'link', session_link,
            'duration, hour_per_session'
          )) AS sessions
        FROM sessions
        GROUP BY course_id
      ) s ON c.course_id = s.course_id
        LEFT JOIN instructors i ON c.instructor_id = i.instructor_id`);

    return NextResponse.json(courseResults, { status: 200 });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { message: "Error fetching courses" },
      { status: 500 }
    );
  }
}
