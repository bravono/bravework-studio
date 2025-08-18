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
      "SELECT user_id, first_name, last_name, email FROM users"
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
