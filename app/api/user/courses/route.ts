import { NextResponse } from "next/server";
import { queryDatabase, withTransaction } from "../../../../lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // 1. Get the session to authenticate the user
    const session = await getServerSession(authOptions);

    // 2. Check if the user is authenticated
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3. Get the user ID from the session
    // Ensure 'id' is added to your session object via NextAuth.js callbacks
    const userId = (session.user as any).id;

    if (!userId) {
      console.error("Session user ID is missing when fetching orders.");
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 400 }
      );
    }

    const queryText = `
      SELECT
        c.course_id AS id,
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
                course_id,
                json_agg(json_build_object(
                'datetime', session_timestamp,
                'link', session_link
                )) AS sessions
            FROM sessions
            GROUP BY course_id
            )  AS s ON ce.course_id = s.course_id
      WHERE c.course_id = $1
      ORDER BY created_at DESC; -- Order by most recent orders first
    `;

    const params = [userId];
    const result = await queryDatabase(queryText, params);

    console.log("Courses fetched for user:", result);

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=59", // Cache for 60 seconds, allow stale for another 59s
      },
    });
  } catch (error) {
    console.error("Error fetching user courses:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
