import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { queryDatabase } from "@/lib/db";

/**
 * GET /api/user/courses/[courseId]/progress
 * Fetch student progress for a specific course
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const courseId = params.courseId;

    // Get all sessions for this course
    const courseSessions = await queryDatabase(
      `SELECT s.session_id, s.session_timestamp, s.session_link, s.hour_per_session
       FROM sessions s
       JOIN courses c ON s.course_id = c.course_id
       WHERE c.course_id = $1
       ORDER BY s.session_timestamp ASC`,
      [courseId]
    );

    if (!courseSessions || courseSessions.length === 0) {
      return NextResponse.json(
        { error: "Course not found or has no sessions" },
        { status: 404 }
      );
    }

    const totalSessions = courseSessions.length;
    const sessionIds = courseSessions.map((s: any) => s.session_id);

    // Get completed sessions for this user
    const completedSessions = await queryDatabase(
      `SELECT ss.session_id
       FROM student_sessions ss
       WHERE ss.user_id = $1 AND ss.session_id = ANY($2) AND ss.finished = true`,
      [userId, sessionIds]
    );

    const completedSessionIds = completedSessions.map((s: any) => s.session_id);
    const progressPercentage = Math.round(
      (completedSessionIds.length / totalSessions) * 100
    );
    const allSessionsComplete = completedSessionIds.length === totalSessions;

    return NextResponse.json(
      {
        courseId,
        completedSessions: completedSessionIds,
        totalSessions,
        progressPercentage,
        allSessionsComplete,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching course progress:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
