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

    const sessionUser = session.user as any;
    const userId = sessionUser.id;
    const bookingId = params.id;

    const body = await request.json().catch(() => ({}));
    const { mode, notes } = body;

    if (!mode || (mode !== "pickup" && mode !== "return")) {
      return NextResponse.json(
        { error: "Invalid handover mode. Must be 'pickup' or 'return'" },
        { status: 400 }
      );
    }

    // Verify booking belongs to user as renter or device owner
    const bookingRes = await queryDatabase(
      `SELECT rb.*, r.user_id as owner_id
       FROM rental_bookings rb
       JOIN rentals r ON rb.rental_id = r.rental_id
       WHERE rb.rental_booking_id = $1`,
      [bookingId]
    );

    if (bookingRes.length === 0) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const booking = bookingRes[0];
    const isAuthorized =
      booking.client_id === userId || booking.owner_id === userId;

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Forbidden. You are not associated with this booking." },
        { status: 403 }
      );
    }

    // Log handover event in database
    const newStatus = mode === "pickup" ? "in_progress" : "completed";
    await queryDatabase(
      `UPDATE rental_bookings 
       SET status = CASE 
         WHEN status = 'accepted' AND $1 = 'pickup' THEN 'in_progress'
         WHEN status = 'in_progress' AND $1 = 'return' THEN 'completed'
         ELSE status
       END,
       updated_at = NOW()
       WHERE rental_booking_id = $2`,
      [mode, bookingId]
    );

    return NextResponse.json({
      success: true,
      message: `Handover ${mode} verified successfully.`,
      bookingId,
      mode,
      notes: notes || null,
      status: newStatus,
    });
  } catch (error: any) {
    console.error("Error processing booking handover:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process booking handover" },
      { status: 500 }
    );
  }
}