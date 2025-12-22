import { NextResponse } from "next/server";
import { queryDatabase, withTransaction } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const deviceType = searchParams.get("deviceType");

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
        r.created_at AS "createdAt"
      FROM rentals r
      WHERE approval_status = 'approved' AND is_active = true
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

    queryText += ` ORDER BY r.created_at DESC`;

    const rentals = await queryDatabase(queryText, params);

    return NextResponse.json(rentals);
  } catch (error) {
    console.error("Error fetching rentals:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
