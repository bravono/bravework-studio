import { NextRequest, NextResponse } from "next/server";
import { redeemVoucher } from "@/lib/wifi/wifi-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { code, macAddress, ipAddress, deviceInfo } = body;

    if (!code || !macAddress) {
      return NextResponse.json(
        { success: false, message: "Voucher code and MAC address are required." },
        { status: 400 }
      );
    }

    const result = await redeemVoucher({
      code,
      macAddress,
      ipAddress,
      deviceInfo,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("[API Redeem Voucher Error]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to redeem voucher." },
      { status: 400 }
    );
  }
}
