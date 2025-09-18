import { NextResponse } from "next/server";
import { queryDatabase, withTransaction } from "../../../../lib/db";
import { verifyAdmin } from "@/lib/auth/admin-auth-guard";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const guardResponse = await verifyAdmin(request);
    if (guardResponse) return guardResponse;

    // Fetch all courses
    const queryText = `
     SELECT
      c.course_id AS id,
      c.title,
      c.description,
      c.is_active AS "isActive",
      c.start_date AS "startDate",
      c.end_date AS "endDate",
      CONCAT(i.first_name, ' ', i.last_name) AS instructor,
      c.max_students AS "maxStudents",
      c.level,
      c.language,
      c.price_in_kobo AS price
    FROM courses c
    JOIN instructors i ON c.instructor_id = i.instructor_id
    ORDER BY c.created_at DESC;
    `;

    const courses = await queryDatabase(queryText);

    console.log("Fetched Courses", courses);
    // Manually convert Date objects to ISO strings for JSON serialization
    const serializableCourses = courses.map((course: any) => {
      if (course.createdAt instanceof Date) {
        course.createdAt = course.createdAt.toISOString();
      }
      return course;
    });

    console.log("Fetched courses:", serializableCourses[0]); // Log first for brevity
    return NextResponse.json(serializableCourses); // Return the full array
  } catch (error: any) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" }, // Ensure error is serializable
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const guardResponse = await verifyAdmin(request);
    if (guardResponse) return guardResponse;

    const body = await request.json(); // Admin Panel will send JSON, not formData for course creation
    console.log(body);
    const {
      title,
      price,
      description,
      startDate,
      endDate,
      instructor,
      isActive,
      maxStudents,
      thumbnailUrl,
      category,
      level,
      language,
    } = body;

    if (
      !title ||
      !description ||
      !instructor ||
      !maxStudents ||
      !level ||
      !language
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: orderId, userId, offerAmount, description",
        },
        { status: 400 }
      );
    }
    if (isNaN(price) || price < 0) {
      return NextResponse.json(
        { error: "Invalid offer amount" },
        { status: 400 }
      );
    }

    const instructorName = instructor.split(" ");

    return await withTransaction(async (client) => {
      const instructorResult = await client.query(
        `
        SELECT * FROM instructors WHERE first_name = $1 AND last_name = $2
        `,
        [instructorName[0], instructorName[1]]
      );

      const instructorId = instructorResult.rows[0].instructor_id;

      const categoryResult = await client.query(
        `
        SELECT * FROM course_categories WHERE category_name = $1
        `,
        [category]
      );

      console.log("Category Result", categoryResult);
      const categoryId = categoryResult.rows[0].category_id;

      const insertOfferQuery = `
        INSERT INTO courses (
          title,
          price_in_kobo,
          description,
          start_date,
          end_date,
          instructor_id,
          is_active,
          max_students,
          thumbnail_url,
          course_category_id,
          level,
          language,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
        RETURNING
          course_id,
          title,
          price_in_kobo,
          description,
          start_date,
          end_date,
          instructor_id,
          is_active,
          max_students,
          thumbnail_url,
          course_category_id,
          level,
          language;
      `;
      const courseParams = [
        title,
        price,
        description,
        startDate,
        endDate,
        instructorId,
        isActive,
        maxStudents,
        thumbnailUrl,
        categoryId,
        level,
        language,
      ];

      const courseResult = await client.query(insertOfferQuery, courseParams);

      if (courseResult.rows.length === 0) {
        throw new Error("Failed to create course.");
      }

      return NextResponse.json(courseResult, { status: 201 }); // Return the full new offer object
    });
  } catch (error: any) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}


