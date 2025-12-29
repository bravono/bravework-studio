// Route to fetch rentals for a specific user ID
import { NextResponse } from "next/server";
import { queryDatabase, withTransaction } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { KOBO_PER_NAIRA } from "@/lib/constants";
import { del } from "@vercel/blob";

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
        *,
        COALESCE(
          (SELECT json_agg(json_build_object(
            'fileName', ri.image_name,
            'fileSize', ri.image_size,
            'fileUrl', ri.image_url
          ))
          FROM rental_images ri
          WHERE ri.rental_id = rentals.rental_id),
          '[]'
        ) AS images
       FROM rentals WHERE rental_id = $1 AND user_id = $2`,
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
      hourlyRate,
      locationCity,
      locationAddress,
      hasInternet,
      hasBackupPower,
    } = body;

    // Convert hourlyRate to kobo if provided
    const hourlyRateKobo = hourlyRate
      ? parseInt(hourlyRate) * KOBO_PER_NAIRA
      : null;

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
          updated_at = CURRENT_TIMESTAMP
        WHERE rental_id = $10`,
        [
          deviceType,
          deviceName,
          description,
          specs,
          hourlyRateKobo,
          locationCity,
          locationAddress,
          hasInternet,
          hasBackupPower,
          rentalId,
        ]
      );

      if (images && Array.isArray(images)) {
        // Find images to delete from Blob storage
        const currentImagesResult = await client.query(
          "SELECT image_url FROM rental_images WHERE rental_id = $1",
          [rentalId]
        );
        const currentUrls = currentImagesResult.rows.map(
          (row) => row.image_url
        );
        const newUrls = images.map((img) => img.fileUrl);
        const urlsToDelete = currentUrls.filter(
          (url) => !newUrls.includes(url)
        );

        // Delete from Blob storage
        if (urlsToDelete.length > 0) {
          try {
            await del(urlsToDelete);
            console.log("Deleted images from blob:", urlsToDelete);
          } catch (blobError) {
            console.error("Error deleting blobs:", blobError);
            // We don't throw here to avoid failing the whole transaction
            // if the blob is already gone or there's a network issue
          }
        }

        // Update database records
        await client.query("DELETE FROM rental_images WHERE rental_id = $1", [
          rentalId,
        ]);
        for (const file of images) {
          const { fileName, fileSize, fileUrl } = file;
          await client.query(
            "INSERT INTO rental_images (rental_id, image_name, image_size, image_url) VALUES ($1, $2, $3, $4)",
            [rentalId, fileName, fileSize, fileUrl]
          );
        }
      }
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
