import { NextResponse } from "next/server";
import { queryDatabase } from "@/lib/db";
import { verifyUser } from "@/lib/auth/user-auth-guard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  console.log("Received GET request for courseId:", params.courseId);
  try {
    const { courseId } = params;
    const user = await verifyUser();
    const isAuthenticated = user.isAuthenticated;
    const userId = user.userId;

    console.log(
      "User authentication status:",
      isAuthenticated,
      "User ID:",
      userId
    );
    if (!isAuthenticated || !userId) {
      console.error("Authentication failed: No valid token or session found.");
      throw new Error(
        "Authentication failed. Please log in or use a valid link."
      );
    }

    console.log(
      "Fetching course details for user:",
      userId,
      "and courseId:",
      courseId
    );
    const queryText = `
      SELECT
        c.course_id,
        title,
        description,
        created_at AS date,
        price_in_kobo AS price,
        ce.payment_status AS "paymentStatus",
        ce.preferred_session_id AS "preferredSession",
        s.sessions AS sessions
      FROM courses c
      LEFT JOIN course_enrollments ce ON c.course_id = ce.course_id
      LEFT JOIN (
            SELECT
                s.course_id,
                json_agg(json_build_object(
                'datetime', session_timestamp,
                'link', session_link
                )) AS sessions
            FROM sessions s
            GROUP BY course_id
            )  AS s ON ce.course_id = s.course_id
      WHERE c.course_id = $1 AND ce.user_id = $2
      ORDER BY created_at DESC; 
    `;
    const result = await queryDatabase(queryText, [courseId, userId]);

    console.log("Course fetched for user:", result);

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=59", // Cache for 60 seconds, allow stale for another 59s
      },
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
