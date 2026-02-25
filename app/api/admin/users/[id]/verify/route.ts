import { NextResponse } from "next/server";
import { queryDatabase } from "@/lib/db";
import { verifyAdmin } from "@/lib/auth/admin-auth-guard";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const guardResponse = await verifyAdmin(request);
    if (guardResponse) return guardResponse;

    const userId = params.id;
    const body = await request.json();
    const { action } = body; // 'approve' or 'reject'

    if (!userId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (action === "approve") {
      await queryDatabase(
        "UPDATE users SET is_verified = TRUE, verification_submitted_at = NULL WHERE user_id = $1",
        [userId],
      );
    } else if (action === "reject") {
      await queryDatabase(
        "UPDATE users SET is_verified = FALSE, verification_submitted_at = NULL WHERE user_id = $1",
        [userId],
      );
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({
      message: `User verification ${action}ed successfully`,
    });
  } catch (error) {
    console.error("Error updating user verification:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
