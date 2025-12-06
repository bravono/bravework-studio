import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { queryDatabase } from "@/lib/db";

/**
 * POST /api/user/sessions/[sessionId]/complete
 * Mark a course session as complete for the authenticated user
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const sessionId = parseInt(params.sessionId, 10);

    if (isNaN(sessionId)) {
      return NextResponse.json(
        { error: "Invalid session ID" },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { finished } = body;

    if (typeof finished !== "boolean") {
      return NextResponse.json(
        { error: "Invalid finished value. Must be boolean." },
        { status: 400 }
      );
    }

    // Check if record already exists
    const existingRecord = await queryDatabase(
      `SELECT student_session_id, finished FROM student_sessions 
       WHERE user_id = $1 AND session_id = $2`,
      [userId, sessionId]
    );

    let result;

    if (existingRecord.length > 0) {
      // Update existing record
      result = await queryDatabase(
        `UPDATE student_sessions 
         SET finished = $1, 
             completed_at = CASE WHEN $1 = true THEN NOW() ELSE NULL END,
             updated_at = NOW()
         WHERE user_id = $2 AND session_id = $3
         RETURNING student_session_id, user_id, session_id, finished, completed_at`,
        [finished, userId, sessionId]
      );
    } else {
      // Insert new record
      result = await queryDatabase(
        `INSERT INTO student_sessions (user_id, session_id, finished, completed_at)
         VALUES ($1, $2, $3, CASE WHEN $3 = true THEN NOW() ELSE NULL END)
         RETURNING student_session_id, user_id, session_id, finished, completed_at`,
        [userId, sessionId, finished]
      );
    }

    const sessionData = result[0];

    return NextResponse.json(
      {
        success: true,
        session: {
          student_session_id: sessionData.student_session_id,
          userId: sessionData.user_id,
          sessionId: sessionData.session_id,
          finished: sessionData.finished,
          completedAt: sessionData.completed_at,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error marking session complete:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
