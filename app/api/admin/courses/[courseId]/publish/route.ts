import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth/admin-auth-guard";
import { queryDatabase } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: { courseId: string } },
) {
  try {
    const guardResponse = await verifyAdmin(request);
    if (guardResponse) return guardResponse;

    const { courseId } = params;

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 },
      );
    }

    const result = await queryDatabase(
      `UPDATE courses SET is_published = true, updated_at = NOW() WHERE course_id = $1 RETURNING course_id, title`,
      [courseId],
    );

    if (result.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: `Course "${result[0].title}" approved successfully`,
      courseId: result[0].course_id,
    });
  } catch (error: any) {
    console.error("Error approving course:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
