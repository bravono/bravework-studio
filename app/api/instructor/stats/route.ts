import { NextResponse } from "next/server";
import { queryDatabase } from "@/lib/db";
import { verifyInstructor } from "@/lib/auth/instructor-auth-guard";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const guardResponse = await verifyInstructor(request);
    if (guardResponse.error) return guardResponse.error;

    const { instructorId } = guardResponse.session;

    // 1. Fetch total enrollments across all instructor's courses
    const totalEnrollmentsQuery = `
      SELECT COUNT(ce.enrolment_id)::int as "totalEnrollments"
      FROM course_enrollments ce
      JOIN courses c ON ce.course_id = c.course_id
      WHERE c.instructor_id = $1
    `;
    const totalEnrollmentsResult = await queryDatabase(totalEnrollmentsQuery, [instructorId]);
    const totalEnrollments = totalEnrollmentsResult[0]?.totalEnrollments || 0;

    // 2. Fetch courses with enrollment counts and basic info
    const coursesQuery = `
      SELECT 
        c.course_id as id,
        c.title,
        c.start_date as "startDate",
        c.end_date as "endDate",
        c.is_active as "isActive",
        c.is_published as "isPublished",
        c.max_students as "maxStudents",
        COUNT(ce.enrolment_id)::int as "studentCount"
      FROM courses c
      LEFT JOIN course_enrollments ce ON c.course_id = ce.course_id
      WHERE c.instructor_id = $1
      GROUP BY c.course_id
      ORDER BY c.start_date DESC
    `;
    const courses = await queryDatabase(coursesQuery, [instructorId]);

    // 3. Process cohorts
    const now = new Date();
    const presentAndFutureCohorts = courses.filter((c: any) => {
      // If no end_date, consider it present/future for now
      if (!c.endDate) return true;
      return new Date(c.endDate) >= now;
    });

    const pastCohorts = courses.filter((c: any) => {
      if (!c.endDate) return false;
      return new Date(c.endDate) < now;
    });

    return NextResponse.json({
      stats: {
        totalEnrollments,
        totalCourses: courses.length,
        activeCourses: courses.filter((c: any) => c.isActive).length,
      },
      presentAndFutureCohorts,
      pastCohorts,
    });

  } catch (error: any) {
    console.error("Error fetching instructor stats:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
