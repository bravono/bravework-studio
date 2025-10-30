// app/api/admin/custom-offers/[courseId]/route.ts
import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth/admin-auth-guard";
import { queryDatabase } from "@/lib/db";

export const runtime = "nodejs";

// Helper function to structure flat session options into nested session groups (pairs)
// This is duplicated from the main route.ts for simplicity, but in a real app, should be imported.
function groupSessionOptions(sessionRows: any[]) {
  if (!sessionRows || sessionRows.length === 0) return [];

  sessionRows.sort((a, b) => a.sessionId - b.sessionId);

  const sessions = [];
  let sessionGroup: any[] = [];

  for (const row of sessionRows) {
    sessionGroup.push({
      optionNumber: row.sessionNumber,
      link: row.link,
      time: row.time,
      label: row.label,
      duration: row.duration,
    });

    if (sessionGroup.length === 2) {
      sessions.push({
        id: sessions.length + 1,
        options: sessionGroup,
      });
      sessionGroup = [];
    }
  }

  return sessions;
}

// GET by ID (optional, but good practice for editing)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const guardResponse = await verifyAdmin(request);
    if (guardResponse) return guardResponse;

    const courseId = params.id;

    // 1. Fetch the specific course with base details
    const courseQuery = `
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
                c.price_in_kobo AS price,
                cc.category_name AS category,
                c.thumbnail_url AS "thumbnailUrl"
            FROM courses c
            JOIN instructors i ON c.instructor_id = i.instructor_id
            JOIN course_categories cc ON c.course_category_id = cc.category_id
            WHERE c.course_id = $1;
        `;
    const courses = await queryDatabase(courseQuery, [courseId]);
    if (courses.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    let course = courses[0];

    // 2. Fetch sessions for this course
    const sessionsQuery = `
            SELECT
                session_id AS "sessionId",
                session_number AS "sessionNumber",
                hour_per_session AS "duration",
                session_link AS "link",
                session_timestamp AS "datetime",
                session_label AS "label"
            FROM sessions
            WHERE course_id = $1
            ORDER BY session_id;
        `;

    const courseSessions = await queryDatabase(sessionsQuery, [courseId]);

    // 3. Merge and structure sessions
    course.sessions = groupSessionOptions(courseSessions);

    // Ensure all Date objects are serialized
    if (course.startDate instanceof Date) {
      course.startDate = course.startDate.toISOString();
    }
    if (course.endDate instanceof Date) {
      course.endDate = course.endDate.toISOString();
    }

    return NextResponse.json(course);
  } catch (error: any) {
    console.error(`Error fetching course ${params.id}:`, error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PATCH (Update Course and Sessions)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // const guardResponse = await verifyAdmin(request);
    // if (guardResponse) return guardResponse;

    const courseId = params.id;
    const body = await request.json();

    const {
      title,
      price_in_kobo: price,
      description,
      start_date: startDate,
      end_date: endDate,
      instructor,
      is_active: isActive,
      max_students: maxStudents,
      thumbnail_url: thumbnailUrl,
      course_category: category,
      level,
      language,
      sessions, // Array of session groups
    } = body;

    // Input Validation (Same as POST but checks for required fields only for updates)
    if (!courseId || isNaN(parseInt(courseId))) {
      return NextResponse.json({ error: "Invalid Course ID" }, { status: 400 });
    }

    // Validate sessions structure (re-used from POST)
    const hasInvalidSession = sessions.some(
      (sessionGroup: any) =>
        !sessionGroup.options ||
        sessionGroup.options.length !== 2 ||
        sessionGroup.options.some(
          (option: any) =>
            !option.duration ||
            isNaN(parseInt(option.duration)) ||
            !option.link ||
            !option.time ||
            !option.label ||
            !option.optionNumber
        )
    );

    if (hasInvalidSession) {
      return NextResponse.json(
        {
          error:
            "Each session group must contain exactly two options (1 and 2), each with valid duration, link, time, and label.",
        },
        { status: 400 }
      );
    }

    const instructorName = instructor.split(" ");
    if (instructorName.length < 2) {
      throw new Error("Instructor name must include first and last name.");
    }

    // Placeholder for database transaction logic - replace with your actual implementation
    const withTransaction = async (callback: (client: any) => Promise<any>) => {
      const client = {
        query: async (sql: string, params: any[]) => {
          // Mock database responses for demonstration
          if (sql.includes("SELECT instructor_id")) {
            return { rows: [{ instructor_id: 101 }] };
          }
          if (sql.includes("SELECT category_id")) {
            return { rows: [{ category_id: 202 }] };
          }
          if (sql.includes("UPDATE courses")) {
            return { rowCount: 1 };
          }
          return { rows: [] };
        },
      };
      return await callback(client);
    };

    return await withTransaction(async (client) => {
      // 1. Find Instructor and Category IDs (required for update)
      const instructorResult = await client.query(
        `SELECT instructor_id FROM instructors WHERE first_name = $1 AND last_name = $2`,
        [instructorName[0], instructorName[1]]
      );
      const instructorId = instructorResult.rows[0]?.instructor_id;
      if (!instructorId) throw new Error("Instructor not found.");

      const categoryResult = await client.query(
        `SELECT category_id FROM course_categories WHERE category_name = $1`,
        [category]
      );
      const categoryId = categoryResult.rows[0]?.category_id;
      if (!categoryId) throw new Error("Category not found.");

      // 2. Update Base Course
      const updateCourseQuery = `
                UPDATE courses SET
                    title = $1, price_in_kobo = $2, description = $3, start_date = $4, end_date = $5, 
                    instructor_id = $6, is_active = $7, max_students = $8, thumbnail_url = $9, 
                    course_category_id = $10, level = $11, language = $12
                WHERE course_id = $13;
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
        courseId,
      ];

      const updateResult = await client.query(updateCourseQuery, courseParams);
      if (updateResult.rowCount === 0) {
        throw new Error(
          `Course with ID ${courseId} not found or failed to update.`
        );
      }

      // 3. Clear Existing Sessions (Crucial step for transactional update)
      const deleteSessionsQuery = `DELETE FROM sessions WHERE course_id = $1;`;
      await client.query(deleteSessionsQuery, [courseId]);

      // 4. Insert NEW Sessions (two flat records per session group)
      for (const sessionGroup of sessions) {
        for (const option of sessionGroup.options) {
          const sessionInsertQuery = `
                        INSERT INTO sessions (course_id, session_number, hour_per_session, session_link, session_timestamp, session_label)
                        VALUES ($1, $2, $3, $4, $5, $6);
                    `;

          const sessionParams = [
            courseId,
            option.optionNumber,
            option.duration,
            option.link,
            option.time,
            option.label,
          ];

          await client.query(sessionInsertQuery, sessionParams);
        }
      }

      return NextResponse.json(
        { courseId, message: "Course and sessions updated successfully" },
        { status: 200 }
      );
    });
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
