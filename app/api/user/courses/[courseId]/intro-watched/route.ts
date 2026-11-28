import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { queryDatabase } from "@/lib/db";

/**
 * POST /api/user/courses/[courseId]/intro-watched
 * Toggle the intro video watched status for a course enrollment
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const courseId = parseInt(params.courseId, 10);

    if (isNaN(courseId)) {
      return NextResponse.json(
        { error: "Invalid course ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { watched } = body;

    if (typeof watched !== "boolean") {
      return NextResponse.json(
        { error: "Invalid watched value. Must be boolean." },
        { status: 400 }
      );
    }

    // Check if enrollment exists
    const enrollment = await queryDatabase(
      `SELECT enrolment_id FROM course_enrollments WHERE user_id = $1 AND course_id = $2`,
      [userId, courseId]
    );

    if (enrollment.length === 0) {
      return NextResponse.json(
        { error: "Course enrollment not found" },
        { status: 404 }
      );
    }

    // Update intro_video_watched status
    await queryDatabase(
      `UPDATE course_enrollments SET intro_video_watched = $1 WHERE user_id = $2 AND course_id = $3`,
      [watched, userId, courseId]
    );

    return NextResponse.json(
      { success: true, watched },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating intro video watched status:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
