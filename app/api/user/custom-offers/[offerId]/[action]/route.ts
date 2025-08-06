// app/api/user/custom-offers/[offerId]/[action]/route.ts
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

  // Token verification should still happen outside the transaction
  // because if the token is invalid, we don't even need to start a transaction.
  if (!token) {
    console.log("POST /api/user/custom-offers - Missing token");
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const verification = verifySecureToken(token);

  if (!verification.valid || verification.expired) {
    console.log("POST /api/user/custom-offers - Invalid or expired token");
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }

  try {
    const { offerId, action } = params;
    const body = await request.json();
    const { rejectionReason } = body;

    console.log(`Processing offer action: ${action} for offerId: ${offerId}`);
    console.log(`Rejection Reason (if applicable): ${rejectionReason}`);


    // 1. Authenticate the user (customer)
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      console.log("POST /api/user/custom-offers - Unauthorized: No session or user");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId) {
      console.log("POST /api/user/custom-offers - User ID not found in session");
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 400 }
      );
    }

    // Validate the action
    if (action !== "accept" && action !== "reject") {
      console.log("POST /api/user/custom-offers - Invalid action:", action);
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Use a transaction for atomicity: fetch offer, check conditions, update status
    return await withTransaction(async (client) => {
      console.log("Transaction Started for offerId:", offerId);

      // Verify token in DB AND Mark token as used within the transaction
      const dbTokenRows = await client.query(
        "SELECT * FROM secure_tokens WHERE token = $1 FOR UPDATE", // Use FOR UPDATE to lock the row
        [token]
      );
      const dbToken = dbTokenRows.rows[0];

      if (!dbToken || dbToken.used) {
        console.log(`Token ${token} already used or not found.`);
        // If token is already used or not found, throw error to rollback transaction
        // This ensures the transaction doesn't proceed with an invalid token.
        throw new Error("Token already used or not found.");
      }

      await client.query("UPDATE secure_tokens SET used = true WHERE token = $1", [
        token,
      ]);
      console.log(`Secure token ${token} marked as used within transaction.`);


      // 2. Fetch the custom offer to verify ownership and status
      // Fetch current status ID to get its name for checks
      const offerQuery = `
        SELECT
          co.offer_id, co.user_id, co.status, co.expires_at, cos.name AS status_name,
          co.offer_amount_in_kobo AS "offerAmount" -- Fetch amount for redirection if needed
        FROM custom_offers co
        JOIN custom_offer_statuses cos ON co.status = cos.offer_status_id
        WHERE co.offer_id = $1;
      `;
      console.log("Fetching offer details for offerId:", offerId);
      const offerResult = await client.query(offerQuery, [offerId]);

      if (offerResult.rows.length === 0) {
        console.log("Custom offer not found for offerId:", offerId);
        throw new Error("Custom offer not found."); // Throw to trigger rollback
      }

      const offer = offerResult.rows[0];
      const currentOfferStatusName = offer.status_name;
      console.log("Fetched offer:", offer);
      console.log("Current offer status name:", currentOfferStatusName);

      // 3. Authorization: Ensure the offer belongs to the authenticated user
      if (offer.user_id !== userId) {
        console.log(`Forbidden: Offer ${offerId} does not belong to user ${userId}. Offer user_id: ${offer.user_id}`);
        throw new Error("Forbidden: Offer does not belong to this user."); // Throw to trigger rollback
      }

      // 4. Check offer status: Only 'Pending' offers can be accepted/rejected
      if (currentOfferStatusName.toLowerCase() !== "pending") {
        console.log(`Offer ${offerId} is already ${currentOfferStatusName.toLowerCase()}. Cannot ${action}.`);
        throw new Error(`Offer is already ${currentOfferStatusName.toLowerCase()}. Cannot ${action}.`); // Throw to trigger rollback
      }

      // 5. Check expiry: ensure the offer is not expired
      if (offer.expires_at && new Date(offer.expires_at) < new Date()) {
        console.log(`Offer ${offerId} has expired. Updating status to 'expired'.`);
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
          console.log(`Offer ${offerId} status updated to expired (${expiredStatusId}).`);
        } else {
          console.warn("Expired status ID not found in custom_offer_statuses table. Please ensure 'Expired' status exists.");
        }
        throw new Error("Offer has expired."); // Throw to trigger rollback
      }

      // 6. Update the offer status based on the action
      const targetStatusName = action === "accept" ? "Accepted" : "Rejected";
      console.log(`Attempting to set offer status to: ${targetStatusName}`);
      const targetStatusResult = await client.query(
        "SELECT offer_status_id FROM custom_offer_statuses WHERE name = $1",
        [targetStatusName]
      );

      if (targetStatusResult.rows.length === 0) {
        console.error(`Target status '${targetStatusName}' not found in database.`);
        throw new Error(`Target status '${targetStatusName}' not found in database.`); // Throw to trigger rollback
      }
      const newStatusId = targetStatusResult.rows[0].offer_status_id;
      console.log(`Found target status ID: ${newStatusId} for name: ${targetStatusName}`);

      // Build update query dynamically to include rejection_reason if action is 'reject'
      let updateFields = [`status = $1`];
      let updateParams = [newStatusId];
      let paramIndex = 2; // Start from 2 because $1 is status ID

      if (action === "reject" && rejectionReason !== undefined) {
        updateFields.push(`rejection_reason = $${paramIndex++}`);
        updateParams.push(rejectionReason);
        console.log(`Adding rejection_reason: '${rejectionReason}' to update fields.`);
      }
      updateParams.push(offerId); // Last parameter is always offerId for WHERE clause

      const updateQuery = `
        UPDATE custom_offers
        SET ${updateFields.join(", ")}
        WHERE offer_id = $${paramIndex}
        RETURNING offer_id, status, rejection_reason;
      `;
      console.log("Executing update query:", updateQuery);
      console.log("Update query parameters:", updateParams);

      const updateResult = await client.query(updateQuery, updateParams);

      console.log("Update query result rows length:", updateResult.rows.length);
      if (updateResult.rows.length === 0) {
        console.error("Failed to update offer status. No rows returned from update query.");
        throw new Error("Failed to update offer status."); // Throw to trigger rollback
      }
      console.log("Offer updated successfully:", updateResult.rows[0]);


      // Optional: Send notification to admin (e.g., via email or in-app notification)
      console.log(
        `Offer ${offerId} ${targetStatusName} by user ${userId}. Reason: ${
          rejectionReason || "N/A"
        }`
      );

      // If accepted, redirect to payment page
      if (action === "accept") {
        const paymentUrl = new URL(`${process.env.NEXTAUTH_URL}/dashboard/payment`);
        // Pass offerId and offerAmount (in kobo) securely to the payment page
        paymentUrl.searchParams.set("offerId", offer.offer_id);
        // We are no longer passing amount via URL for security, it will be fetched on payment page
        // paymentUrl.searchParams.set("amount", offer.offerAmount.toString());
        paymentUrl.searchParams.set("service", offer.description || "Custom Offer"); // Pass offer description as service name

        // Return a redirect response
        return NextResponse.redirect(paymentUrl.toString());
      }


      return NextResponse.json({
        message: `Offer ${targetStatusName} successfully`,
        offerId: offerId,
        newStatus: targetStatusName, // Return the string name for frontend convenience
        rejectionReason: action === "reject" ? rejectionReason : undefined, // Include reason in response
      });
    });
  } catch (error: any) {
    console.error(`Error processing offer action:`, error);
    // Return appropriate status codes and messages based on the error type
    let statusCode = 500;
    let errorMessage = "Internal Server Error";

    if (error.message.includes("Token already used or not found")) {
        statusCode = 401; // Unauthorized
        errorMessage = "Invalid or expired token. Please try again.";
    } else if (error.message.includes("Custom offer not found")) {
        statusCode = 404; // Not Found
        errorMessage = "Custom offer not found.";
    } else if (error.message.includes("Forbidden")) {
        statusCode = 403; // Forbidden
        errorMessage = "You do not have permission to perform this action on this offer.";
    } else if (error.message.includes("Offer is already")) {
        statusCode = 409; // Conflict
        errorMessage = error.message;
    } else if (error.message.includes("Offer has expired")) {
        statusCode = 410; // Gone
        errorMessage = error.message;
    } else if (error.message.includes("Target status")) {
        statusCode = 500; // Server error
        errorMessage = "Server configuration error: Target offer status not found.";
    } else if (error.message.includes("Failed to update offer status")) {
        statusCode = 500;
        errorMessage = "Failed to update offer status in the database.";
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}

// The GET method was previously in this file, re-adding for completeness if still needed here.
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
        cos.name AS status,
        co.expires_at AS "expiresAt",
        co.rejection_reason AS "rejectionReason",
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
