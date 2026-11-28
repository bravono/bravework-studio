// app/api/user/notifications/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options"; // Adjust path as needed
import { queryDatabase } from "../../../../lib/db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    // 1. Authenticate the user
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 400 }
      );
    }

    // 2. Fetch notifications for the authenticated user
    // We'll also join with custom_offers to get offer details if the notification links to one
    // and with custom_offer_statuses to get the offer's status name.
    const queryText = `
      SELECT
        n.notification_id AS id,
        n.title,
        n.message,
        n.link,
        n.is_read AS "isRead",
        n.created_at AS "createdAt",
        -- Include custom offer details if the link is for an offer
        co.offer_id AS "offerId",
        co.offer_amount_in_kobo AS "offerAmount",
        co.description AS "offerDescription",
        cos.name AS "offerStatus", -- Get the name of the offer status
        co.expires_at AS "offerExpiresAt"
      FROM notifications n
      LEFT JOIN custom_offers co ON n.link LIKE '%' || co.offer_id || '%' AND n.link LIKE '/user/dashboard/notifications/%'
      LEFT JOIN custom_offer_statuses cos ON co.status_id = cos.offer_status_id
      WHERE n.user_id = $1
      ORDER BY n.created_at DESC;
    `;

    const result = await queryDatabase(queryText, [userId]);

    // 3. Convert Date objects to ISO strings for JSON serialization
    const serializableNotifications = result.map((notification: any) => {
      if (notification.createdAt instanceof Date) {
        notification.createdAt = notification.createdAt.toISOString();
      }
      if (notification.offerExpiresAt instanceof Date) {
        notification.offerExpiresAt = notification.offerExpiresAt.toISOString();
      }
      return notification;
    });

    return NextResponse.json(serializableNotifications);
  } catch (error: any) {
    console.error("Error fetching user notifications:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// NEW: PATCH method to mark a notification as read
export async function PATCH(request: Request) {
  try {
    // 1. Authenticate the user
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get("id");
    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { isRead } = body;

    if (typeof isRead !== "boolean") {
      return NextResponse.json(
        { error: "Invalid value for isRead" },
        { status: 400 }
      );
    }

    // Update the notification status, ensuring it belongs to the user
    const queryText = `
      UPDATE notifications
      SET is_read = $1
      WHERE notification_id = $2 AND user_id = $3
      RETURNING notification_id AS id, is_read AS "isRead";
    `;
    const result = await queryDatabase(queryText, [
      isRead,
      notificationId,
      userId,
    ]);

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Notification not found or does not belong to user" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Notification updated successfully",
      notification: result[0],
    });
  } catch (error: any) {
    console.error("Error updating notification status:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
