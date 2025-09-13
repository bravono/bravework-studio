import { NextResponse } from "next/server";
import { queryDatabase } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const courseResults = await queryDatabase(`SELECT 
        course_id AS id,
        title,
        description,
        is_active AS "isActive",
        start_Date AS "startDate",
        end_date AS endDate,
        max_students AS "maxStudents",
        thumbnail_url AS "thumbnailUrl",
        i.first_name AS "firstName",
        i.last_name AS "lastName",
        level,
        language,
        price_in_kobo AS amount,
        i.bio
        FROM courses c
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

export async function POST(request: Request) {
  try {
    const {} = await request.json();
    await queryDatabase(
      `INSERT INTO (title, description, is_active, start_date, end_date, instructor_id, max_students, thumbnail_url, course_category_id, level, language, price_in_kobo, created_at)`,
      []
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Error creating course" },
      { status: 500 }
    );
  }
}
