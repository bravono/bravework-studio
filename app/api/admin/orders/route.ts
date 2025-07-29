import { NextResponse } from "next/server";
import { queryDatabase } from "../../../../lib/db";
import { verifyAdmin } from "../../../../lib/admin-auth-guard";


// Explicitly set the runtime for this Route Handler to Node.js
// This ensures that Node.js-specific modules like 'pg' can be used.
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const guardResponse = await verifyAdmin(request);
    if (guardResponse) return guardResponse;

    // 4. Fetch all orders from the database
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
        u.full_name AS "clientName", 
        o.is_portfolio AS "isPortfolio", 
        o.project_description AS description,
      FROM orders o
      JOIN users u ON o.user_id = u.user_id 
      ORDER BY o.created_at DESC;
    `;

    const result = await queryDatabase(queryText);

    // 5. Return the fetched orders
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
