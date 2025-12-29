import { NextResponse } from "next/server";
import { queryDatabase } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role") || "renter"; // 'renter' or 'owner'

    let queryText = "";

    if (role === "owner") {
      // Fetch bookings for rentals owned by the user
      queryText = `
        SELECT 
          rb.rental_booking_id AS id,
          rb.start_time AS "startTime",
          rb.end_time AS "endTime",
          rb.total_amount_kobo AS "amount",
          rb.status,
          r.device_name AS "deviceName",
          r.device_type AS "deviceType",
          r.location_city AS "locationCity",
          CONCAT(u.first_name, ' ', u.last_name) AS "renterName",
          u.email AS "renterEmail",
          rb.rejection_reason AS "rejectionReason",
          rb.cancellation_reason AS "cancellationReason",
          rb.escrow_released AS "escrowReleased"
        FROM rental_bookings rb
        JOIN rentals r ON rb.rental_id = r.rental_id
        JOIN users u ON rb.client_id = u.user_id
        WHERE r.user_id = $1
        ORDER BY rb.created_at DESC
      `;
    } else {
      // Fetch bookings where the user is the renter (client_id)
      queryText = `
        SELECT 
          rb.rental_booking_id
          AS id,
          rb.start_time AS "startTime",
          rb.end_time AS "endTime",
          rb.total_amount_kobo AS amount,
          rb.created_at AS "createdAt",
          rb.status,
          r.device_name AS "deviceName",
          r.device_type AS "deviceType",
          r.location_city AS "locationCity",
          CONCAT(u.first_name, ' ', u.last_name) AS "ownerName",
          u.email AS "ownerEmail",
          rb.rejection_reason AS "rejectionReason",
          rb.cancellation_reason AS "cancellationReason",
          rb.escrow_released AS "escrowReleased"
        FROM rental_bookings rb
        JOIN rentals r ON rb.rental_id = r.rental_id
        JOIN users u ON r.user_id = u.user_id
        WHERE rb.client_id = $1
        ORDER BY rb.created_at DESC
      `;
    }

    const bookings = await queryDatabase(queryText, [userId]);

    console.log("Bookings", bookings);
    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
