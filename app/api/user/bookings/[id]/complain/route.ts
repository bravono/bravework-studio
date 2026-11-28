import { NextResponse } from "next/server";
import { queryDatabase } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookingId = params.id;
    const userId = (session.user as any).id;
    const { reason } = await request.json();

    if (!reason) {
      return NextResponse.json(
        { error: "Complaint reason is required" },
        { status: 400 }
      );
    }

    // Check ownership (must be renter)
    const bookingRes = await queryDatabase(
      `SELECT client_id FROM rental_bookings WHERE rental_booking_id = $1`,
      [bookingId]
    );

    if (bookingRes.length === 0) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (bookingRes[0].client_id !== userId) {
      return NextResponse.json(
        { error: "Only the renter can file a complaint" },
        { status: 403 }
      );
    }

    // Update booking with complaint
    await queryDatabase(
      `UPDATE rental_bookings 
       SET complaint_reason = $1, complaint_date = NOW() 
       WHERE rental_booking_id = $2`,
      [reason, bookingId]
    );

    return NextResponse.json({ message: "Complaint submitted successfully" });
  } catch (error) {
    console.error("Error submitting complaint:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
