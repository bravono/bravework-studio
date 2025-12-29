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
        r.hourly_rate_kobo AS "hourlyRate",
        r.location_city AS "locationCity",
        r.location_address AS "locationAddress",
        r.location_lat AS "locationLat",
        r.location_lng AS "locationLng",
        r.has_internet AS "hasInternet",
        r.has_backup_power AS "hasBackupPower",
        r.created_at AS "createdAt",
        COALESCE(
          (SELECT json_agg(json_build_object(
            'fileName', ri.image_name,
            'fileSize', ri.image_size,
            'fileUrl', ri.image_url
          ))
          FROM rental_images ri
          WHERE ri.rental_id = r.rental_id),
          '[]'
        ) AS images
       FROM rentals r
       WHERE r.user_id = $1 AND r.deleted_at IS NULL`,
      [userId]
    );

    console.log("Rentals", rentals);
    return NextResponse.json(rentals);
  } catch (error) {
    console.error("Error fetching rental details:", error);
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

    const formData = await request.formData();
    const fields = [
      "deviceType",
      "deviceName",
      "description",
      "specs",
      "hourlyRate",
      "locationCity",
      "locationAddress",
      "hasInternet",
      "hasBackupPower",
      "images",
    ];

    const [
      deviceType,
      deviceName,
      description,
      specs,
      hourlyRate,
      locationCity,
      locationAddress,
      hasInternet,
      hasBackupPower,
      images,
    ] = fields.map((field) => formData.get(field));

    console.log("Rental Form", formData);

    // Convert file to array from string
    let files: any[] = [];
    if (typeof images === "string") {
      try {
        files = JSON.parse(images);
      } catch {
        files = [];
      }
    }

    return await withTransaction(async (client) => {
      const KOBO_PER_NAIRA = 100;
      const hourlyRateKobo = hourlyRate
        ? Number(hourlyRate) * KOBO_PER_NAIRA
        : 0;

      const rentalResult = await client.query(
        "INSERT INTO rentals (user_id, device_type, device_name, description, specs, hourly_rate_kobo, location_city, location_address, has_internet, has_backup_power, approval_status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW()) RETURNING rental_id",
        [
          userId,
          deviceType,
          deviceName,
          description,
          specs,
          hourlyRateKobo,
          locationCity,
          locationAddress,
          hasInternet === "true",
          hasBackupPower === "true",
          "pending",
        ]
      );
      const newRentalId = rentalResult.rows[0].rental_id;

      if (Array.isArray(files) && files.length > 0) {
        for (const file of files) {
          const { fileName, fileSize, fileUrl } = file;
          await client.query(
            "INSERT INTO rental_images (rental_id, image_name, image_size, image_url) VALUES ($1, $2, $3, $4)",
            [newRentalId, fileName, fileSize, fileUrl]
          );
        }
      }

      return NextResponse.json(newRentalId, { status: 201 });
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { message: "Error creating order" },
      { status: 500 }
    );
  }
}

