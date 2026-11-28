// Route to fetch rentals for a specific user ID
import { NextResponse } from "next/server";
import { queryDatabase, withTransaction } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { KOBO_PER_NAIRA } from "@/lib/constants";

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

    const userId = (session.user as any).id;

    const rentalId = params.id;

    if (!rentalId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const rentals = await queryDatabase(
      `SELECT
        r.rental_id AS id,
        r.user_id AS "userId",
        r.device_type AS "deviceType",
        r.device_name AS "deviceName",
        r.description,
        r.specs,
        r.ram,
        r.storage,
        r.processor,
        r.system_type AS "systemType",
        r.hourly_rate_kobo AS "hourlyRate",
        r.location_city AS "locationCity",
        r.location_address AS "locationAddress",
        r.location_lat AS "locationLat",
        r.location_lng AS "locationLng",
        r.has_internet AS "hasInternet",
        r.has_backup_power AS "hasBackupPower",
        r.rental_type AS "rentalType",
        r.is_partner AS "isPartner",
        r.is_office AS "isOffice",
        r.created_at AS "createdAt",
        ARRAY_REMOVE(ARRAY_AGG(ri.image_url), NULL) AS "imagesArray"
       FROM rentals r
       LEFT JOIN rental_images ri ON r.rental_id = ri.rental_id
       WHERE r.rental_id = $1 AND r.user_id = $2
       GROUP BY
        r.rental_id`,
      [rentalId, userId]
    );

    if (rentals.length === 0) {
      return NextResponse.json({ error: "Rental not found" }, { status: 404 });
    }

    return NextResponse.json(rentals[0]);
  } catch (error) {
    console.error("Error fetching user rentals:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

async function updateRental(request: Request, rentalId: string, userId: number) {
  // Check ownership
  const rentalCheck = await queryDatabase(
    "SELECT user_id FROM rentals WHERE rental_id = $1",
    [rentalId]
  );

  if (rentalCheck.length === 0) {
    return NextResponse.json({ error: "Rental not found" }, { status: 404 });
  }

  if (rentalCheck[0].user_id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const {
    deviceType,
    deviceName,
    description,
    specs,
    ram,
    storage,
    processor,
    systemType,
    hourlyRate,
    locationCity,
    locationAddress,
    locationLat,
    locationLng,
    hasInternet,
    hasBackupPower,
    rentalType,
    isPartner,
    isOffice,
    images,
  } = body;

  // Convert hourlyRate to kobo if provided
  let hourlyRateKobo = hourlyRate ? parseFloat(hourlyRate) * KOBO_PER_NAIRA : null;
  if (rentalType === "hub" && isPartner) {
    hourlyRateKobo = 50000; // ₦500
  }

  await withTransaction(async (client) => {
    await client.query(
      `UPDATE rentals SET
        device_type = COALESCE($1, device_type),
        device_name = COALESCE($2, device_name),
        description = COALESCE($3, description),
        specs = COALESCE($4, specs),
        ram = COALESCE($5, ram),
        storage = COALESCE($6, storage),
        processor = COALESCE($7, processor),
        system_type = COALESCE($8, system_type),
        hourly_rate_kobo = COALESCE($9, hourly_rate_kobo),
        location_city = COALESCE($10, location_city),
        location_address = COALESCE($11, location_address),
        location_lat = COALESCE($12, location_lat),
        location_lng = COALESCE($13, location_lng),
        has_internet = COALESCE($14, has_internet),
        has_backup_power = COALESCE($15, has_backup_power),
        rental_type = COALESCE($16, rental_type),
        is_partner = COALESCE($17, is_partner),
        is_office = COALESCE($18, is_office),
        updated_at = CURRENT_TIMESTAMP
      WHERE rental_id = $19`,
      [
        deviceType,
        deviceName,
        description,
        specs,
        ram || null,
        storage || null,
        processor || null,
        systemType || null,
        hourlyRateKobo,
        locationCity,
        locationAddress,
        locationLat !== undefined ? (locationLat ? parseFloat(locationLat) : null) : null,
        locationLng !== undefined ? (locationLng ? parseFloat(locationLng) : null) : null,
        hasInternet,
        hasBackupPower,
        rentalType || "p2p",
        isPartner || false,
        isOffice || false,
        rentalId,
      ]
    );

    // Sync images: clear old and insert new ones
    if (images !== undefined && Array.isArray(images)) {
      await client.query("DELETE FROM rental_images WHERE rental_id = $1", [rentalId]);
      for (const file of images) {
        const fileUrl = typeof file === "string" ? file : file?.fileUrl || file?.url;
        const fileName = typeof file === "string" ? null : file?.fileName || file?.name || null;
        const fileSize = typeof file === "string" ? null : file?.fileSize || file?.size || null;
        await client.query(
          "INSERT INTO rental_images (rental_id, image_name, image_size, image_url) VALUES ($1, $2, $3, $4)",
          [rentalId, fileName, fileSize, fileUrl],
        );
      }
    }
  });

  return NextResponse.json({ message: "Rental updated successfully" });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log("PATCH request received");
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const rentalId = params.id;

    if (!rentalId) {
      return NextResponse.json({ error: "Missing rental ID" }, { status: 400 });
    }

    return await updateRental(request, rentalId, userId);
  } catch (error) {
    console.error("Error updating rental:", error);
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
    console.log("PUT request received");
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const rentalId = params.id;

    if (!rentalId) {
      return NextResponse.json({ error: "Missing rental ID" }, { status: 400 });
    }

    return await updateRental(request, rentalId, userId);
  } catch (error) {
    console.error("Error updating rental:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log("DELETE request received");
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const rentalId = params.id;

    if (!rentalId) {
      return NextResponse.json({ error: "Missing rental ID" }, { status: 400 });
    }

    // Check ownership
    const rentalCheck = await queryDatabase(
      "SELECT user_id FROM rentals WHERE rental_id = $1",
      [rentalId]
    );

    if (rentalCheck.length === 0) {
      return NextResponse.json({ error: "Rental not found" }, { status: 404 });
    }

    if (rentalCheck[0].user_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await queryDatabase(
      "UPDATE rentals SET deleted_at = CURRENT_TIMESTAMP WHERE rental_id = $1",
      [rentalId]
    );

    return NextResponse.json({ message: "Rental deleted successfully" });
  } catch (error) {
    console.error("Error deleting rental:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
