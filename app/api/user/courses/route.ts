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
      c.title,
      c.description,
      c.created_at AS date,
      c.price_in_kobo AS price,
      c.early_bird_discount AS "discount",
      c.discount_start_date AS "discountStartDate",
      c.discount_end_date AS "discountEndDate",
      ce.payment_status AS "paymentStatus",
      ce.preferred_session_id AS "preferredSession",
      csbp.session_option AS "sessionOption",
      csbp.session_label AS "sessionLabel",
      csbp.sessions AS "sessionGroup"
    FROM course_enrollments ce
    JOIN courses c ON c.course_id = ce.course_id
    LEFT JOIN course_sessions_by_preference csbp
      ON csbp.course_id = ce.course_id AND csbp.user_id = ce.user_id
    WHERE ce.user_id = $1
    ORDER BY c.created_at DESC;
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
