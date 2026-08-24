import { NextRequest, NextResponse } from "next/server";
import { claimWebLeadVoucher } from "@/lib/wifi/wifi-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { fullName, email, phone, interestSegment, macAddress, marketingConsent } = body;

    if (!fullName || !email) {
      return NextResponse.json(
        { success: false, message: "Name and email address are required to claim the free 30-minute web pass." },
        { status: 400 }
      );
    }

    const result = await claimWebLeadVoucher({
      fullName,
      email,
      phone,
      interestSegment,
      macAddress,
      marketingConsent: marketingConsent !== false,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("[API Claim Web Lead Error]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to claim web lead voucher." },
      { status: 400 }
    );
  }
}
