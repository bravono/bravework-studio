import { NextResponse } from "next/server";
import { queryDatabase, withTransaction } from "../../../../lib/db";
import { verifyAdmin } from "../../../../lib/admin-auth-guard";
import { sendCustomOfferNotificationEmail } from "../../../../lib/mailer";

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
    const { orderId, userId, offerAmount, description, expiresAt } = body;

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
    const status = 1; // Default status for a new custom offer is pending

    await withTransaction(async (client) => {
      const queryText = `
        INSERT INTO custom_offers (
           order_id, user_id, offer_amount_in_kobo, description, created_at, status
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING
          offer_id AS id, order_id AS "orderId", user_id AS "userId",
          offer_amount_in_kobo AS "offerAmount", description, created_at AS "createdAt", status, expires_at AS "expiresAt";
      `;
      const params = [
        orderId,
        userId,
        offerAmount,
        description,
        createdAt,
        status,
        parsedExpiresAt,
      ];

      const offerResult = await client.query(queryText, params);

      if (offerResult.rows.length === 0) {
        throw new Error("Failed to create custom offer.");
      }

      await client.query("INSERT INTO orders (offer_id) VALUES ($1)", [
        offerResult[0].offer_id,
      ]);

      const newOffer = offerResult.rows[0];

      // --- Send Notifications ---
      const userResult = await client.query(
        "SELECT email, first_name, last_name FROM users WHERE user_id = $1",
        [userId]
      );

      if (userResult.rows.length > 0) {
        const customerEmail = userResult.rows[0].email;
        const customerName = `${userResult.rows[0].full_name} ${userResult.rows[0].full_name} `;

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
          // Don't re-throw, as offer creation is more critical than email sending
        }

        // Create In-App Notification
        const notificationTitle = "New Custom Offer Available!";
        const notificationMessage = `You have received a new custom offer for Order ID ${
          newOffer.orderId
        }. Amount: $${newOffer.offerAmount.toLocaleString()}. ${
          newOffer.expiresAt
            ? `Expires: ${new Date(newOffer.expiresAt).toLocaleString()}`
            : ""
        }`;
        const notificationLink = `/dashboard/offers/${newOffer.id}`; // Link to a page where they can view/manage offers

        try {
          await client.query(
            "INSERT INTO notifications (user_id, title, message, link) VALUES ($1, $2, $3, $4)",
            [userId, notificationTitle, notificationMessage, notificationLink]
          );
        } catch (dbNotificationError) {
          console.error(
            "Failed to create in-app notification for custom offer:",
            dbNotificationError
          );
          // Don't re-throw, as offer creation is more critical than notification insertion
        }
      } else {
        console.warn(
          `User with ID ${userId} not found for notification after custom offer creation.`
        );
      }
      // --- END Send Notifications ---
      return NextResponse.json(offerResult[0], { status: 201 });
    });
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
    if (expiresAt !== undefined) {
      // NEW: Handle expiresAt update
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
        offer_amount AS "offerAmount", description, created_at AS "createdAt", status, expires_at AS "expiresAt";
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
  } catch (error) {
    console.error("Error deleting custom offer:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Continue From Modals
