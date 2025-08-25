import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";
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
        offer_id AS "id",
        user_id AS "userId",
        description,
        offer_amount_in_kobo AS "offerAmount",
        created_at AS "createdAt",
        expires_at AS "expiresAt",
        cos.name AS "status"
      FROM custom_offers co
      JOIN custom_offer_statuses cos ON co.status_id = cos.Offer_status_id
      WHERE user_id = $1
    `;
    const result = await queryDatabase(queryText, [userId]);

    console.log("Custom offers fetched for user:", result);

    if (result.length === 0) {
      return NextResponse.json(
        { error: "No custom offer found for this user" },
        { status: 404 }
      );
    }

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
