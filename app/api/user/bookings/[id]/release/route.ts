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

    if (now < endTime) {
      return NextResponse.json(
        { error: "Funds can only be released after the booking has ended." },
        { status: 400 }
      );
    }

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

    // Update escrow_released and insert earning in a transaction
    await withTransaction(async (client) => {
      await client.query(
        `UPDATE rental_bookings SET escrow_released = TRUE WHERE rental_booking_id = $1`,
        [bookingId]
      );

      // Add to owner's wallet earnings
      await client.query(
        `INSERT INTO rental_earnings (user_id, booking_id, amount_kobo) VALUES ($1, $2, $3)`,
        [booking.owner_id, bookingId, booking.total_amount_kobo]
      );

      // Notifications are now handled by the sendFundsReleasedEmail function
    });

    // Send email and in-app notifications
    try {
      const { sendFundsReleasedEmail } = await import("@/lib/mailer");

      // Notify Renter
      await sendFundsReleasedEmail(
        booking.renter_email,
        booking.renterName,
        booking.device_name,
        "renter",
        undefined,
        booking.renter_id
      );

      // Notify Owner
      await sendFundsReleasedEmail(
        booking.owner_email,
        booking.ownerName,
        booking.device_name,
        "owner",
        booking.total_amount_kobo,
        booking.owner_id
      );
    } catch (e) {
      console.error("Failed to send release notification emails", e);
    }

    return NextResponse.json({ message: "Funds released successfully" });
  } catch (error) {
    console.error("Error releasing funds:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
