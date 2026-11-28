import { NextResponse } from "next/server";
import { queryDatabase } from "@/lib/db";
import { sendClassReminderEmail } from "@/lib/mailer";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Simple security check for cron job
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    console.log("Running class reminders cron...");

    // Query for sessions starting in ~24h or ~30m
    // We use a window of +/- 15 minutes to ensure we catch them (depending on how often cron runs)
    const sessionsQuery = `
      SELECT DISTINCT
          s.session_id, 
          s.session_timestamp, 
          s.session_link, 
          c.title AS course_title,
          u.email,
          u.first_name,
          u.last_name,
          u.user_id
      FROM sessions s
      JOIN courses c ON s.course_id = c.course_id
      JOIN course_enrollments ce ON c.course_id = ce.course_id
      JOIN sessions s_student ON ce.preferred_session_id = s_student.session_id
      JOIN users u ON ce.user_id = u.user_id
      WHERE 
          s.session_number = s_student.session_number
          AND (
              (s.session_timestamp >= NOW() + INTERVAL '23 hours 45 minutes' AND s.session_timestamp <= NOW() + INTERVAL '24 hours 15 minutes')
              OR
              (s.session_timestamp >= NOW() + INTERVAL '20 minutes' AND s.session_timestamp <= NOW() + INTERVAL '40 minutes')
          )
    `;

    const sessions = await queryDatabase(sessionsQuery);
    console.log(`Found ${sessions.length} students to remind.`);

    const results = await Promise.allSettled(
      sessions.map((session: any) =>
        sendClassReminderEmail(
          session.email,
          `${session.first_name} ${session.last_name}`,
          session.course_title,
          session.session_timestamp,
          session.session_link,
          session.user_id
        )
      )
    );

    const successCount = results.filter((r) => r.status === "fulfilled").length;
    const failureCount = results.filter((r) => r.status === "rejected").length;

    return NextResponse.json({
      message: "Reminders processed",
      total: sessions.length,
      successCount,
      failureCount,
    });
  } catch (error) {
    console.error("Cron Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
