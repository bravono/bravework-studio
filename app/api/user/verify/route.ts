import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";
import { queryDatabase } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 400 },
      );
    }

    // Update verification_submitted_at
    await queryDatabase(
      "UPDATE users SET verification_submitted_at = NOW() WHERE user_id = $1",
      [userId],
    );

    return NextResponse.json({
      message: "Verification request submitted successfully",
    });
  } catch (error) {
    console.error("Error submitting verification request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
