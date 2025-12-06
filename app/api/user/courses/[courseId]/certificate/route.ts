import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { queryDatabase } from "@/lib/db";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import CertificateDocument from "@/lib/certificateTemplate";
/**
 * GET /api/user/courses/[courseId]/certificate
 * Generate and download a PDF certificate for a completed course
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

    // Get course details
    const courseResult = await queryDatabase(
      `SELECT course_id, title, created_at 
       FROM courses 
       WHERE course_id = $1`,
      [courseId]
    );

    if (!courseResult || courseResult.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const course = courseResult[0];

    // Get all sessions for this course
    const courseSessions = await queryDatabase(
      `SELECT s.session_id
       FROM sessions s
       WHERE s.course_id = $1`,
      [courseId]
    );

    if (!courseSessions || courseSessions.length === 0) {
      return NextResponse.json(
        { error: "Course has no sessions" },
        { status: 400 }
      );
    }

    const totalSessions = courseSessions.length;
    const sessionIds = courseSessions.map((s: any) => s.session_id);

    // Get completed sessions for this user
    const completedSessions = await queryDatabase(
      `SELECT session_id
       FROM student_sessions
       WHERE user_id = $1 AND session_id = ANY($2) AND finished = true`,
      [userId, sessionIds]
    );

    const completedCount = completedSessions.length;

    // Check if all sessions are complete
    if (completedCount < totalSessions) {
      return NextResponse.json(
        {
          error: "Not all sessions are completed",
          progress: {
            completed: completedCount,
            total: totalSessions,
            percentage: Math.round((completedCount / totalSessions) * 100),
          },
        },
        { status: 403 }
      );
    }

    // Get user details
    const userResult = await queryDatabase(
      `SELECT full_name, email FROM users WHERE user_id = $1`,
      [userId]
    );

    if (!userResult || userResult.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = userResult[0];
    const studentName = user.full_name || session.user.name || "Student";
    const completionDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Generate PDF certificate
    const certificateElement = React.createElement(CertificateDocument, {
      name: studentName,
      course: course.title,
      date: completionDate,
      issuer: "BraveWork Studio",
    });
    
    // renderToBuffer() expects a Document element. TypeScript doesn't know that
    // CertificateDocument returns a <Document>, so we use a type assertion.
    const pdfBuffer = await renderToBuffer(certificateElement as any);

    // Return PDF as downloadable file
    // Convert Buffer to Uint8Array for NextResponse compatibility
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="certificate-${course.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error("Error generating certificate:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
