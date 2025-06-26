import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const fileName = file?.name;
    const category = formData.get('category') as string;

    if (!file || !fileName) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Generate a unique filename by appending a timestamp before the extension
    const extIndex = fileName.lastIndexOf(".");
    const base = extIndex !== -1 ? fileName.substring(0, extIndex) : fileName;
    const ext = extIndex !== -1 ? fileName.substring(extIndex) : "";
    const uniqueName = `${base}-${Date.now()}${ext}`;

    // Determine the correct folder based on the environment
    const envPrefix =
      process.env.NODE_ENV === "production"
        ? `bws-production/${category}`
        : `bws-test/${category}`;

    const fullPath = `${envPrefix}/${uniqueName}`;

    // Upload the file with the environment-specific path and unique name
    const uploaded = await put(fullPath, file, { access: "public" });

    return NextResponse.json({
      url: uploaded.url,
      success: true,
      name: uniqueName,
    });
  } catch (error: any) {
    console.error("Error uploading blob:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
