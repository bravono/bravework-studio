// app/api/admin/custom-offers/[courseId]/route.ts
import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth/admin-auth-guard";
import { queryDatabase, withTransaction } from "@/lib/db";

export const runtime = "nodejs";

// Helper function to structure flat session options into nested session groups (pairs)
// This is duplicated from the main route.ts for simplicity, but in a real app, should be imported.
function groupSessionOptions(sessionRows: any[]) {
  if (!sessionRows || sessionRows.length === 0) return [];

  sessionRows.sort((a, b) => a.sessionId - b.sessionId);

  const sessions = [];
  let sessionGroup: any[] = [];

  for (const row of sessionRows) {
    // If we encounter a new "Option 1" and we already have a group building,
    // it means the previous session is done.
    if (row.sessionNumber === 1 && sessionGroup.length > 0) {
      sessions.push({
        id: sessions.length + 1,
        options: sessionGroup,
      });
      sessionGroup = [];
    }

    sessionGroup.push({
      optionNumber: row.sessionNumber,
      link: row.link,
      datetime: row.datetime, // Fixed: Map from SQL alias 'datetime'
      label: row.label,
      duration: row.duration,
    });
  }

  // Push the last group if it exists
  if (sessionGroup.length > 0) {
    sessions.push({
      id: sessions.length + 1,
      options: sessionGroup,
    });
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
                c.thumbnail_url AS "thumbnailUrl",
                c.content,
                c.excerpt,
                c.slug
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
  { params }: { params: { courseId: string } }
) {
  try {
    const guardResponse = await verifyAdmin(request);
    if (guardResponse) return guardResponse;
    console.log("Params", params);
    const courseId = params.courseId;
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
      slug,
      content,
      excerpt,
      age_bracket: ageBracket,
      tools, // Array of tool IDs
      sessions, // Array of session groups
    } = body;

    console.log("Course ID", courseId);
    // Input Validation (Same as POST but checks for required fields only for updates)
    if (!courseId || isNaN(parseInt(courseId))) {
      return NextResponse.json({ error: "Invalid Course ID" }, { status: 400 });
    }

    // Validate sessions structure (re-used from POST)
    const hasInvalidSession = sessions.some(
      (sessionGroup: any) =>
        !sessionGroup.options ||
        sessionGroup.options.length < 1 || // Allow 1 or more options
        sessionGroup.options.length > 2 || // Max 2 options
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
            "Each session group must contain 1 or 2 options, each with valid duration, link, time, and label.",
        },
        { status: 400 }
      );
    }

    const instructorName = instructor.split(" ");
    console.log("Instructors Name", instructorName);
    if (instructorName.length < 2) {
      throw new Error("Instructor name must include first and last name.");
    }

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
                    course_category_id = $10, level = $11, language = $12, slug = $13, content = $14, excerpt = $15, age_bracket = $16
                WHERE course_id = $17;
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
        slug,
        content,
        excerpt,
        ageBracket,
        courseId,
      ];

      const updateResult = await client.query(updateCourseQuery, courseParams);
      if (updateResult.rowCount === 0) {
        throw new Error(
          `Course with ID ${courseId} not found or failed to update.`
        );
      }

      // 3. Update Tools (Delete existing and insert new)
      await client.query(`DELETE FROM course_tools WHERE course_id = $1`, [
        courseId,
      ]);

      if (tools && tools.length > 0) {
        for (const toolId of tools) {
          await client.query(
            `INSERT INTO course_tools (course_id, tool_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [courseId, toolId]
          );
        }
      }

      // 4. Clear Existing Sessions (Crucial step for transactional update)
      const deleteSessionsQuery = `DELETE FROM sessions WHERE course_id = $1;`;
      await client.query(deleteSessionsQuery, [courseId]);

      // 5. Insert NEW Sessions (two flat records per session group)
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

export async function DELETE(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const guardResponse = await verifyAdmin(request);
    if (guardResponse) return guardResponse;

    const courseId = params.courseId;
    console.log("Course to delete", courseId);
    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    const queryText = `
      DELETE FROM courses
      WHERE course_id = $1
      RETURNING course_id;
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
