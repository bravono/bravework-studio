// app/api/admin/users/route.ts
import { NextResponse } from "next/server";
import { queryDatabase } from "../../../../lib/db";
import { verifyAdmin } from "@/lib/auth/admin-auth-guard";

export async function GET(request: Request) {
  const guardResponse = await verifyAdmin(request);
  if (guardResponse) return guardResponse;

  try {
    // If user is admin, fetch all users (example)
    const allUsers = await queryDatabase(
      `
      SELECT
      u.user_id AS id,
      (u.first_name || ' ' || u.last_name) AS "fullName",
      u.email,
      u.email_verified AS "emailVerified",
      u.created_at AS "createdAt",
      COALESCE(
        json_agg(
        json_build_object(
          'roleName', r.role_name
        )
        ) FILTER (WHERE ur.user_id IS NOT NULL),
        '[]'
      ) AS roles
      FROM users u
      LEFT JOIN user_roles ur ON u.user_id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.role_id
      GROUP BY u.user_id, u.first_name, u.last_name, u.email, u.email_verified, u.created_at
      `
    );
    return NextResponse.json(allUsers);
  } catch (error) {
    console.error("Error fetching all users:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
