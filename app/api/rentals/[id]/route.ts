// Route to fetch rentals for a specific user ID
import { NextResponse } from "next/server";
import { queryDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const rentalId = params.id;

    const rentals = await queryDatabase(
      `SELECT
        r.rental_id AS id,
        r.user_id AS "userId",
        r.device_type AS "deviceType",
        r.device_name AS "deviceName",
        r.description,
        r.specs,
        r.hourly_rate_kobo AS "hourlyRate",
        r.location_city AS "locationCity",
        r.location_address AS "locationAddress",
        r.location_lat AS "locationLat",
        r.location_lng AS "locationLng",
        r.has_internet AS "hasInternet",
        r.has_backup_power AS "hasBackupPower",
        r.approval_status,
        r.created_at AS "createdAt",
        u.first_name AS "ownerFirstName",
        u.last_name AS "ownerLastName",
        u.email AS "ownerEmail",
        u.is_verified AS "ownerVerified",
        ARRAY_REMOVE(ARRAY_AGG(ri.image_url), NULL) AS "imagesArray"
      FROM rentals r
      LEFT JOIN rental_images ri ON r.rental_id = ri.rental_id
      JOIN users u ON r.user_id = u.user_id
      WHERE r.rental_id = $1
      GROUP BY
        r.rental_id,
        r.user_id,
        r.device_type,
        r.device_name,
        r.description,
        r.specs,
        r.hourly_rate_kobo,
        r.location_city,
        r.location_address,
        r.location_lat,
        r.location_lng,
        r.has_internet,
        r.has_backup_power,
        r.approval_status,
        r.created_at,
        u.first_name,
        u.last_name,
        u.email,
        u.is_verified`,
      [rentalId],
    );

    console.log("Rental details:", rentals);
    return NextResponse.json(rentals);
  } catch (error) {
    console.error("Error fetching user rentals:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
