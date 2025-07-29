// app/api/admin/users/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth-options";
import { queryDatabase } from "../../../../lib/db";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  // 1. Check if authenticated
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // 2. Check for specific role (Authorization)
  const userRoles = (session.user as any).roles;

  if (!userRoles?.some((role: string) => role.toLowerCase() === "admin")) {
    return NextResponse.json(
      { message: "Forbidden: Insufficient permissions" },
      { status: 403 }
    );
  }

  try {
    // If user is admin, fetch all users (example)
    const allUsers = await queryDatabase(
      "SELECT user_id, first_name, last_name, email, FROM users"
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
