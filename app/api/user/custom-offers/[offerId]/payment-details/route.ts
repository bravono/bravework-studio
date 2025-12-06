import { NextResponse } from "next/server";
import { queryDatabase } from "@/lib/db";
import { verifyUser } from "@/lib/auth/user-auth-guard";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: { offerId: string } }
) {
  try {
    const { offerId } = params;
    const user = await verifyUser();
    const isAuthenticated = user.isAuthenticated;
    const userId = user.userId;

    if (!isAuthenticated || !userId) {
      return NextResponse.json(
        { error: "Authentication failed. Please log in." },
        { status: 401 }
      );
    }

    // Fetch the custom offer with associated order information
    const queryText = `
      SELECT
        co.offer_id AS id,
        co.order_id AS "orderId",
        co.offer_amount_in_kobo AS amount,
        co.description,
        cos.name AS status,
        o.project_duration_days AS "projectDurationDays"
      FROM custom_offers co
      JOIN custom_offer_statuses cos ON co.status_id = cos.offer_status_id
      JOIN orders o ON co.order_id = o.order_id
      WHERE co.offer_id = $1 AND co.user_id = $2;
    `;
    
    const result = await queryDatabase(queryText, [offerId, userId]);

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Custom offer not found or does not belong to this user" },
        { status: 404 }
      );
    }

    const offer = result[0];

    // Check if offer status is acceptable for payment
    if (offer.status !== "pending") {
      return NextResponse.json(
        { error: `This offer is ${offer.status} and cannot be paid.` },
        { status: 400 }
      );
    }

    // Return in the format expected by PaymentContent.tsx
    return NextResponse.json({
      type: "custom-offer",
      data: {
        id: offer.id,
        description: offer.description,
        amount: offer.amount, // in Kobo
        status: offer.status,
        projectDurationDays: offer.projectDurationDays,
      },
      orderId: offer.orderId,
    });
  } catch (error) {
    console.error("Error fetching custom offer payment details:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
