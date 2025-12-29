import { NextResponse } from "next/server";
import { uploadToBlob } from "@/lib/blob-upload";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const category = (formData.get("category") as string) || "general";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const result = await uploadToBlob(file, category);

    return NextResponse.json({
      ...result,
      success: true,
    });
  } catch (error: any) {
    console.error("Error uploading blob:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
