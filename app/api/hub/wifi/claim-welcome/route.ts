import { NextRequest, NextResponse } from "next/server";
import { claimAppDownloadVoucher } from "@/lib/wifi/wifi-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { userId, phone, fullName, interestSegment, macAddress, marketingConsent } = body;

    const result = await claimAppDownloadVoucher({
      userId: userId ? Number(userId) : undefined,
      phone,
      fullName,
      interestSegment,
      macAddress,
      marketingConsent: marketingConsent !== false,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("[API Claim Welcome Error]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to claim welcome voucher." },
      { status: 400 }
    );
  }
}
