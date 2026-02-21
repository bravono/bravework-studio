import { NextResponse } from "next/server";
import { queryDatabase } from "@/lib/db";
import { verifyAdmin } from "@/lib/auth/admin-auth-guard";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const guardResponse = await verifyAdmin(request);
    if (guardResponse) return guardResponse;

    const userId = params.id;
    const currentRolesResult = await queryDatabase(
      `SELECT r.role_name 
       FROM user_roles ur 
       JOIN roles r ON ur.role_id = r.role_id 
       WHERE ur.user_id = $1`,
      [userId],
    );

    const roles = currentRolesResult.map((row: any) => row.role_name);
    return NextResponse.json({ roles });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    // 1. Authenticate the user
    const guardResponse = await verifyAdmin(request);
    if (guardResponse) return guardResponse;

    const userId = params.id;
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { roles } = body; // All role names the user SHOULD have

    if (!Array.isArray(roles)) {
      return NextResponse.json(
        { error: "Roles must be an array" },
        { status: 400 },
      );
    }

    // 1. Get role details for all selected roles
    const validRolesResult = await queryDatabase(
      `SELECT role_id, role_name FROM roles WHERE role_name = ANY($1)`,
      [roles],
    );

    const validRoleIds = validRolesResult.map((r: any) => r.role_id);
    const validRoleNames = validRolesResult.map((r: any) => r.role_name);

    // 2. Remove roles that are NOT in the selected list
    await queryDatabase(
      `DELETE FROM user_roles 
       WHERE user_id = $1 AND role_id NOT IN (
         SELECT role_id FROM roles WHERE role_name = ANY($2)
       )`,
      [userId, roles.length > 0 ? roles : ["__NONE__"]],
    );

    // 3. Add roles that are in the list but not yet assigned
    const assignedRoles: string[] = [];
    for (const role of validRolesResult) {
      const { role_id, role_name } = role;

      // Check if assignment exists
      const existing = await queryDatabase(
        `SELECT user_role_id FROM user_roles WHERE user_id = $1 AND role_id = $2`,
        [userId, role_id],
      );

      if (existing.length === 0) {
        await queryDatabase(
          `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)`,
          [userId, role_id],
        );
        assignedRoles.push(role_name);
      }

      // Sync instructor table if needed
      if (role_name === "instructor") {
        const userResult = await queryDatabase(
          `SELECT first_name, last_name, email, bio, profile_picture_url FROM users WHERE user_id = $1`,
          [userId],
        );

        if (userResult.length > 0) {
          const user = userResult[0];
          await queryDatabase(
            `INSERT INTO instructors (first_name, last_name, email, bio, photo_url) 
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (email) DO NOTHING`,
            [
              user.first_name,
              user.last_name,
              user.email,
              user.bio,
              user.profile_picture_url,
            ],
          );
        }
      }
    }

    return NextResponse.json({
      message: "Roles updated successfully",
      currentRoles: validRoleNames,
    });
  } catch (error: any) {
    console.error("Error updating roles:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
