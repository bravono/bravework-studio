
import { NextResponse } from "next/server";
import { queryDatabase, withTransaction } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { rentalId, startTime, endTime, totalAmount } = body;

    if (!rentalId || !startTime || !endTime || !totalAmount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check availability
    const conflicts = await queryDatabase(
      `SELECT rental_booking_id FROM rental_bookings
       WHERE rental_id = $1
       AND status NOT IN ('cancelled', 'rejected')
       AND (
         (start_time <= $2 AND end_time >= $2) OR
         (start_time <= $3 AND end_time >= $3) OR
         (start_time >= $2 AND end_time <= $3)
       )`,
      [rentalId, startTime, endTime]
    );

    if (conflicts.length > 0) {
      return NextResponse.json(
        { error: "Rental is not available for the selected time" },
        { status: 409 }
      );
    }

    // Get pending order status id
    const orderStatusRes = await queryDatabase(
      "SELECT order_status_id FROM order_statuses WHERE name = 'pending'",
      []
    );
    const pendingStatusId = orderStatusRes[0]?.order_status_id;

    const bookingId = await withTransaction(async (client) => {
      const res = await client.query(
        `INSERT INTO rental_bookings (
          rental_id, client_id, start_time, end_time, total_amount, order_status_id
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING rental_booking_id`,
        [
          rentalId,
          userId,
          startTime,
          endTime,
          totalAmount,
          pendingStatusId,
        ]
      );
      return res.rows[0].rental_booking_id;
    });

    return NextResponse.json({ bookingId }, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
