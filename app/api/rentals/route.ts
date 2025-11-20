
import { NextResponse } from "next/server";
import { queryDatabase, withTransaction } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const deviceType = searchParams.get("deviceType");

    let queryText = `
      SELECT * FROM rentals
      WHERE status = 'active'
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

    queryText += ` ORDER BY created_at DESC`;

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

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      deviceType,
      deviceName,
      description,
      specs,
      hourlyRate,
      locationCity,
      locationAddress,
      locationLat,
      locationLng,
      hasInternet,
      hasBackupPower,
    } = body;

    // Basic validation
    if (
      !deviceType ||
      !deviceName ||
      !hourlyRate ||
      !locationCity
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await withTransaction(async (client) => {
      const res = await client.query(
        `INSERT INTO rentals (
          user_id, device_type, device_name, description, specs, hourly_rate,
          location_city, location_address, location_lat, location_lng,
          has_internet, has_backup_power
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING rental_id`,
        [
          userId,
          deviceType,
          deviceName,
          description,
          specs,
          hourlyRate,
          locationCity,
          locationAddress,
          locationLat,
          locationLng,
          hasInternet || false,
          hasBackupPower || false,
        ]
      );
      return res.rows[0].rental_id;
    });

    return NextResponse.json({ rentalId: result }, { status: 201 });
  } catch (error) {
    console.error("Error creating rental:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
