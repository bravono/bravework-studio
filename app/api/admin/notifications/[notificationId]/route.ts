import { NextResponse } from "next/server";
import { queryDatabase } from "@/lib/db";
import { verifyAdmin } from "@/lib/admin-auth-guard";

export async function GET(request: Request) {
  try {
    const guardResponse = await verifyAdmin(request);
    if (guardResponse) return guardResponse;

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get("id");
    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }

    const notifResult = await queryDatabase(
      "SELECT * FROM notifications n WHERE n.notificationId = $1",
      [notificationId]
    );

    const selectedNotif = notifResult.rows[0];

    return NextResponse.json(selectedNotif);
  } catch (error: any) {
    console.error("Error fetching user notifications:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
