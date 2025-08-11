import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../../../lib/auth-options"; // Adjust path as needed
import { queryDatabase, withTransaction } from "../../../../../../lib/db"; // Adjust path as needed
import { verifySecureToken } from "../../../../../../lib/utils/generateToken"; // Adjust path as needed

export const runtime = "nodejs";

// If this GET method is handled by a separate file (e.g., app/api/user/custom-offers/[offerId]/route.ts),
// then you can remove this GET export.
export async function GET(
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
        cos.name AS statusName,
        co.expires_at AS "expiresAt",
        co.rejection_reason AS "rejectionReason",
        o.category_id AS "orderService",
        o.project_description AS "orderDescription",
        o.budget_range AS "orderBudget"
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

    if (
      offer.expiresAt &&
      new Date(offer.expiresAt) < new Date() &&
      offer.statusName === "pending"
    ) {
      const expiredStatusResult = await queryDatabase(
        "SELECT offer_status_id FROM custom_offer_statuses WHERE name = $1",
        ["Expired"]
      );

      if (expiredStatusResult.rows.length > 0) {
        const expiredStatusId = expiredStatusResult.rows[0].offer_status_id;
        await queryDatabase(
          "UPDATE custom_offers SET status_id = $1 WHERE offer_id = $2",
          [expiredStatusId, offerId]
        );
        offer.status_id = "expired";
      } else {
        console.warn(
          "Expired status ID not found in custom_offer_statuses table. Please ensure 'Expired' status exists."
        );
      }
    }

    // Convert Date objects to ISO strings for JSON serialization
    if (offer.createdAt instanceof Date) {
      offer.createdAt = offer.createdAt.toISOString();
    }
    if (offer.expiresAt instanceof Date) {
      offer.expiresAt = offer.expiresAt.toISOString();
    }

    return NextResponse.json(offer);
  } catch (error: any) {
    console.error("Error fetching custom offer details:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { offerId: string; action: string } }
) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  try {
    const { offerId, action } = params;
    const body = await request.json();
    const { rejectionReason } = body;

    console.log(`Processing offer action: ${action} for offerId: ${offerId}`);
    console.log(`Rejection Reason (if applicable): ${rejectionReason}`);

    // Start a transaction for all database operations
    return await withTransaction(async (client) => {
      console.log("Transaction Started for offerId:", offerId);

      let isAuthenticated = false;
      let userId: string | null = null;

      // --- Authentication Logic ---
      if (token) {
        // Scenario 1: Token provided (likely from email link)
        console.log("Token detected. Attempting token-based authentication.");
        const verification = verifySecureToken(token);

        if (!verification.valid || verification.expired) {
          console.log("Invalid or expired token detected.");
          throw new Error(
            "Invalid or expired token. Please try again or log in."
          );
        }

        // Verify token in DB and mark as used within the transaction
        const dbTokenRows = await client.query(
          "SELECT user_id FROM secure_tokens WHERE token = $1 FOR UPDATE", // Use FOR UPDATE to lock the row
          [token]
        );
        const dbToken = dbTokenRows.rows[0];

        if (!dbToken || dbToken.used) {
          console.log(`Token ${token} already used or not found in DB.`);
          throw new Error(
            "Token already used or not found. Please try again or log in."
          );
        }

        await client.query(
          "UPDATE secure_tokens SET used = true WHERE token = $1",
          [token]
        );
        console.log(`Secure token ${token} marked as used within transaction.`);
        userId = dbToken.user_id; // Get userId from the token record
        isAuthenticated = true;
      } else {
        // Scenario 2: No token provided (likely from dashboard, rely on session)
        console.log(
          "No token detected. Attempting session-based authentication."
        );
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !(session.user as any).id) {
          console.log("Unauthorized: No valid session or user ID found.");
          throw new Error(
            "Unauthorized. Please log in to perform this action."
          );
        }
        userId = (session.user as any).id;
        isAuthenticated = true;
      }

      if (!isAuthenticated || !userId) {
        console.error(
          "Authentication failed: No valid token or session found."
        );
        throw new Error(
          "Authentication failed. Please log in or use a valid link."
        );
      }
      console.log(`User ${userId} authenticated successfully.`);

      // Validate the action
      if (action !== "accept" && action !== "reject") {
        console.log("Invalid action:", action);
        throw new Error("Invalid action.");
      }

      // 2. Fetch the custom offer to verify ownership and status
      const offerQuery = `
        SELECT
          co.offer_id, co.user_id, co.status_id, co.expires_at, cos.name AS status_name,
          co.offer_amount_in_kobo AS "offerAmount",
          co.description AS "offerDescription",
          o.category_id AS "orderService",
          o.order_id AS "orderId"
        FROM custom_offers co
        JOIN custom_offer_statuses cos ON co.status_id = cos.offer_status_id
        JOIN orders o ON co.order_id = o.order_id
        WHERE co.offer_id = $1;
      `;
      console.log("Fetching offer details for offerId:", offerId);
      const offerResult = await client.query(offerQuery, [offerId]);

      if (offerResult.rows.length === 0) {
        console.log("Custom offer not found for offerId:", offerId);
        throw new Error("Custom offer not found.");
      }

      const offer = offerResult.rows[0];
      const currentOfferStatusName = offer.status_name;
      console.log("Fetched offer:", offer);
      console.log("Current offer status name:", currentOfferStatusName);

      // 3. Authorization: Ensure the offer belongs to the authenticated user
      if (offer.user_id !== userId) {
        console.log(
          `Forbidden: Offer ${offerId} does not belong to user ${userId}. Offer user_id: ${offer.user_id}`
        );
        throw new Error("Forbidden: Offer does not belong to this user.");
      }

      // 4. Check offer status: Only 'Pending' offers can be accepted/rejected
      if (currentOfferStatusName.toLowerCase() !== "pending") {
        console.log(
          `Offer ${offerId} is already ${currentOfferStatusName.toLowerCase()}. Cannot ${action}.`
        );
        throw new Error(
          `Offer is already ${currentOfferStatusName.toLowerCase()}. Cannot ${action}.`
        );
      }

      // 5. Check expiry: ensure the offer is not expired
      if (offer.expires_at && new Date(offer.expires_at) < new Date()) {
        console.log(
          `Offer ${offerId} has expired. Attempting to update status to 'expired'.`
        );
        const expiredStatusResult = await client.query(
          "SELECT offer_status_id FROM custom_offer_statuses WHERE name = $1",
          ["expired"]
        );
        if (expiredStatusResult.rows.length > 0) {
          const expiredStatusId = expiredStatusResult.rows[0].offer_status_id;
          await client.query(
            "UPDATE custom_offers SET status_id = $1 WHERE offer_id = $2",
            [expiredStatusId, offerId]
          );
          console.log(
            `Offer ${offerId} status updated to expired (${expiredStatusId}).`
          );
        } else {
          console.warn(
            "Expired status ID not found in custom_offer_statuses table. Please ensure 'Expired' status exists."
          );
        }
        throw new Error("Offer has expired.");
      }

      // 6. Update the offer status based on the action
      const targetStatusName = action === "accept" ? "accepted" : "rejected";
      console.log(`Attempting to set offer status to: ${targetStatusName}`);
      const targetStatusResult = await client.query(
        "SELECT offer_status_id FROM custom_offer_statuses WHERE name = $1",
        [targetStatusName]
      );

      if (targetStatusResult.rows.length === 0) {
        console.error(
          `Target status '${targetStatusName}' not found in database.`
        );
        throw new Error(
          `Target status '${targetStatusName}' not found in database.`
        );
      }
      const newStatusId = targetStatusResult.rows[0].offer_status_id;
      console.log(
        `Found target status ID: ${newStatusId} for name: ${targetStatusName}`
      );

      // Build update query dynamically to include rejection_reason if action is 'reject'
      let updateFields = [`status_id = $1`];
      let updateParams = [newStatusId];
      let paramIndex = 2;

      if (action === "reject" && rejectionReason !== undefined) {
        updateFields.push(`rejection_reason = $${paramIndex++}`);
        updateParams.push(rejectionReason);
        console.log(
          `Adding rejection_reason: '${rejectionReason}' to update fields.`
        );
      }
      updateParams.push(offerId);

      const updateQuery = `
        UPDATE custom_offers
        SET ${updateFields.join(", ")}
        WHERE offer_id = $${paramIndex}
        RETURNING offer_id, status_id, rejection_reason;
      `;
      console.log("Executing update query:", updateQuery);
      console.log("Update query parameters:", updateParams);

      const updateResult = await client.query(updateQuery, updateParams);

      console.log("Update query result rows length:", updateResult.rows.length);
      if (updateResult.rows.length === 0) {
        console.error(
          "Failed to update offer status. No rows returned from update query."
        );
        throw new Error("Failed to update offer status.");
      }
      console.log("Offer updated successfully:", updateResult.rows[0]);

      // Optional: Send notification to admin (e.g., via email or in-app notification)
      console.log(
        `Offer ${offerId} ${targetStatusName} by user ${userId}. Reason: ${
          rejectionReason || "N/A"
        }`
      );

      const notificationLink = `/admin/dashboard/notifications/${offerId}`;
      const title = `New User Action`;
      const message = `User with ID ${userId}  has ${action}ed custom offer ${offerId}`;

      // Insert into notifications table to notify admin
      try {
        await queryDatabase(
          `INSERT INTO notifications (
          user_id, title, message, is_read, link, created_at
          ) VALUES ($1, $2, $3, $4, $5, NOW())`,

          [userId, title, message, false, notificationLink]
        );
      } catch (err) {
        console.log("Couldn't insert user's action to the db", err.message);
      }

      // If accepted, redirect to payment page
      let paymentUrl;
      if (action === "accept") {
        paymentUrl = new URL(
          `${process.env.NEXTAUTH_URL}/user/dashboard/payment`
        );
        paymentUrl.searchParams.set("offerId", offer.offer_id);
      }

      return NextResponse.json({
        message: `Offer ${targetStatusName} successfully`,
        offerId: offerId,
        newStatus: targetStatusName,
        rejectionReason: action === "reject" ? rejectionReason : undefined,
        redirectTo: paymentUrl?.toString(), // Include redirect URL in JSON
      });
    });
  } catch (error: any) {
    console.error(`Error processing offer action:`, error);
    let statusCode = 500;
    let errorMessage = "Internal Server Error";

    if (error.message.includes("Token already used or not found")) {
      statusCode = 401;
      errorMessage = "Invalid or expired token. Please try again.";
    } else if (error.message.includes("Unauthorized")) {
      statusCode = 401;
      errorMessage = "Unauthorized. Please log in to perform this action.";
    } else if (error.message.includes("Custom offer not found")) {
      statusCode = 404;
      errorMessage = "Custom offer not found.";
    } else if (error.message.includes("Forbidden")) {
      statusCode = 403;
      errorMessage =
        "You do not have permission to perform this action on this offer.";
    } else if (error.message.includes("Offer is already")) {
      statusCode = 409;
      errorMessage = error.message;
    } else if (error.message.includes("Offer has expired")) {
      statusCode = 410;
      errorMessage = error.message;
    } else if (error.message.includes("Target status")) {
      statusCode = 500;
      errorMessage =
        "Server configuration error: Target offer status not found.";
    } else if (error.message.includes("Failed to update offer status")) {
      statusCode = 500;
      errorMessage = "Failed to update offer status in the database.";
    } else if (error.message.includes("Invalid action")) {
      statusCode = 400;
      errorMessage = "Invalid action specified.";
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
