import { NextRequest, NextResponse } from "next/server";
import { claimContactAccessBonus } from "@/lib/wifi/wifi-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { phone, userId, fullName, macAddress } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, message: "Phone number is required to claim the contact bonus." },
        { status: 400 }
      );
    }

    const result = await claimContactAccessBonus({
      phone,
      userId: userId ? Number(userId) : undefined,
      fullName,
      macAddress,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("[API Claim Contact Bonus Error]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to claim contact bonus." },
      { status: 400 }
    );
  }
}
