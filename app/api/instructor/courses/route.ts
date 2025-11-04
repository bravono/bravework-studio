import { NextResponse } from "next/server";
import { queryDatabase, withTransaction } from "@/lib/db";
import { verifyInstructor } from "@/lib/auth/instructor-auth-guard";
import { InstructorAuthSession } from "@/lib/auth/instructor-auth-guard";

export const runtime = "nodejs";

// Helper function to structure flat session options into nested session groups (pairs)
function groupSessionOptions(sessionRows: any[]) {
  if (!sessionRows || sessionRows.length === 0) return [];

  // 1. Sort by session_id to ensure options are paired correctly (option 1 then option 2)
  sessionRows.sort((a, b) => a.sessionId - b.sessionId);

  const sessions = [];
  let sessionGroup: any[] = [];

  // 2. Iterate and pair up the options (which are stored flatly in the DB)
  for (const row of sessionRows) {
    sessionGroup.push({
      optionNumber: row.sessionNumber, // 1 or 2
      link: row.link,
      // FIX: Restore Date object serialization. If 'row.time' is a Date object from the DB,
      // it MUST be converted to a string before being returned in the JSON response.
      time: row.time instanceof Date ? row.time.toISOString() : row.time,
      label: row.label,
      duration: row.duration,
    });

    // Every two options form a complete session group
    if (sessionGroup.length === 2) {
      sessions.push({
        // We use a temporary ID (like a hash or a counter) since the DB doesn't have a group ID
        id: sessions.length + 1,
        options: sessionGroup,
      });
      sessionGroup = [];
    }
  }

  return sessions;
}

// --- GET: Fetch only the courses owned by the logged-in Instructor ---
export async function GET(request: Request) {
  let instructorSession: InstructorAuthSession; // Assuming your guard returns the session
  try {
    const guardResponse = await verifyInstructor(request);
    if (guardResponse.error) return guardResponse.error; // Check for auth failure

    // Extract instructor ID from the authenticated session
    instructorSession = guardResponse.session;
    console.log("Instructor Session", instructorSession);
  } catch (e) {
    console.error("Authentication Error:", e);
    return NextResponse.json(
      { error: "Unauthorized or Invalid Session" },
      { status: 401 }
    );
  }

  try {
    // 1. Fetch courses ONLY for the logged-in instructor
    const coursesQuery = `
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
            WHERE c.instructor_id = $1  -- <<<< KEY CHANGE: Filter by Instructor ID
            ORDER BY c.created_at DESC;
        `;
    let courses = await queryDatabase(coursesQuery, [
      instructorSession.instructorId,
    ]); // Use ID here

    // ... (Steps 2 and 3 for fetching and merging sessions remain the same) ...

    // 2. Fetch all session options for *only* the retrieved courses
    console.log("Courses fetched for instructor:", courses);
    const courseIds = courses.map((c: any) => c.id);
    if (courseIds.length === 0) {
      return NextResponse.json([]); // Return empty if no courses found
    }

    // Using `IN` clause to retrieve sessions for only the current instructor's courses
    const sessionsQuery = `
            SELECT
                course_id AS "courseId",
                session_id AS "sessionId",
                session_number AS "sessionNumber",
                hour_per_session AS "duration", 
                session_link AS "link",
                session_timestamp AS "time", 
                session_label AS "label" 
            FROM sessions
            WHERE course_id IN (${courseIds
              .map((_, i) => `$${i + 1}`)
              .join(", ")})
            ORDER BY course_id, session_id;
        `;
    const allSessions = await queryDatabase(sessionsQuery, courseIds);
    console.log("Sessions fetched for instructor's courses:", allSessions);

    // Group sessions by courseId for quick lookup
    const sessionsByCourse = allSessions.reduce((acc: any, session: any) => {
      acc[session.courseId] = acc[session.courseId] || [];
      acc[session.courseId].push(session);
      return acc;
    }, {});

    // 3. Merge sessions into courses and structure them correctly
    const serializableCourses = courses.map((course: any) => {
      const courseSessions = sessionsByCourse[course.id] || [];

      // Transform the flat database records into the nested structure
      course.sessions = groupSessionOptions(courseSessions);

      // Ensure all Date objects are serialized
      if (course.startDate instanceof Date) {
        course.startDate = course.startDate.toISOString();
      }
      if (course.endDate instanceof Date) {
        course.endDate = course.endDate.toISOString();
      }
      return course;
    });

    return NextResponse.json(serializableCourses);
  } catch (error: any) {
    console.error("Error fetching instructor's courses:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// --- POST: Create a new course, auto-assigning it to the logged-in Instructor ---
export async function POST(request: Request) {
  let instructorSession: InstructorAuthSession;
  try {
    const guardResponse = await verifyInstructor(request);
    if (guardResponse.error) return guardResponse.error;
    instructorSession = guardResponse.session;
    console.log("Instructor Session", instructorSession);
  } catch (e) {
    return NextResponse.json(
      { error: "Unauthorized or Invalid Session" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    // ... (Validation logic remains the same) ...

    const {
      title,
      price_in_kobo: price,
      description,
      start_date: startDate,
      end_date: endDate,
      instructor, // This field is technically redundant but we keep it for payload consistency
      is_active: isActive,
      max_students: maxStudents,
      thumbnail_url: thumbnailUrl,
      course_category: category,
      level,
      language,
      sessions, // Array of session groups
    } = body;

    // ... (Input Validation and Session Structure Validation remains the same) ...

    // 1. Find the Instructor ID from the session, NOT from the request body.
    const instructorId = instructorSession.instructorId;
    if (!instructorId)
      throw new Error("Authenticated instructor ID is missing.");

    // 2. Find Category ID (this still relies on the category name from the body)
    // We DO NOT need to look up the instructor's name, as we have the ID directly.
    const categoryResult = await queryDatabase(
      `SELECT category_id FROM course_categories WHERE category_name = $1`,
      [category]
    );
    console.log("Category ID:", categoryResult);
    const categoryId = categoryResult[0]?.category_id;
    if (!categoryId) throw new Error("Category not found.");

    return await withTransaction(async (client) => {
      // 3. Insert Base Course
      // We use the authenticated instructorId instead of the one resolved from the body name.
      const insertCourseQuery = `
                INSERT INTO courses (
                    title, price_in_kobo, description, start_date, end_date, 
                    instructor_id, is_active, max_students, thumbnail_url, 
                    course_category_id, level, language, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
                RETURNING course_id;
            `;
      const courseParams = [
        title,
        price,
        description,
        startDate,
        endDate,
        instructorId, // <<<< KEY CHANGE: Use the ID from the session guard
        // NOTE: Instructors often set isActive to FALSE/Draft status by default
        // You may want to force `false` here if only Admin can publish.
        isActive,
        maxStudents,
        thumbnailUrl,
        categoryId,
        level,
        language,
      ];

      const courseResult = await client.query(insertCourseQuery, courseParams);
      const courseId = courseResult.rows[0]?.course_id;

      console.log("Course ID", courseId);
      if (!courseId) {
        throw new Error("Failed to create course.");
      }

      // 4. Insert Sessions (Session insertion logic remains the same)
      for (const sessionGroup of sessions) {
        console.log("Session Group", sessionGroup);
        for (const option of sessionGroup.options) {
          console.log("Inserting Session Option", option);
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
          console.log(
            "Session Params",
            courseId,
            option.optionNumber,
            option.duration,
            option.link,
            option.time,
            option.label
          );
          const result = await client.query(sessionInsertQuery, sessionParams);
          console.log("Final Result:", result);
        }
        console.log("Finished");

      }

      return NextResponse.json(
        { courseId, message: "Course and sessions created successfully" },
        { status: 201 }
      );
    });
  } catch (error: any) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
