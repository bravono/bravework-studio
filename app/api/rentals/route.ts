import { NextResponse } from "next/server";
import { queryDatabase, withTransaction } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const deviceType = searchParams.get("deviceType");
    const rentalType = searchParams.get("rentalType");
    const isPartner = searchParams.get("isPartner");

    let queryText = `
      SELECT
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
        r.rental_type AS "rentalType",
        r.is_partner AS "isPartner",
        r.is_office AS "isOffice",
        u.is_verified AS "ownerVerified"
      FROM rentals r
      JOIN users u ON r.user_id = u.user_id
      WHERE r.approval_status = 'approved' AND r.is_active = true AND r.deleted_at IS NULL
      `;
    const params: any[] = [];

    if (city) {
      params.push(`%${city}%`);
      queryText += ` AND location_city ILIKE $${params.length}`;
    }

    if (deviceType) {
      params.push(deviceType);
      queryText += ` AND device_type = $${params.length}`;
    }

    if (rentalType) {
      params.push(rentalType);
      queryText += ` AND rental_type = $${params.length}`;
    }

    if (isPartner !== null) {
      params.push(isPartner === "true");
      queryText += ` AND is_partner = $${params.length}`;
    }

    queryText += ` ORDER BY r.created_at DESC`;

    const rentals = await queryDatabase(queryText, params);
    console.log("rentals", rentals);

    return NextResponse.json(rentals);
  } catch (error) {
    console.error("Error fetching rentals:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
