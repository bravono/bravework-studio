import { NextResponse } from "next/server";
import { queryDatabase } from "@/lib/db";
import { getOrCreateZohoInvoiceContact, createZohoInvoice, recordZohoInvoicePayment } from "@/lib/zoho";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = parseInt(params.id);
    if (isNaN(invoiceId)) {
      return NextResponse.json({ error: "Invalid invoice ID" }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    if (status !== "Paid") {
      return NextResponse.json({ error: "Unsupported status change" }, { status: 400 });
    }

    // 1. Fetch the invoice and user/order details
    const invoiceRes = await queryDatabase(
      `SELECT i.*, u.first_name, u.last_name, u.email, o.title as order_title, o.tracking_id
       FROM invoices i
       LEFT JOIN users u ON i.user_id = u.user_id
       LEFT JOIN orders o ON i.order_id = o.order_id
       WHERE i.invoice_id = $1`,
      [invoiceId]
    );

    if (invoiceRes.length === 0) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const invoice = invoiceRes[0];

    // 2. Fetch the 'paid' status ID
    const statusRes = await queryDatabase(
      "SELECT payment_status_id FROM payment_statuses WHERE name = 'paid'"
    );
    const paidStatusId = statusRes[0]?.payment_status_id || 3;

    // 3. Update the local invoice record status
    await queryDatabase(
      "UPDATE invoices SET payment_status_id = $1 WHERE invoice_id = $2",
      [paidStatusId, invoiceId]
    );

    // 4. Update the corresponding order status to 'paid' if it's not already paid
    await queryDatabase(
      "UPDATE orders SET payment_status_id = $1 WHERE order_id = $2",
      [paidStatusId, invoice.order_id]
    );

    // 5. Synchronize with Zoho Invoice in the background
    (async () => {
      try {
        const customerName = `${invoice.first_name || ""} ${invoice.last_name || ""}`.trim() || "Unknown Customer";
        const customerEmail = invoice.email || "no-email@braveworkstudio.com";
        const orderTitle = invoice.order_title || `Order #${invoice.order_id}`;
        const totalAmountDecimal = parseFloat(invoice.total_amount);

        // Get/Create Zoho contact
        const zohoContactId = await getOrCreateZohoInvoiceContact(customerEmail, customerName);

        let zohoInvoiceId = invoice.zoho_invoice_id;
        let zohoInvoiceNumber = invoice.invoice_number;
        let clientViewUrl = invoice.invoice_pdf_url;

        // If the invoice wasn't created in Zoho yet, create it
        if (!zohoInvoiceId) {
          const zohoInvoice = await createZohoInvoice(
            zohoContactId,
            orderTitle,
            totalAmountDecimal,
            invoice.order_id
          );
          zohoInvoiceId = zohoInvoice.invoice_id;
          zohoInvoiceNumber = zohoInvoice.invoice_number;
          clientViewUrl = zohoInvoice.client_view_url;

          // Save Zoho details locally
          await queryDatabase(
            `UPDATE invoices 
             SET zoho_invoice_id = $1, 
                 invoice_number = $2, 
                 invoice_pdf_url = $3 
             WHERE invoice_id = $4`,
            [zohoInvoiceId, zohoInvoiceNumber, clientViewUrl, invoiceId]
          );
        }

        // Record the payment in Zoho
        const reference = `MANUAL-PAY-${invoiceId}-${Date.now()}`;
        await recordZohoInvoicePayment(
          zohoContactId,
          zohoInvoiceId,
          totalAmountDecimal,
          reference
        );
        console.log(`✅ Zoho Invoicing manual payment recorded for invoice #${invoiceId}`);
      } catch (zohoError) {
        console.error("❌ Failed to sync manual invoice payment with Zoho:", zohoError);
      }
    })();

    return NextResponse.json({
      success: true,
      message: "Invoice marked as paid successfully.",
    });
  } catch (error) {
    console.error("Error in admin status update API:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
