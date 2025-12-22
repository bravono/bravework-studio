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
        u.first_name AS "firstName",
        u.last_name AS "lastName",
        u.email,
        u.phone
       FROM rentals r
       JOIN users u ON r.user_id = u.user_id
       WHERE r.user_id = $1`,
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
      const rentalResult = await client.query(
        "INSERT INTO rentals (user_id, device_type, device_name, description, specs, hourly_rate, location_city, location_address, has_internet, has_backup_power, approval_status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW()) RETURNING rental_id",
        [
          userId,
          deviceType,
          deviceName,
          description,
          specs,
          hourlyRate,
          locationCity,
          locationAddress,
          hasInternet,
          hasBackupPower,
          "pending",
        ]
      );
      const newRentalId = rentalResult.rows[0].order_id;

      if (Array.isArray(files) && files.length > 0) {
        for (const file of files) {
          const { fileName, fileSize, fileUrl } = file;
          await client.query(
            "INSERT INTO rental_images (rental_id, file_name, file_size, file_url) VALUES ($1, $2, $3, $4)",
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

    if (!userId) {
      console.error("Session user ID is missing when fetching orders.");
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 400 }
      );
    }

    const id = params.id;
    const body = await request.json();
    const KOBO_PER_NAIRA = 100;

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
          hourly_rate_kobo = COALESCE($5, hourly_rate_kobo),
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
          hourlyRate * KOBO_PER_NAIRA,
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
      [id]
    );
    if (rentalCheck.length === 0) {
      return NextResponse.json({ error: "Rental not found" }, { status: 404 });
    }
    if (rentalCheck[0].user_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await queryDatabase("DELETE FROM rentals WHERE rental_id = $1", [id]);
    return NextResponse.json({ message: "Rental deleted" });
  } catch (error) {
    console.error("Error deleting rental:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
