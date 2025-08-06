import { NextResponse } from "next/server";
import { queryDatabase, withTransaction } from "../../../../lib/db"; // Ensure withTransaction is imported
import { verifyAdmin } from "../../../../lib/admin-auth-guard"; // Import the admin guard

// Explicitly set the runtime for this Route Handler to Node.js
// This ensures that Node.js-specific modules like 'pg' can be used.
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const guardResponse = await verifyAdmin(request);
    if (guardResponse) return guardResponse; // Guard returns a  unauthorized/forbidden

    // 4. Fetch all orders from the database
    // Using your provided column names and joining with 'users' for clientName.
    // Corrected SQL: Removed trailing comma after 'description'
    const queryText = `
      SELECT
        o.order_id AS id,
        o.category_id AS service,
        o.created_at AS date,
        o.start_date AS "dateStarted",
        o.end_date AS "dateCompleted",
        o.order_status_id AS status,
        o.total_expected_amount_kobo AS amount,
        o.amount_paid_to_date_kobo AS "amountPaid",
        o.user_id AS "clientId",
        CONCAT(u.first_name, ' ', u.last_name) AS "clientName",
        o.is_portfolio AS "isPortfolio",
        o.project_description AS description,
        o.timeline, 
        o.tracking_id AS "trackingId",
        pc.category_name AS "serviceName",
        os.name AS "statusName"
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      JOIN product_categories pc ON o.category_id = pc.category_id
      JOIN order_statuses os ON o.order_status_id = os.order_status_id
      ORDER BY o.created_at DESC;
    `;

    const result = await queryDatabase(queryText);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    return NextResponse.json(
      { error: "Internal Server Error" }, // Changed message to 'error' for consistency
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const guardResponse = await verifyAdmin(request);
    if (guardResponse) return guardResponse;

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("id"); // Get ID from query params for PATCH
    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // For PATCH, we expect a JSON body from the admin panel
    const body = await request.json();
    const {
      clientId, // user_id
      service, // category_id
      status, // order_status_id
      budget, // budget_range
      amountPaid, // amount_paid_to_date_kobo
      projectDescription, // project_description
      dateStarted, // start_date
      dateCompleted, // end_date
      isPortfolio, // is_portfolio
      trackingId, // tracking_id
      timeline, // timeline
    } = body;

    let updateFields: string[] = [];
    let updateParams: any[] = [];
    let paramIndex = 1;

    // Dynamically build update query based on provided fields and your column names
    if (clientId !== undefined) {
      updateFields.push(`user_id = $${paramIndex++}`);
      updateParams.push(clientId);
    }
    if (service !== undefined) {
      updateFields.push(`category_id = $${paramIndex++}`);
      updateParams.push(service);
    }
    if (status !== undefined) {
      updateFields.push(`order_status_id = $${paramIndex++}`);
      updateParams.push(status);
    }
    if (budget !== undefined) {
      updateFields.push(`budget_range = $${paramIndex++}`);
      updateParams.push(budget);
    }
    if (amountPaid !== undefined) {
      updateFields.push(`amount_paid_to_date_kobo = $${paramIndex++}`);
      updateParams.push(amountPaid);
    }
    if (projectDescription !== undefined) {
      updateFields.push(`project_description = $${paramIndex++}`);
      updateParams.push(projectDescription);
    }
    if (dateStarted !== undefined) {
      updateFields.push(`start_date = $${paramIndex++}`);
      updateParams.push(dateStarted);
    } // Using start_date
    if (dateCompleted !== undefined) {
      updateFields.push(`end_date = $${paramIndex++}`);
      updateParams.push(dateCompleted);
    } // Using end_date
    if (isPortfolio !== undefined) {
      updateFields.push(`is_portfolio = $${paramIndex++}`);
      updateParams.push(isPortfolio);
    }
    if (trackingId !== undefined) {
      updateFields.push(`tracking_id = $${paramIndex++}`);
      updateParams.push(trackingId);
    }
    if (timeline !== undefined) {
      updateFields.push(`timeline = $${paramIndex++}`);
      updateParams.push(timeline);
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { message: "No fields to update" },
        { status: 200 }
      );
    }

    updateParams.push(orderId); // Add orderId as the last parameter for WHERE clause

    const queryText = `
      UPDATE orders
      SET ${updateFields.join(", ")}
      WHERE order_id = $${paramIndex}
      RETURNING
        order_id AS id, category_id AS service, created_at AS date,
        project_description AS description, budget_range AS amount, timeline,
        order_status_id AS status, amount_paid_to_date_kobo AS "amountPaid",
        user_id AS "clientId", is_portfolio AS "isPortfolio",
        start_date AS "dateStarted", end_date AS "dateCompleted", -- Returning new date columns
        tracking_id AS "trackingId";
    `;

    const result = await queryDatabase(queryText, updateParams);

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Order not found or no update performed" },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    // 1. Authorization: Verify admin using the guard
    const guardResponse = await verifyAdmin(request);
    if (guardResponse) return guardResponse;

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("id"); // Get ID from query params for DELETE
    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const queryText = `
      DELETE FROM orders
      WHERE order_id = $1
      RETURNING order_id;
    `;

    const result = await queryDatabase(queryText, [orderId]);

    if (result.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: `Order ${orderId} deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
