import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../../lib/auth-options"; // Adjust path as needed
import { queryDatabase, withTransaction } from "../../../../../../lib/db"; // Adjust path as needed
import { verifySecureToken } from "../../../../../../lib/utils/generateToken"; // Adjust path as needed

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: { offerId: string; action: string } }
) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const verification = verifySecureToken(token);

  if (!verification.valid || verification.expired) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }

  // Verify token in DB
  const { rows } = await queryDatabase(
    "SELECT * FROM secure_tokens WHERE token = $1",
    [token]
  );
  const dbToken = rows[0];

  if (!dbToken || dbToken.used) {
    return NextResponse.json(
      { error: "Token already used or not found" },
      { status: 401 }
    );
  }

  // Mark token as used
  await queryDatabase("UPDATE secure_tokens SET used = true WHERE token = $1", [
    token,
  ]);

  try {
    const { offerId, action } = params;
    const body = await request.json(); // NEW: Read the request body for rejectionReason
    const { rejectionReason } = body; // NEW: Extract rejectionReason

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

    // Validate the action
    if (action !== "accept" && action !== "reject") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Use a transaction for atomicity: fetch offer, check conditions, update status
    return await withTransaction(async (client) => {
      // 2. Fetch the custom offer to verify ownership and status
      // Fetch current status ID to get its name for checks
      const offerQuery = `
        SELECT
          co.offer_id, co.user_id, co.status, co.expires_at, cos.name AS status_name
        FROM custom_offers co
        JOIN custom_offer_statuses cos ON co.status = cos.offer_status_id
        WHERE co.offer_id = $1;
      `;
      const offerResult = await client.query(offerQuery, [offerId]);

      if (offerResult.rows.length === 0) {
        return NextResponse.json(
          { error: "Custom offer not found" },
          { status: 404 }
        );
      }

      const offer = offerResult.rows[0];
      const currentOfferStatusName = offer.status_name; // Use the fetched name

      // 3. Authorization: Ensure the offer belongs to the authenticated user
      if (offer.user_id !== userId) {
        return NextResponse.json(
          { error: "Forbidden: Offer does not belong to this user" },
          { status: 403 }
        );
      }

      // 4. Check offer status: Only 'Pending' offers can be accepted/rejected
      if (currentOfferStatusName.toLowerCase() !== "pending") {
        return NextResponse.json(
          {
            error: `Offer is already ${currentOfferStatusName.toLowerCase()}. Cannot ${action}.`,
          },
          { status: 409 }
        ); // 409 Conflict
      }

      // 5. Check expiry: ensure the offer is not expired
      if (offer.expires_at && new Date(offer.expires_at) < new Date()) {
        const expiredStatusResult = await client.query(
          "SELECT offer_status_id FROM custom_offer_statuses WHERE name = $1",
          ["expired"]
        );
        if (expiredStatusResult.rows.length > 0) {
          const expiredStatusId = expiredStatusResult.rows[0].offer_status_id;
          await client.query(
            "UPDATE custom_offers SET status = $1 WHERE offer_id = $2",
            [expiredStatusId, offerId]
          );
        }
        return NextResponse.json(
          { error: "Offer has expired" },
          { status: 410 }
        ); // 410 Gone
      }

      // 6. Update the offer status based on the action
      const targetStatusName = action === "accept" ? "Accepted" : "Rejected";
      const targetStatusResult = await client.query(
        "SELECT offer_status_id FROM custom_offer_statuses WHERE name = $1",
        [targetStatusName]
      );

      if (targetStatusResult.rows.length === 0) {
        return NextResponse.json(
          {
            error: `Target status '${targetStatusName}' not found in database`,
          },
          { status: 500 }
        );
      }
      const newStatusId = targetStatusResult.rows[0].offer_status_id;

      // Build update query dynamically to include rejection_reason if action is 'reject'
      let updateFields = [`status = $1`];
      let updateParams = [newStatusId];
      let paramIndex = 2; // Start from 2 because $1 is status ID

      if (action === "reject" && rejectionReason !== undefined) {
        updateFields.push(`rejection_reason = $${paramIndex++}`);
        updateParams.push(rejectionReason);
      }
      updateParams.push(offerId); // Last parameter is always offerId for WHERE clause

      const updateQuery = `
        UPDATE custom_offers
        SET ${updateFields.join(", ")}
        WHERE offer_id = $${paramIndex} -- Use paramIndex for the offerId placeholder
        RETURNING offer_id, status, rejection_reason; -- NEW: Return rejection_reason
      `;

      const updateResult = await client.query(updateQuery, updateParams);

      if (updateResult.rows.length === 0) {
        throw new Error("Failed to update offer status.");
      }

      // Optional: Send notification to admin (e.g., via email or in-app notification)
      console.log(
        `Offer ${offerId} ${targetStatusName} by user ${userId}. Reason: ${
          rejectionReason || "N/A"
        }`
      );

      return NextResponse.json({
        message: `Offer ${targetStatusName} successfully`,
        offerId: offerId,
        newStatus: targetStatusName, // Return the string name for frontend convenience
        rejectionReason: action === "reject" ? rejectionReason : undefined, // Include reason in response
      });
    });
  } catch (error) {
    console.error(`Error processing offer action:`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET( // Re-adding GET method here for completeness if you need it in this file
  request: Request,
  { params }: { params: { offerId: string } }
) {
  try {
    const { offerId } = params;

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

    const queryText = `
      SELECT
        co.offer_id AS id,
        co.order_id AS "orderId",
        co.user_id AS "userId",
        co.offer_amount_in_kobo AS "offerAmount",
        co.description,
        co.created_at AS "createdAt",
        cos.name AS status,
        co.expires_at AS "expiresAt",
        co.rejection_reason AS "rejectionReason", -- NEW: Select rejection_reason
        o.category_id AS "orderService",
        o.project_description AS "orderDescription",
        o.budget_range AS "orderBudget"
      FROM custom_offers co
      JOIN custom_offer_statuses cos ON co.status = cos.offer_status_id
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

    if (
      offer.expiresAt &&
      new Date(offer.expiresAt) < new Date() &&
      offer.status === "Pending"
    ) {
      const expiredStatusResult = await queryDatabase(
        "SELECT offer_status_id FROM custom_offer_statuses WHERE name = $1",
        ["Expired"]
      );

      if (expiredStatusResult.rows.length > 0) {
        const expiredStatusId = expiredStatusResult.rows[0].offer_status_id;
        await queryDatabase(
          "UPDATE custom_offers SET status = $1 WHERE offer_id = $2",
          [expiredStatusId, offerId]
        );
        offer.status = "Expired";
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
