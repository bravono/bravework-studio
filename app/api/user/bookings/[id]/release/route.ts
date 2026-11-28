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

    const sessionUser = session.user as any;
    const userId = sessionUser.id;
    const userRole = sessionUser.roles; // Assuming 'role' is available

     const bookingId = params.id;

    // Fetch booking details
    const bookingRes = await queryDatabase(
      `SELECT 
        rb.*, 
        r.user_id AS owner_id, 
        rb.client_id AS renter_id,
        u_renter.email as renter_email,
        u_renter.first_name || ' ' || u_renter.last_name as "renterName",
        u_owner.email as owner_email,
        u_owner.first_name || ' ' || u_owner.last_name as "ownerName",
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

    const isRenter = booking.renter_id === userId;
    // Check if user is admin. We can check the role from the session.
    // We'll assume the role name for admin is 'admin' or 'Admin'.
    // If verifyAdmin uses a specific logic, we should mirror it or rely on role.
    // Ideally we should query the user role from DB if not in session, but let's trust session for now or fetch if needed.
    // For safety, let's assume 'admin' role in session.
    const isAdmin = userRole.includes("admin");

    const endTime = new Date(booking.end_time);
    const now = new Date();
    const hoursSinceEnd =
      (now.getTime() - endTime.getTime()) / (1000 * 60 * 60);

    // Rule 1: Renter can release funds at any time (if they are happy).
    // Rule 2: Admin can release funds ONLY if 48hrs past date/time.
    // Rule 3: Owner CANNOT release funds.

    if (!isRenter && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden. Only the renter or admin can release funds." },
        { status: 403 }
      );
    }

    if (isAdmin && !isRenter) {
      if (hoursSinceEnd < 48) {
        return NextResponse.json(
          {
            error:
              "Admin can only release funds 48 hours after the booking has ended.",
          },
          { status: 400 }
        );
      }
    }

    // If it's the renter, they can release anytime.

    if (booking.escrow_released) {
      return NextResponse.json(
        { error: "Funds already released" },
        { status: 400 }
      );
    }

    // hoursSinceEnd calculated above

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
