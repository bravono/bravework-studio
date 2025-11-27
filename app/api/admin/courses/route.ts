import { NextResponse } from "next/server";
import { queryDatabase, withTransaction } from "../../../../lib/db";
import { verifyAdmin } from "@/lib/auth/admin-auth-guard";

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

export async function GET(request: Request) {
  try {
    const guardResponse = await verifyAdmin(request);
    if (guardResponse) return guardResponse;

    // 1. Fetch all courses with base details
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
                c.thumbnail_url AS "thumbnailUrl",
                 c.content,
                c.excerpt,
                c.age_bracket AS "ageBracket",
                ct_agg.tools AS software,
                c.slug
            FROM courses c
            JOIN instructors i ON c.instructor_id = i.instructor_id
            JOIN course_categories cc ON c.course_category_id = cc.category_id
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
            ORDER BY c.created_at DESC;
        `;
    let courses = await queryDatabase(coursesQuery);

    // 2. Fetch all session options for all courses
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
            ORDER BY course_id, session_id;
        `;
    const allSessions = await queryDatabase(sessionsQuery);

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

    console.log("Courses", serializableCourses);
    return NextResponse.json(serializableCourses);
  } catch (error: any) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST remains largely unchanged as its logic correctly flattens the nested input
export async function POST(request: Request) {
  try {
    const guardResponse = await verifyAdmin(request);
    if (guardResponse) return guardResponse;

    const body = await request.json();
    console.log("Incoming Course Body", body);

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

    // Input Validation (Simplified for brevity, assuming external schema validation)
    if (
      !title ||
      !instructor ||
      !description ||
      !sessions ||
      sessions.length === 0
    ) {
      console.log("Missing field", instructor);
      return NextResponse.json(
        {
          error:
            "Missing required fields: title, description, instructor, or sessions array.",
        },
        { status: 400 }
      );
    }

    // Validate sessions structure: must have two options, and each option must contain duration, link, time, and label.
    const hasInvalidSession = sessions.some(
      (sessionGroup: any) =>
        !sessionGroup.options ||
        sessionGroup.options.length === 0 ||
        sessionGroup.options.some(
          (option: any) =>
            !option.duration ||
            isNaN(parseInt(option.duration)) || // Ensure duration is a valid number
            !option.time ||
            !option.label ||
            !option.optionNumber
        )
    );

    console.log("Has Invalid Session", hasInvalidSession);
    if (hasInvalidSession) {
      return NextResponse.json(
        {
          error:
            "Each course must have sessions, and each session group must contain exactly two options (1 and 2), each with valid duration, link, time, and label.",
        },
        { status: 400 }
      );
    }

    const instructorName = instructor.split(" ");
    console.log("Instructor Name", instructorName);
    if (instructorName.length < 2) {
      throw new Error("Instructor name must include first and last name.");
    }

    return await withTransaction(async (client) => {
      console.log("Now in Transaction");
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

      console.log("Inserting into courses table");
      // 2. Insert Base Course
      const insertCourseQuery = `
                INSERT INTO courses (
                    title, price_in_kobo, description, start_date, end_date, 
                    instructor_id, is_active, max_students, thumbnail_url, 
                    course_category_id, level, language, slug, content, excerpt, age_bracket, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())
                RETURNING course_id;
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
      ];

      const courseResult = await client.query(insertCourseQuery, courseParams);
      const courseId = courseResult.rows[0]?.course_id;

      if (!courseId) {
        throw new Error("Failed to create course.");
      }

      // 3. Insert Tools (if any)
      if (tools && tools.length > 0) {
        for (const toolId of tools) {
          await client.query(
            `INSERT INTO course_tools (course_id, tool_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [courseId, toolId]
          );
        }
      }

      // 4. Insert Sessions (two flat records per session group)
      for (const sessionGroup of sessions) {
        for (const option of sessionGroup.options) {
          console.log("Inserting into sessions");
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

          const result = await client.query(sessionInsertQuery, sessionParams);

          console.log("Result", result);
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
