import { NextResponse } from "next/server";
import { queryDatabase, withTransaction } from "@/lib/db";
import { verifyAdmin } from "@/lib/auth/admin-auth-guard";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const guardResponse = await verifyAdmin(request);
    if (guardResponse) return guardResponse;

    const { id } = params;
    const body = await request.json();
    const { status } = body; // 'approved' or 'rejected'

    if (!id) {
      return NextResponse.json({ error: "Missing rental id" }, { status: 400 });
    }

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await withTransaction(async (client) => {
      // Get rental info to notify the user
      const rentalResult = await client.query(
        "SELECT user_id, device_name FROM rentals WHERE rental_id = $1",
        [id]
      );
      const rental = rentalResult.rows[0];

      await client.query(
        "UPDATE rentals SET approval_status = $1, updated_at = CURRENT_TIMESTAMP WHERE rental_id = $2",
        [status, id]
      );

      if (rental) {
        const notificationTitle = `Rental ${
          status === "approved" ? "Approved" : "Rejected"
        }`;
        const notificationMessage = `Your rental listing for "${
          rental.device_name
        }" has been ${status.toUpperCase()} by the admin.`;
        const notificationLink = `/user/dashboard?tab=rentals`;

        await client.query(
          `INSERT INTO notifications (user_id, title, message, link) VALUES ($1, $2, $3, $4)`,
          [
            rental.user_id,
            notificationTitle,
            notificationMessage,
            notificationLink,
          ]
        );
      }
    });

    return NextResponse.json({ message: `Rental ${status}` });
  } catch (error) {
    console.error("Error updating rental status:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
