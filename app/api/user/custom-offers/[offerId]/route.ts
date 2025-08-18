import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options"; // Adjusted path as per your update
import { queryDatabase } from "../../../../../lib/db"; // Adjusted path as per your update

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: { offerId: string } }
) {
  try {
    const { offerId } = params;

    // 1. Authenticate the user (customer)
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

    // 2. Fetch the custom offer details, joining with custom_offer_statuses to get the status name
    // and with orders to get associated order details.
    const queryText = `
      SELECT
        co.offer_id AS id,
        co.order_id AS "orderId",
        co.user_id AS "userId",
        co.offer_amount_in_kobo AS "offerAmount", -- Using your specified column name
        co.description,
        co.created_at AS "createdAt",
        cos.name AS status, -- <--- CORRECTED: Get the status name from the custom_offer_statuses table
        co.expires_at AS "expiresAt",
        o.category_id AS "orderService",
        o.project_description AS "orderDescription",
        o.budget_range AS "orderBudget",
        pc.category_name AS "categoryName" 
      FROM custom_offers co
      JOIN custom_offer_statuses cos ON co.status_id = cos.offer_status_id -- <--- CORRECTED: Join to get status name
      JOIN orders o ON co.order_id = o.order_id
      JOIN product_categories pc ON o.category_id = pc.category_id
      WHERE co.offer_id = $1 AND co.user_id = $2; -- Crucial: ensure offer belongs to the user
    `;
    const result = await queryDatabase(queryText, [offerId, userId]);

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Custom offer not found or does not belong to this user" },
        { status: 404 }
      );
    }

    const offer = result[0];

    // Check if the offer has expired when fetching and it's still 'Pending'
    // The 'status' here is now the string name from the JOIN, so the comparison is valid.
    if (
      offer.expiresAt &&
      new Date(offer.expiresAt) < new Date() &&
      offer.status === "pending" // This comparison is now correct because 'offer.status' is the string name
    ) {
      // If expired, update its status in the database to 'Expired'
      // First, get the integer ID for 'Expired' status
      const expiredStatusResult = await queryDatabase(
        "SELECT offer_status_id FROM custom_offer_statuses WHERE name = $1",
        ["expired"] // Assuming the exact name for expired status is 'Expired'
      );

      if (expiredStatusResult.length > 0) {
        const expiredStatusId = expiredStatusResult[0].offer_status_id;
        // Update the custom_offers table using the integer ID
        await queryDatabase(
          "UPDATE custom_offers SET status_id = $1 WHERE offer_id = $2",
          [expiredStatusId, offerId]
        );
        offer.status = "expired"; // Update in memory for immediate response
      } else {
        console.warn(
          "Expired status ID not found in custom_offer_statuses table. Please ensure 'Expired' status exists."
        );
      }
    }

    return NextResponse.json(offer);
  } catch (error) {
    console.error("Error fetching custom offer details:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
