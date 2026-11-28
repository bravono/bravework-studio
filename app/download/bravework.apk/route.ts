import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // If hosted on Vercel Blob or external CDN storage:
  const remoteApkUrl = process.env.ANDROID_APK_DOWNLOAD_URL;

  if (remoteApkUrl) {
    return NextResponse.redirect(remoteApkUrl, 302);
  }

  // Placeholder message until APK build is uploaded to blob storage
  return new NextResponse(
    "Bravework Android APK build will be served here once uploaded to storage.",
    {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    }
  );
}
