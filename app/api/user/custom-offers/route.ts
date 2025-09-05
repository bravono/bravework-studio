import { NextResponse } from "next/server";
import { queryDatabase } from "@/lib/db";
import { verifyUser } from "@/lib/auth/user-auth-guard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await verifyUser();
    const isAuthenticated = user.isAuthenticated;
    const userId = user.userId;

    if (!isAuthenticated || !userId) {
      console.error("Authentication failed: No valid token or session found.");
      throw new Error(
        "Authentication failed. Please log in or use a valid link."
      );
    }

    const queryText = `
     SELECT
      co.offer_id AS "id",
      co.order_id AS "orderId",
      co.user_id AS "userId",
      co.description,
      co.offer_amount_in_kobo AS "offerAmount",
      co.created_at AS "createdAt",
      co.expires_at AS "expiresAt",
      cos.name AS "status",
      (
      SELECT COALESCE(SUM(amount_kobo), 0)
      FROM payments
      WHERE order_id = co.order_id
      ) AS "totalPaid",
      p.discount_applied_percentage AS "discount"
    FROM custom_offers co
    JOIN custom_offer_statuses cos ON co.status_id = cos.offer_status_id
    LEFT JOIN (
      SELECT DISTINCT ON (order_id) *
      FROM payments
      ORDER BY order_id, created_at DESC
    ) p ON co.order_id = p.order_id
    WHERE co.user_id = $1
    `;
    const result = await queryDatabase(queryText, [userId]);

    console.log("Custom offers fetched for user:", result);


    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=59", // Cache for 60 seconds, allow stale for another 59s
      },
    });
  } catch (error) {
    console.error("Error fetching custom offers:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
