import { NextResponse } from "next/server";
import { queryDatabase } from "@/lib/db";
import { verifyAdmin } from "@/lib/auth/admin-auth-guard";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authenticate the user
    const guardResponse = await verifyAdmin(request);
    if (guardResponse) return guardResponse;
    console.log("Admin Check Pass");

    const userId = params.id;
    console.log("User ID:", userId);
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { role } = body;
    console.log("The role to be assigned:", role);

    const roleResult = await queryDatabase(
      `SELECT * FROM roles WHERE role_name = $1`,
      [role]
    );

    console.log("Role Result", roleResult);
    if (roleResult.length === 0) {
      return NextResponse.json(
        { error: "Invalid role selected" },
        { status: 400 }
      );
    }

    console.log("Role found in db:", roleResult);
    const roleId = roleResult[0].role_id;

    const queryText = `
      INSERT INTO user_roles (role_id, user_id) VALUES ($1, $2) RETURNING user_role_id;
    `;

    const result = await queryDatabase(queryText, [roleId, userId]);

    console.log("Result after role assignment", result);
    if (result.length === 0) {
      return NextResponse.json(
        { error: "Role assignment is not successful" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Role assigned successfully",
    });
  } catch (error: any) {
    console.error("Error assigning role to user", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
