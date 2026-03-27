import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";
import { queryDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { idType, idCardFrontUrl, idCardBackUrl, selfieWithIdUrl } = body;

    // Basic validation
    if (!idType || !idCardFrontUrl || !selfieWithIdUrl) {
      return NextResponse.json(
        { error: "Missing required verification fields" },
        { status: 400 }
      );
    }

    // Update the user's verification data
    const query = `
      UPDATE users 
      SET 
        id_type = $1,
        id_card_front_url = $2,
        id_card_back_url = $3,
        selfie_with_id_url = $4,
        verification_submitted_at = CURRENT_TIMESTAMP
      WHERE user_id = $5
      RETURNING user_id
    `;

    const result = await queryDatabase(query, [
      idType,
      idCardFrontUrl,
      idCardBackUrl || null,
      selfieWithIdUrl,
      userId,
    ]);

    if (result.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Verification submitted successfully" });
  } catch (error) {
    console.error("Error submitting verification:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
