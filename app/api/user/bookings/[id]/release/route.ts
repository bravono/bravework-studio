import { NextResponse } from "next/server";
import { queryDatabase, withTransaction } from "@/lib/db";
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

    // Fetch booking details
    const bookingRes = await queryDatabase(
      `SELECT 
        rb.*, 
        r.user_id AS owner_id, 
        rb.client_id AS renter_id
       FROM rental_bookings rb
       JOIN rentals r ON rb.rental_id = r.rental_id
       WHERE rb.rental_booking_id = $1`,
      [bookingId]
    );

    if (bookingRes.length === 0) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const booking = bookingRes[0];

    // Only owner or renter can release funds (usually owner after completion, or renter manually)
    // The requirement says: "Automatically releasing funds 24 hours after the booking end date/time or when the renter manually releases funds."
    // So Renter can release manually.
    // Owner might also want to trigger it if 24h passed?
    // Let's allow Renter to release anytime (if satisfied).
    // Let's allow Owner to release ONLY if 24h passed after end_time.

    const isOwner = booking.owner_id === userId;
    const isRenter = booking.renter_id === userId;

    if (!isOwner && !isRenter) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (booking.escrow_released) {
      return NextResponse.json(
        { error: "Funds already released" },
        { status: 400 }
      );
    }

    const endTime = new Date(booking.end_time);
    const now = new Date();
    const hoursSinceEnd =
      (now.getTime() - endTime.getTime()) / (1000 * 60 * 60);

    if (isOwner) {
      if (hoursSinceEnd < 24) {
        return NextResponse.json(
          {
            error:
              "Funds can only be released by owner 24 hours after booking ends.",
          },
          { status: 400 }
        );
      }
    }

    // Update escrow_released
    await queryDatabase(
      `UPDATE rental_bookings SET escrow_released = TRUE WHERE rental_booking_id = $1`,
      [bookingId]
    );

    // In a real system, this would trigger a payout to the owner's connected account (Stripe Connect, etc.)
    // For now, we just mark it as released.

    return NextResponse.json({ message: "Funds released successfully" });
  } catch (error) {
    console.error("Error releasing funds:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
