import { NextResponse } from "next/server";
import { queryDatabase, withTransaction } from "@/lib/db";
import { verifyInstructor } from "@/lib/auth/instructor-auth-guard";

export const runtime = "nodejs";

// Helper function to structure flat session options into nested session groups (pairs)
// NOTE: In a production application, this should be imported from a shared utility file.
function groupSessionOptions(sessionRows: any[]) {
    if (!sessionRows || sessionRows.length === 0) return [];

    sessionRows.sort((a, b) => a.sessionId - b.sessionId);

    const sessions = [];
    let sessionGroup: any[] = [];

    for (const row of sessionRows) {
        sessionGroup.push({
            optionNumber: row.sessionNumber,
            link: row.link,
            // Ensure time is serialized if it comes as a Date object from the DB
            time: row.time instanceof Date ? row.time.toISOString() : row.time,
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

// --- GET: Fetch specific course details, restricted by ownership ---
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    let instructorId: string;
    try {
        const guardResponse = await verifyInstructor(request);
        if (guardResponse.error) return guardResponse.error;
        instructorId = guardResponse.session.instructorId;
    } catch (e) {
        return NextResponse.json({ error: "Unauthorized or Invalid Session" }, { status: 401 });
    }

    try {
        const courseId = params.id;

        // 1. Fetch the specific course with base details, filtered by instructor_id
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
            WHERE c.course_id = $1 AND c.instructor_id = $2; -- << ADDED OWNERSHIP CHECK
        `;
        const courses = await queryDatabase(courseQuery, [courseId, instructorId]);
        
        // If course is not found, or is not owned by the instructor, return 404
        if (courses.length === 0) {
            return NextResponse.json({ error: "Course not found or access denied" }, { status: 404 });
        }
        let course = courses[0];

        // 2. Fetch sessions for this course
        const sessionsQuery = `
            SELECT
                session_id AS "sessionId",
                session_number AS "sessionNumber",
                hour_per_session AS "duration",
                session_link AS "link",
                session_timestamp AS "time", -- Renamed from 'datetime' to 'time' for consistency
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

// --- PATCH (Update Course and Sessions), restricted by ownership ---
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    let instructorId: string;
    try {
        const guardResponse = await verifyInstructor(request);
        if (guardResponse.error) return guardResponse.error;
        instructorId = guardResponse.session.instructorId;
        console.log("Instructor ID", instructorId)
    } catch (e) {
        return NextResponse.json({ error: "Unauthorized or Invalid Session" }, { status: 401 });
    }

    try {
        const courseId = params.id;
        const body = await request.json();

        const {
            title,
            price_in_kobo: price,
            description,
            start_date: startDate,
            end_date: endDate,
            // instructor field is ignored for setting ownership, but kept for payload compatibility
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
        
        // --- Ownership Check (Crucial for PATCH/DELETE) ---
        const ownerCheck = await queryDatabase(
            `SELECT instructor_id FROM courses WHERE course_id = $1`, 
            [courseId]
        );

        if (ownerCheck.rows.length === 0) {
            return NextResponse.json({ error: "Course not found" }, { status: 404 });
        }
        if (ownerCheck.rows[0].instructor_id !== instructorId) {
            return NextResponse.json(
                { error: "Forbidden: You do not own this course." }, 
                { status: 403 }
            );
        }
        // --- Ownership Check Passed ---


        // Validate sessions structure
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

        // We can skip the instructor name lookup since we have instructorId from auth.
        // We still need to find the Category ID if category name is provided.
        const categoryResult = await queryDatabase(
            `SELECT category_id FROM course_categories WHERE category_name = $1`,
            [category]
        );
        const categoryId = categoryResult.rows[0]?.category_id;
        if (!categoryId) throw new Error("Category not found.");


        return await withTransaction(async (client) => {

            // 1. Update Base Course - NOTE: We enforce the original instructor ID ($13)
            // We only update the course if the authenticated instructor is the owner.
            const updateCourseQuery = `
                UPDATE courses SET
                    title = $1, price_in_kobo = $2, description = $3, start_date = $4, end_date = $5, 
                    instructor_id = $6, is_active = $7, max_students = $8, thumbnail_url = $9, 
                    course_category_id = $10, level = $11, language = $12
                WHERE course_id = $13 AND instructor_id = $6; -- << CRUCIAL OWNERSHIP CLAUSE
            `;
            const courseParams = [
                title,
                price,
                description,
                startDate,
                endDate,
                instructorId, // Use authenticated ID
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
                // Should not happen if ownership check passed, but acts as a final safeguard
                throw new Error(
                    `Course with ID ${courseId} not found or failed to update (ownership issue).`
                );
            }

            // 2. Clear Existing Sessions
            const deleteSessionsQuery = `DELETE FROM sessions WHERE course_id = $1;`;
            await client.query(deleteSessionsQuery, [courseId]);

            // 3. Insert NEW Sessions
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

// --- DELETE: Delete a course, restricted by ownership ---
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    let instructorId: string;
    try {
        const guardResponse = await verifyInstructor(request);
        if (guardResponse.error) return guardResponse.error;
        instructorId = guardResponse.session.instructorId;
    } catch (e) {
        return NextResponse.json({ error: "Unauthorized or Invalid Session" }, { status: 401 });
    }

    try {
        const courseId = params.id;
        
        if (!courseId) {
            return NextResponse.json(
                { error: "Course ID is required" },
                { status: 400 }
            );
        }

        // We only need to delete from the courses table, as session deletion 
        // should be handled by a CASCADE constraint in the DB schema.
        const queryText = `
            DELETE FROM courses
            WHERE course_id = $1 AND instructor_id = $2 -- << ADDED OWNERSHIP CHECK
            RETURNING course_id;
        `;

        const result = await queryDatabase(queryText, [courseId, instructorId]);

        if (result.rows.length === 0) {
            // The course was not found OR it was not owned by the instructor
            return NextResponse.json({ error: "Course not found or access denied" }, { status: 404 });
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
