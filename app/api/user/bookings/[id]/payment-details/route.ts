import { NextResponse } from "next/server";
import { queryDatabase } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";

export const dynamic = "force-dynamic";

export async function GET(
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

    // Fetch the booking details
    const queryText = `
      SELECT
        rb.rental_booking_id AS id,
        rb.total_amount_kobo AS amount,
        rb.status,
        r.device_name AS "deviceName",
        rb.client_id AS "clientId"
      FROM rental_bookings rb
      JOIN rentals r ON rb.rental_id = r.rental_id
      WHERE rb.rental_booking_id = $1 AND rb.client_id = $2;
    `;

    const result = await queryDatabase(queryText, [bookingId, userId]);

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Booking not found or does not belong to you" },
        { status: 404 }
      );
    }

    const booking = result[0];

    // Check if booking status is acceptable for payment
    if (booking.status !== "accepted") {
      return NextResponse.json(
        {
          error: `This booking is ${booking.status} and cannot be paid for yet.`,
        },
        { status: 400 }
      );
    }

    // Return in the format expected by PaymentContent.tsx
    return NextResponse.json({
      type: "rental",
      data: {
        id: booking.id,
        title: booking.deviceName,
        description: `Rental of ${booking.deviceName}`,
        amount: booking.amount, // in Kobo
        status: booking.status,
      },
      orderId: booking.id, // We use bookingId as orderId for rentals in metadata
    });
  } catch (error) {
    console.error("Error fetching booking payment details:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
