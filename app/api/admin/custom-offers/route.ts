import { NextResponse } from "next/server";
import { queryDatabase, withTransaction } from "../../../../lib/db";
import { verifyAdmin } from "../../../../lib/admin-auth-guard";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const guardResponse = await verifyAdmin(request);
    if (guardResponse) return guardResponse;

    const offers = await queryDatabase(
      "SELECT * FROM custom_offers ORDER BY created_at DESC"
    );
    return NextResponse.json(offers);
  } catch (error) {
    console.error("Error fetching custom offers:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const guardResponse = await verifyAdmin(request);
    if (guardResponse) return guardResponse;

    const body = await request.json();
    const { orderId, userId, offerAmount, description } = body;

    if (
      !orderId ||
      !userId ||
      offerAmount === undefined ||
      description === undefined
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: orderId, userId, offerAmount, description",
        },
        { status: 400 }
      );
    }
    if (isNaN(offerAmount) || offerAmount < 0) {
      return NextResponse.json(
        { error: "Invalid offer amount" },
        { status: 400 }
      );
    }

    const createdAt = new Date().toISOString();
    const status = 1; // Default status for a new custom offer is pending

    const queryText = `
      INSERT INTO custom_offers (
         order_id, user_id, offer_amount_in_kobo, description, created_at, status
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        offer_id AS id, order_id AS "orderId", user_id AS "userId",
        offer_amount_in_kobo AS "offerAmount", description, created_at AS "createdAt", status;
    `;
    const params = [
      orderId,
      userId,
      offerAmount,
      description,
      createdAt,
      status,
    ];

    const result = await queryDatabase(queryText, params);

    if (result.length === 0) {
      throw new Error("Failed to create custom offer.");
    }

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating custom offer:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }

}

export async function PATCH(request: Request) {
  try {
    const guardResponse = await verifyAdmin(request);
    if (guardResponse) return guardResponse;

    const { searchParams } = new URL(request.url);
    const offerId = searchParams.get("id");
    if (!offerId) {
      return NextResponse.json(
        { error: "Offer ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { offerAmount, description, status } = body; // Fields that can be updated

    let updateFields: string[] = [];
    let updateParams: any[] = [];
    let paramIndex = 1;

    if (offerAmount !== undefined) {
      if (isNaN(offerAmount) || offerAmount < 0) {
        return NextResponse.json(
          { error: "Invalid offer amount" },
          { status: 400 }
        );
      }
      updateFields.push(`offer_amount = $${paramIndex++}`);
      updateParams.push(offerAmount);
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      updateParams.push(description);
    }
    if (status !== undefined) {
      updateFields.push(`status = $${paramIndex++}`);
      updateParams.push(status);
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { message: "No fields to update" },
        { status: 200 }
      );
    }

    updateParams.push(offerId); // Add offerId for WHERE clause

    const queryText = `
      UPDATE custom_offers
      SET ${updateFields.join(", ")}
      WHERE offer_id = $${paramIndex}
      RETURNING
        offer_id AS id, order_id AS "orderId", user_id AS "userId",
        offer_amount AS "offerAmount", description, created_at AS "createdAt", status;
    `;

    const result = await queryDatabase(queryText, updateParams);

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Custom offer not found or no update performed" },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error updating custom offer:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const guardResponse = await verifyAdmin(request);
    if (guardResponse) return guardResponse;

    const { searchParams } = new URL(request.url);
    const offerId = searchParams.get("id");
    if (!offerId) {
      return NextResponse.json(
        { error: "Offer ID is required" },
        { status: 400 }
      );
    }

    const queryText = `
      DELETE FROM custom_offers
      WHERE offer_id = $1
      RETURNING offer_id;off
    `;

    const result = await queryDatabase(queryText, [offerId]);

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Custom offer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `Custom offer ${offerId} deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting custom offer:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Continue From Modals
