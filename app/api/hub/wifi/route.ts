import { NextRequest, NextResponse } from "next/server";
import { getActiveWifiSession } from "@/lib/wifi/wifi-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const macAddress = searchParams.get("mac");

    if (!macAddress) {
      return NextResponse.json({ active: false, session: null }, { status: 200 });
    }

    const session = await getActiveWifiSession(macAddress);

    return NextResponse.json({
      active: !!session,
      session,
    });
  } catch (error: any) {
    console.error("[API Wifi Status Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch Wi-Fi session status." },
      { status: 500 }
    );
  }
}
