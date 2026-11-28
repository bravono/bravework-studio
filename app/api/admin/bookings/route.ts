import { NextResponse } from "next/server";
import { queryDatabase } from "@/lib/db";
import { verifyAdmin } from "@/lib/auth/admin-auth-guard";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const guardResponse = await verifyAdmin(request);
    if (guardResponse) return guardResponse;

    const { searchParams } = new URL(request.url);
    // filters: all, overdue, complaints
    const filter = searchParams.get("filter") || "all";

    let query = `
      SELECT 
        rb.rental_booking_id as id,
        rb.rental_id,
        rb.client_id as renter_id,
        rb.start_time,
        rb.end_time,
        rb.total_amount_kobo,
        rb.escrow_released,
        rb.status,
        rb.payment_status_id,
        rb.payment_status_id,
        rb.dispute_reason,
        rb.dispute_date,
        r.device_name,
        r.user_id as owner_id,
        u_renter.email as renter_email,
        u_renter.first_name as renter_first_name,
        u_renter.last_name as renter_last_name,
        u_owner.email as owner_email,
        u_owner.first_name as owner_first_name,
        u_owner.last_name as owner_last_name
      FROM rental_bookings rb
      JOIN rentals r ON rb.rental_id = r.rental_id
      JOIN users u_renter ON rb.client_id = u_renter.user_id
      JOIN users u_owner ON r.user_id = u_owner.user_id
    `;

    const conditions: string[] = [];

    if (filter === "overdue") {
      // Overdue: Ended > 48h ago, NOT released, PAID
      conditions.push(`rb.end_time < NOW() - INTERVAL '48 hours'`);
      conditions.push(`rb.escrow_released = FALSE`);
      conditions.push(`rb.payment_status_id = 2`); // Assuming 2 is 'paid'
    } else if (filter === "complaints") {
      conditions.push(`rb.dispute_reason IS NOT NULL`);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY rb.created_at DESC";

    const bookings = await queryDatabase(query, []);

    // Post-process to add useful flags or currency conversion if needed
    // But raw data should be fine for admin dashboard

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching admin bookings:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
