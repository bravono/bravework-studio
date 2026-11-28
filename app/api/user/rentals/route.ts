import { NextResponse } from "next/server";
import { queryDatabase, withTransaction } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

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
        u.first_name AS "firstName",
        u.last_name AS "lastName",
        u.email,
        u.phone,
        ARRAY_REMOVE(ARRAY_AGG(ri.image_url), NULL) AS "imagesArray"
       FROM rentals r
       LEFT JOIN rental_images ri ON r.rental_id = ri.rental_id
       JOIN users u ON r.user_id = u.user_id
       WHERE r.user_id = $1 AND r.deleted_at IS NULL
       GROUP BY
        r.rental_id,
        r.user_id,
        r.device_type,
        r.device_name,
        r.description,
        r.specs,
        r.ram,
        r.storage,
        r.processor,
        r.system_type,
        r.hourly_rate_kobo,
        r.location_city,
        r.location_address,
        r.location_lat,
        r.location_lng,
        r.has_internet,
        r.has_backup_power,
        r.rental_type,
        r.is_partner,
        r.is_office,
        r.created_at,
        u.first_name,
        u.last_name,
        u.email,
        u.phone`,
      [userId],
    );

    console.log("Rentals", rentals);
    return NextResponse.json(rentals);
  } catch (error) {
    console.error("Error fetching rental details:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
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

    const contentType = request.headers.get("content-type") || "";
    let body: any;

    if (contentType.includes("application/json")) {
      body = await request.json();
    } else if (
      contentType.includes("multipart/form-data") ||
      contentType.includes("application/x-www-form-urlencoded")
    ) {
      const formData = await request.formData();
      body = Object.fromEntries(formData.entries());
      // Handle images specifically if it's a string in formData
      if (typeof body.images === "string") {
        try {
          body.images = JSON.parse(body.images);
        } catch {
          body.images = [];
        }
      }
    } else {
      return NextResponse.json(
        {
          error:
            "Invalid Content-Type. Expected application/json, multipart/form-data or application/x-www-form-urlencoded",
        },
        { status: 400 },
      );
    }

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

    let hourlyRateKobo = hourlyRate * 100;

    // Enforce fixed rate for partner hubs
    if (rentalType === "hub" && isPartner) {
      hourlyRateKobo = 50000; // ₦500
    }

    console.log("Rental Request Body", body);

    // Convert file to array from string if it came in as part of body but needs parsing
    let files: any[] = Array.isArray(images) ? images : [];
    if (typeof images === "string" && files.length === 0) {
      try {
        files = JSON.parse(images);
      } catch {
        files = [];
      }
    }

    return await withTransaction(async (client) => {
      const rentalResult = await client.query(
        "INSERT INTO rentals (user_id, device_type, device_name, description, specs, ram, storage, processor, system_type, hourly_rate_kobo, location_city, location_address, location_lat, location_lng, has_internet, has_backup_power, rental_type, is_partner, is_office, approval_status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, NOW()) RETURNING rental_id",
        [
          userId,
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
          locationLat || null,
          locationLng || null,
          hasInternet,
          hasBackupPower,
          rentalType || "p2p",
          isPartner || false,
          isOffice || false,
          "pending",
        ],
      );
      const newRentalId = rentalResult.rows[0].rental_id;

      if (Array.isArray(files) && files.length > 0) {
        for (const file of files) {
          const fileUrl = typeof file === "string" ? file : file?.fileUrl || file?.url;
          const fileName = typeof file === "string" ? null : file?.fileName || file?.name || null;
          const fileSize = typeof file === "string" ? null : file?.fileSize || file?.size || null;
          await client.query(
            "INSERT INTO rental_images (rental_id, image_name, image_size, image_url) VALUES ($1, $2, $3, $4)",
            [newRentalId, fileName, fileSize, fileUrl],
          );
        }
      }

      return NextResponse.json(newRentalId, { status: 201 });
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { message: "Error creating order" },
      { status: 500 },
    );
  }
}



export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing rental id" }, { status: 400 });
    }
    // Verify ownership
    const rentalCheck = await queryDatabase(
      "SELECT user_id FROM rentals WHERE rental_id = $1",
      [id],
    );
    if (rentalCheck.length === 0) {
      return NextResponse.json({ error: "Rental not found" }, { status: 404 });
    }
    if (rentalCheck[0].user_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await queryDatabase(
      "UPDATE rentals SET deleted_at = CURRENT_TIMESTAMP WHERE rental_id = $1",
      [id],
    );
    return NextResponse.json({ message: "Rental soft-deleted" });
  } catch (error) {
    console.error("Error deleting rental:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
