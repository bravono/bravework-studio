import { NextResponse } from "next/server";
import { uploadToBlob } from "@/lib/blob-upload";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (
      !contentType.includes("multipart/form-data") &&
      !contentType.includes("application/x-www-form-urlencoded")
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid Content-Type. Expected multipart/form-data or application/x-www-form-urlencoded",
        },
        { status: 400 },
      );
    }

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
    return NextResponse.json(
      { error: error.message || "Failed to upload file" },
      { status: 500 },
    );
  }
}
