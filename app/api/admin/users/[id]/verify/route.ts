// app/api/admin/users/[id]/verify/route.ts
import { NextResponse } from "next/server";
import { queryDatabase } from "../../../../../../lib/db";
import { verifyAdmin } from "@/lib/auth/admin-auth-guard";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const guardResponse = await verifyAdmin(request);
  if (guardResponse) return guardResponse;

  const userId = parseInt(params.id);
  const { action } = await request.json();

  if (!action || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  try {
    if (action === "approve") {
      await queryDatabase(
        `UPDATE users SET is_verified = TRUE WHERE user_id = $1`,
        [userId],
      );

      // Optionally create a notification for the user
      await queryDatabase(
        `INSERT INTO notifications (user_id, title, message, type) 
         VALUES ($1, 'Verification Approved', 'Your identity has been verified successfully. You can now list and rent items.', 'verification')`,
        [userId],
      );
    } else {
      // Reject: clear submission data but keep urls for reference?
      // Or just set verification_submitted_at to null so they can try again.
      await queryDatabase(
        `UPDATE users 
         SET verification_submitted_at = NULL,
             is_verified = FALSE
         WHERE user_id = $1`,
        [userId],
      );

      await queryDatabase(
        `INSERT INTO notifications (user_id, title, message, type) 
         VALUES ($1, 'Verification Rejected', 'Your identity verification was rejected. Please ensure your documents are clear and try again.', 'verification')`,
        [userId],
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error ${action}ing user:`, error);
    return NextResponse.json(
      { error: `Failed to ${action} user` },
      { status: 500 },
    );
  }
}
