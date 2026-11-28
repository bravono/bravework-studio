import { NextResponse } from "next/server";
import { queryDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const queryText = `
      SELECT
        i.invoice_id::text as id,
        i.invoice_number,
        i.order_id::text as "orderId",
        i.user_id::text as "userId",
        CONCAT(u.first_name, ' ', u.last_name) as "clientName",
        i.date as "issueDate",
        i.due_date as "dueDate",
        i.total_amount as amount,
        CASE WHEN ps.name = 'paid' THEN i.total_amount ELSE 0 END as "amountPaid",
        INITCAP(ps.name) as status,
        i.invoice_pdf_url as "paymentLink"
      FROM invoices i
      LEFT JOIN users u ON i.user_id = u.user_id
      LEFT JOIN payment_statuses ps ON i.payment_status_id = ps.payment_status_id
      ORDER BY i.date DESC;
    `;
    const invoices = await queryDatabase(queryText);
    return NextResponse.json(invoices, { status: 200 });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { message: "Error fetching invoices" },
      { status: 500 }
    );
  }
}
