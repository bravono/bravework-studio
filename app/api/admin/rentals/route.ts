import { NextResponse } from "next/server";
import { queryDatabase } from "@/lib/db";
import { verifyAdmin } from "@/lib/auth/admin-auth-guard";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const guardResponse = await verifyAdmin(request);
    if (guardResponse) return guardResponse;

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all"; // all, pending, approved, rejected, deleted

    let query = `
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
        r.approval_status AS "approvalStatus",
        r.created_at AS "createdAt",
        r.deleted_at AS "deletedAt",
        u.first_name AS "firstName",
        u.last_name AS "lastName",
        u.email,
        u.phone,
        (
          SELECT json_agg(ri)
          FROM (
            SELECT image_name, image_size, image_url
            FROM rental_images
            WHERE rental_id = r.rental_id
          ) ri
        ) AS images
      FROM rentals r
      JOIN users u ON r.user_id = u.user_id
    `;

    const queryParams: any[] = [];

    if (filter === "deleted") {
      query += " WHERE r.deleted_at IS NOT NULL";
    } else {
      query += " WHERE r.deleted_at IS NULL";
      if (filter === "pending") {
        query += " AND r.approval_status = 'pending'";
      } else if (filter === "approved") {
        query += " AND r.approval_status = 'approved'";
      } else if (filter === "rejected") {
        query += " AND r.approval_status = 'rejected'";
      }
    }

    query += " ORDER BY r.created_at DESC";

    const rentals = await queryDatabase(query, queryParams);

    return NextResponse.json(rentals);
  } catch (error) {
    console.error("Error fetching admin rentals:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
