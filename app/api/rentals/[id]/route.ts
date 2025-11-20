
import { NextResponse } from "next/server";
import { queryDatabase, withTransaction } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    const rentals = await queryDatabase(
      `SELECT r.*, u.first_name, u.last_name, u.email, u.phone
       FROM rentals r
       JOIN users u ON r.user_id = u.user_id
       WHERE r.rental_id = $1`,
      [id]
    );

    if (rentals.length === 0) {
      return NextResponse.json({ error: "Rental not found" }, { status: 404 });
    }

    return NextResponse.json(rentals[0]);
  } catch (error) {
    console.error("Error fetching rental details:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const id = params.id;
    const body = await request.json();

    // Check ownership
    const rentalCheck = await queryDatabase(
      "SELECT user_id FROM rentals WHERE rental_id = $1",
      [id]
    );

    if (rentalCheck.length === 0) {
      return NextResponse.json({ error: "Rental not found" }, { status: 404 });
    }

    if (rentalCheck[0].user_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const {
      deviceType,
      deviceName,
      description,
      specs,
      hourlyRate,
      locationCity,
      locationAddress,
      hasInternet,
      hasBackupPower,
      status,
    } = body;

    await withTransaction(async (client) => {
      await client.query(
        `UPDATE rentals SET
          device_type = COALESCE($1, device_type),
          device_name = COALESCE($2, device_name),
          description = COALESCE($3, description),
          specs = COALESCE($4, specs),
          hourly_rate = COALESCE($5, hourly_rate),
          location_city = COALESCE($6, location_city),
          location_address = COALESCE($7, location_address),
          has_internet = COALESCE($8, has_internet),
          has_backup_power = COALESCE($9, has_backup_power),
          status = COALESCE($10, status),
          updated_at = CURRENT_TIMESTAMP
        WHERE rental_id = $11`,
        [
          deviceType,
          deviceName,
          description,
          specs,
          hourlyRate,
          locationCity,
          locationAddress,
          hasInternet,
          hasBackupPower,
          status,
          id,
        ]
      );
    });

    return NextResponse.json({ message: "Rental updated successfully" });
  } catch (error) {
    console.error("Error updating rental:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
