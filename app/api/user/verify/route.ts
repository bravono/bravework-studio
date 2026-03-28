import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";
import { queryDatabase } from "@/lib/db";
import { uploadToBlob } from "@/lib/blob-upload";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const formData = await request.formData();
    const idType = formData.get("idType") as string;
    const idCardFront = formData.get("idCardFront") as File;
    const idCardBack = formData.get("idCardBack") as File | null;
    const selfieWithId = formData.get("selfieWithId") as File;

    // Basic validation
    if (!idType || !idCardFront || !selfieWithId) {
      return NextResponse.json(
        { error: "Missing required verification fields" },
        { status: 400 }
      );
    }

    // Upload files to Vercel Blob
    const [frontResult, selfieResult] = await Promise.all([
      uploadToBlob(idCardFront, "verification"),
      uploadToBlob(selfieWithId, "verification"),
    ]);

    let backUrl = null;
    if (idCardBack && idCardBack.size > 0) {
      const backResult = await uploadToBlob(idCardBack, "verification");
      backUrl = backResult.url;
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
      frontResult.url,
      backUrl,
      selfieResult.url,
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
