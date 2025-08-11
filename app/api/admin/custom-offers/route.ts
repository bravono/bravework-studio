import { NextResponse } from "next/server";
import { queryDatabase, withTransaction } from "../../../../lib/db";
import { verifyAdmin } from "../../../../lib/admin-auth-guard";
import { sendCustomOfferNotificationEmail } from "../../../../lib/mailer";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const guardResponse = await verifyAdmin(request);
    if (guardResponse) return guardResponse;

    // Fetch all custom offers, joining to get status name and client name
    const queryText = `
      SELECT
        co.offer_id AS id,
        co.order_id AS "orderId",
        co.user_id AS "userId",
        co.offer_amount_in_kobo AS "offerAmount",
        co.description,
        co.created_at AS "createdAt",
        cos.name AS status, -- Get the status name from the custom_offer_statuses table
        co.expires_at AS "expiresAt",
        u.full_name AS "clientName", -- Join to get client's full name
        o.category_id AS "orderService",
        o.project_description AS "orderDescription",
        o.budget_range AS "orderBudget"
      FROM custom_offers co
      JOIN custom_offer_statuses cos ON co.status_id = cos.offer_status_id
      JOIN users u ON co.user_id = u.user_id -- Join with users table
      JOIN orders o ON co.order_id = o.order_id -- Join with orders table
      ORDER BY co.created_at DESC;
    `;

    const offers = await queryDatabase(queryText);

    // Manually convert Date objects to ISO strings for JSON serialization
    const serializableOffers = offers.map((offer: any) => {
      if (offer.createdAt instanceof Date) {
        offer.createdAt = offer.createdAt.toISOString();
      }
      if (offer.expiresAt instanceof Date) {
        offer.expiresAt = offer.expiresAt.toISOString();
      }
      return offer;
    });

    console.log("Fetched custom offers:", serializableOffers[0]); // Log first for brevity
    return NextResponse.json(serializableOffers); // Return the full array
  } catch (error: any) {
    console.error("Error fetching custom offers:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" }, // Ensure error is serializable
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const guardResponse = await verifyAdmin(request);
    if (guardResponse) return guardResponse;

    const body = await request.json(); // Admin Panel will send JSON, not formData for offer creation
    const {
      orderId,
      userId,
      offerAmount,
      description,
      expiresAt,
      projectDuration,
    } = body;

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

    let parsedExpiresAt: string | null = null;
    if (expiresAt) {
      const date = new Date(expiresAt);
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          { error: "Invalid expiresAt date format" },
          { status: 400 }
        );
      }
      parsedExpiresAt = date.toISOString(); // Ensure ISO string for DB
    }

    const createdAt = new Date().toISOString();
    const statusIdResult = await queryDatabase(
      "SELECT offer_status_id FROM custom_offer_statuses WHERE name = $1",
      ["pending"]
    );
    const statusId = statusIdResult[0].offer_status_id;

    return await withTransaction(async (client) => {
      const insertOfferQuery = `
        INSERT INTO custom_offers (
            order_id, user_id, offer_amount_in_kobo, description, created_at, status_id, expires_at, project_duration_days
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING
          offer_id AS id, order_id AS "orderId", user_id AS "userId",
          offer_amount_in_kobo AS "offerAmount", description, created_at AS "createdAt", status_id, expires_at AS "expiresAt", project_duration_days AS "projectDuration";
      `;
      const offerParams = [
        orderId, // Parameter 2
        userId, // Parameter 3
        offerAmount, // Parameter 4
        description, // Parameter 5
        createdAt, // Parameter 6
        statusId, // Parameter 7
        parsedExpiresAt, // Parameter 8
        projectDuration || 0, // Parameter 9, default to 0 if not provided
      ];

      const offerResult = await client.query(insertOfferQuery, offerParams);

      if (offerResult.rows.length === 0) {
        throw new Error("Failed to create custom offer.");
      }

      // Update the associated order with the new offer_id
      // Assuming 'orders' table has an 'offer_id' column of type UUID
      await client.query(
        "UPDATE orders SET offer_id = $1 WHERE order_id = $2",
        [offerResult.rows[0].id, orderId] // Use the returned offer ID
      );

      const newOffer = offerResult.rows[0];

      // Convert Date objects to ISO strings for JSON serialization
      if (newOffer.createdAt instanceof Date) {
        newOffer.createdAt = newOffer.createdAt.toISOString();
      }
      if (newOffer.expiresAt instanceof Date) {
        newOffer.expiresAt = newOffer.expiresAt.toISOString();
      }

      // --- Send Notifications ---
      const userResult = await client.query(
        "SELECT email, first_name, last_name FROM users WHERE user_id = $1",
        [userId]
      );

      if (userResult.rows.length > 0) {
        const customerEmail = userResult.rows[0].email;
        // Corrected: Concatenate first_name and last_name for full name
        const customerName = `${userResult.rows[0].first_name || ""} ${
          userResult.rows[0].last_name || ""
        }`.trim();

        // Send Email Notification (non-blocking, but log errors)
        try {
          await sendCustomOfferNotificationEmail(
            customerEmail,
            customerName,
            newOffer.offerAmount,
            newOffer.description,
            newOffer.orderId,
            newOffer.id, // Pass offerId for accept/reject links
            newOffer.expiresAt // Pass expiresAt for email content
          );
        } catch (emailError) {
          console.error(
            "Failed to send custom offer email notification:",
            emailError
          );
        }

        // Create In-App Notification
        const kobo = 100; // 1 NGN = 100 kobo
        const notificationTitle = "New Custom Offer Available!";
        const notificationMessage = `You have received a new custom offer for Order ID ${
          newOffer.orderId
        }. Amount: NGN${(newOffer.offerAmount / kobo).toLocaleString()}. ${
          newOffer.expiresAt
            ? `Expires: ${new Date(newOffer.expiresAt).toLocaleString()}`
            : ""
        }`;

        const notificationLink = `/user/dashboard/notifications/${newOffer.id}`; // Link for in-app notification
        try {
          await client.query(
            "INSERT INTO notifications (user_id, title, message, link) VALUES ($1, $2, $3, $4)",
            [userId, notificationTitle, notificationMessage, notificationLink]
          );
        } catch (err) {
          console.error(
            "Failed to create in-app notification for custom offer:",
            err
          );
        }
      } else {
        console.warn(
          `User with ID ${userId} not found for notification after custom offer creation.`
        );
      }
      // --- END Send Notifications ---
      return NextResponse.json(newOffer, { status: 201 }); // Return the full new offer object
    });
  } catch (error: any) {
    console.error("Error creating custom offer:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
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
    const { offerAmount, description, status, expiresAt } = body; // Fields that can be updated

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
      updateFields.push(`offer_amount_in_kobo = $${paramIndex++}`); // Corrected column name
      updateParams.push(offerAmount);
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      updateParams.push(description);
    }
    if (status !== undefined) {
      // If status is provided as a name (e.g., "Accepted"), convert to ID
      let statusId = status;
      if (typeof status === "string") {
        const statusResult = await queryDatabase(
          "SELECT offer_status_id FROM custom_offer_statuses WHERE name = $1",
          [status]
        );
        if (statusResult.rows.length > 0) {
          statusId = statusResult.rows[0].offer_status_id;
        } else {
          return NextResponse.json(
            { error: `Invalid status name: ${status}` },
            { status: 400 }
          );
        }
      }
      updateFields.push(`status = $${paramIndex++}`);
      updateParams.push(statusId);
    }
    if (expiresAt !== undefined) {
      let parsedExpiresAt: string | null = null;
      if (expiresAt) {
        const date = new Date(expiresAt);
        if (isNaN(date.getTime())) {
          return NextResponse.json(
            { error: "Invalid expiresAt date format" },
            { status: 400 }
          );
        }
        parsedExpiresAt = date.toISOString();
      }
      updateFields.push(`expires_at = $${paramIndex++}`);
      updateParams.push(parsedExpiresAt);
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
        offer_amount_in_kobo AS "offerAmount", description, created_at AS "createdAt",
        status_id, expires_at AS "expiresAt";
    `;

    const result = await queryDatabase(queryText, updateParams);

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Custom offer not found or no update performed" },
        { status: 404 }
      );
    }

    const updatedOffer = result[0];
    // Convert Date objects to ISO strings for JSON serialization
    if (updatedOffer.createdAt instanceof Date) {
      updatedOffer.createdAt = updatedOffer.createdAt.toISOString();
    }
    if (updatedOffer.expiresAt instanceof Date) {
      updatedOffer.expiresAt = updatedOffer.expiresAt.toISOString();
    }

    // Fetch status name for the returned object
    const statusNameResult = await queryDatabase(
      "SELECT name FROM custom_offer_statuses WHERE offer_status_id = $1",
      [updatedOffer.status]
    );
    if (statusNameResult.rows.length > 0) {
      updatedOffer.status = statusNameResult.rows[0].name; // Replace ID with name
    } else {
      console.warn(`Status name not found for ID: ${updatedOffer.status}`);
    }

    console.log("Updated custom offer:", updatedOffer);
    return NextResponse.json(updatedOffer);
  } catch (error: any) {
    console.error("Error updating custom offer:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
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
      RETURNING offer_id;
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
  } catch (error: any) {
    console.error("Error deleting custom offer:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
