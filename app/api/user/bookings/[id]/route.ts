import { NextResponse } from "next/server";
import { queryDatabase } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";
import { sendBookingStatusEmail } from "@/lib/mailer";

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

    const queryText = `
      SELECT 
        rb.rental_booking_id AS id,
        rb.start_time AS "startTime",
        rb.end_time AS "endTime",
        rb.total_amount_kobo AS "amount",
        rb.status,
        r.device_name AS "deviceName",
        r.device_type AS "deviceType",
        r.location_city AS "locationCity",
        r.location_address AS "locationAddress",
        r.user_id AS "ownerId",
        rb.client_id AS "renterId",
        CONCAT(u_owner.first_name, ' ', u_owner.last_name) AS "ownerName",
        u_owner.email AS "ownerEmail",
        CONCAT(u_renter.first_name, ' ', u_renter.last_name) AS "renterName",
        u_renter.email AS "renterEmail",
        rb.rejection_reason AS "rejectionReason",
        rb.cancellation_reason AS "cancellationReason",
        rb.escrow_released AS "escrowReleased"
      FROM rental_bookings rb
      JOIN rentals r ON rb.rental_id = r.rental_id
      JOIN users u_owner ON r.user_id = u_owner.id
      JOIN users u_renter ON rb.client_id = u_renter.rental_id
      WHERE rb.rental_booking_id = $1
    `;

    const result = await queryDatabase(queryText, [bookingId]);

    if (result.length === 0) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const booking = result[0];

    // Check permissions
    if (booking.ownerId !== userId && booking.renterId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    const body = await request.json();
    const { status, reason } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Fetch current booking details
    const bookingRes = await queryDatabase(
      `SELECT 
        rb.*, 
        r.user_id AS owner_id, 
        rb.client_id AS renter_id,
        u_renter.email AS renter_email,
        CONCAT(u_renter.first_name, ' ', u_renter.last_name) AS "renterName",
        u_owner.email AS owner_email,
        CONCAT(u_owner.first_name, ' ', u_owner.last_name) AS "ownerName",
        r.device_name
       FROM rental_bookings rb
       JOIN rentals r ON rb.rental_id = r.rental_id
       JOIN users u_renter ON rb.client_id = u_renter.user_id
       JOIN users u_owner ON r.user_id = u_owner.user_id
       WHERE rb.rental_booking_id = $1`,
      [bookingId]
    );

    if (bookingRes.length === 0) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const booking = bookingRes[0];

    // Validate permissions and transitions
    const isOwner = booking.owner_id === userId;
    const isRenter = booking.renter_id === userId;

    if (!isOwner && !isRenter) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let newStatusId;
    let updateQuery = "";
    let updateParams: any[] = [];

    if (status === "accepted") {
      if (!isOwner)
        return NextResponse.json(
          { error: "Only owner can accept" },
          { status: 403 }
        );
      updateQuery = `UPDATE rental_bookings SET status = $1 WHERE rental_booking_id = $2`;
      updateParams = ["accepted", bookingId];
    } else if (status === "declined") {
      if (!isOwner)
        return NextResponse.json(
          { error: "Only owner can decline" },
          { status: 403 }
        );
      updateQuery = `UPDATE rental_bookings SET status = $1, rejection_reason = $2 WHERE rental_booking_id = $3`;
      updateParams = ["declined", reason, bookingId];
    } else if (status === "cancelled") {
      updateQuery = `UPDATE rental_bookings SET status = $1, cancellation_reason = $2 WHERE rental_booking_id = $3`;
      updateParams = ["cancelled", reason, bookingId];
    } else {
      return NextResponse.json(
        { error: "Unsupported status update" },
        { status: 400 }
      );
    }

    await queryDatabase(updateQuery, updateParams);

    // Send Email Notification
    const recipientEmail = isOwner ? booking.renter_email : booking.owner_email;
    const recipientName = isOwner ? booking.renter_name : booking.owner_name;

    // If owner accepts/declines, notify renter.
    // If renter cancels, notify owner.
    // If owner cancels, notify renter.

    if (status === "accepted" || status === "declined") {
      await sendBookingStatusEmail(
        booking.renter_email,
        booking.renter_name,
        booking.device_name,
        status,
        reason
      );
    } else if (status === "cancelled") {
      // Notify the OTHER party
      await sendBookingStatusEmail(
        recipientEmail,
        recipientName,
        booking.device_name,
        status,
        reason
      );
    }

    return NextResponse.json({ message: "Booking updated successfully" });
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
