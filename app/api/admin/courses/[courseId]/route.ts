// app/api/admin/custom-offers/[courseId]/route.ts
import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth/admin-auth-guard";
import { queryDatabase } from "@/lib/db";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = params;
    const guardResponse = await verifyAdmin(request);
    if (guardResponse) return guardResponse;

    console.log("Course ID", courseId);
    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    console.log("Body", body);

    // Whitelisted fields for dynamic updates
    const allowedFields = [
      "title",
      "price_in_kobo",
      "description",
      "start_date",
      "end_date",
      "is_active",
      "max_students",
      "thumbnail_url",
      "level",
      "language",
    ];

    let updateFields: string[] = [];
    let updateParams: any[] = [];
    let paramIndex = 1;

    // Handle dynamic fields
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        if (key === "price_in_kobo" && (isNaN(body[key]) || body[key] < 0)) {
          return NextResponse.json(
            { error: "Invalid price amount" },
            { status: 400 }
          );
        }

        updateFields.push(`${key} = $${paramIndex++}`);
        updateParams.push(body[key]);
      }
    }

    // Handle instructor name lookup
    if (body.instructor) {
      const [firstName, lastName] = body.instructor.trim().split(" ");
      const instructorQuery = `
        SELECT instructor_id FROM instructors
        WHERE first_name = $1 AND last_name = $2
        LIMIT 1;
      `;
      const instructorResult = await queryDatabase(instructorQuery, [
        firstName,
        lastName,
      ]);

      console.log("Instructor Result", instructorResult);
      if (instructorResult.length === 0) {
        return NextResponse.json(
          { error: "Instructor not found" },
          { status: 404 }
        );
      }

      const instructorId = instructorResult[0].instructor_id;
      console.log("Instructor Id", instructorId);
      updateFields.push(`instructor_id = $${paramIndex++}`);
      updateParams.push(instructorId);
    }

    // Handle course category name lookup
    if (body.course_category) {
      const categoryQuery = `
        SELECT category_id FROM course_categories
        WHERE category_name = $1
        LIMIT 1;
      `;
      const categoryResult = await queryDatabase(categoryQuery, [
        body.course_category,
      ]);

      console.log("Category Result", categoryResult);
      if (categoryResult.length === 0) {
        return NextResponse.json(
          { error: "Course category not found" },
          { status: 404 }
        );
      }

      const categoryId = categoryResult[0].id;
      console.log("Instructor Id", categoryId);

      updateFields.push(`course_category_id = $${paramIndex++}`);
      updateParams.push(categoryId);
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { message: "No fields to update" },
        { status: 200 }
      );
    }

    updateParams.push(courseId); // WHERE clause param
    console.log(`${updateFields}
      ${updateParams}`);

    const queryText = `
      UPDATE courses
      SET ${updateFields.join(", ")}
      WHERE course_id = $${paramIndex}
      RETURNING
        course_id AS id,
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

    const result = await queryDatabase(queryText, updateParams);

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Course not found or no update performed" },
        { status: 404 }
      );
    }

    const updatedCourse = result[0];

    console.log("Updated Course", updatedCourse);
    return NextResponse.json(updatedCourse);
  } catch (error: any) {
    console.error("Error updating course:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// export async function PUT(
//   request: Request,
//   { params }: { params: { courseId: string } }
// ) {
//   console.log("PUT");
//   const session = await verifyAdmin(request);
//   if (!session) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     const { courseId } = params;
//     const body = await request.json();
//     const {
//       title,
//       price,
//       description,
//       startDate,
//       endDate,
//       instructor,
//       isActive,
//       maxStudents,
//       thumbnailUrl,
//       category,
//       level,
//       language,
//     } = body;

//     if (
//       !title ||
//       !description ||
//       !instructor ||
//       !maxStudents ||
//       !level ||
//       !language
//     ) {
//       return NextResponse.json(
//         { error: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     const updateQuery = `
//       UPDATE courses
//       SET
//         title = $1,
//         price_in_kobo = $2,
//         description = $3,
//         start_date = $4,
//         end_date = $5,
//         instructor = $6,
//         is_active = $7,
//         max_students = $8,
//         thumbnail_url = $9,
//         course_category = $10,
//         level = $11,
//         language = $12
//       WHERE courseId = $13
//       RETURNING *;
//     `;
//     const updatedCourse = await queryDatabase(updateQuery, [
//       title,
//       price,
//       description,
//       startDate,
//       endDate,
//       instructor,
//       isActive,
//       maxStudents,
//       thumbnailUrl,
//       category,
//       level,
//       language,
//       courseId,
//     ]);

//     if (updatedCourse.length === 0) {
//       return NextResponse.json({ error: "Course not found" }, { status: 404 });
//     }

//     return NextResponse.json(updatedCourse[0]);
//   } catch (error) {
//     console.error(`Error updating course ${params.courseId}:`, error.message);
//     return NextResponse.json(
//       { error: "Failed to update course" },
//       { status: 500 }
//     );
//   }
// }

export async function DELETE(request: Request) {
  try {
    const guardResponse = await verifyAdmin(request);
    if (guardResponse) return guardResponse;

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("id");
    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    const queryText = `
      DELETE FROM courses
      WHERE courseId = $1
      RETURNING courseId;
    `;

    const result = await queryDatabase(queryText, [courseId]);

    if (result.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: `Course ${courseId} deleted successfully`,
    });
  } catch (error: any) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
