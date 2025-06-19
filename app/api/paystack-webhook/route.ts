// app/api/paystack-webhook/route.ts
// This file handles incoming webhook events from Paystack.

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto'; // Node.js built-in module for cryptographic functions

// Ensure your Paystack Secret Key is available as an environment variable.
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// Define the POST handler for the webhook endpoint
export async function POST(req: NextRequest) {
  // 1. Basic Security Check: Ensure Secret Key is configured
  if (!PAYSTACK_SECRET_KEY) {
    console.error('Paystack Secret Key is not configured in environment variables.');
    // In a production scenario, you might want a more robust error handling/logging
   
    return NextResponse.json(
      { message: 'Server configuration error: Paystack Secret Key missing.' },
      { status: 500 }
    );
  }

  // 2. Read the Raw Body for Signature Verification
  // IMPORTANT: You need the raw body, not the JSON parsed body, for signature verification.
  // Next.js `req.text()` reads the raw request body.
  const signature = req.headers.get('x-paystack-signature');
  const rawBody = await req.text(); // Get the raw string body

  // 3. Verify the Webhook Signature
  // This step ensures the request genuinely came from Paystack.
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest('hex');

  if (hash !== signature) {
    console.warn('Webhook signature mismatch. Potential unauthorized access attempt.');
    return NextResponse.json({ message: 'Signature verification failed.' }, { status: 400 });
  }

  // 4. Parse the JSON payload after successful verification
  let event;
  try {
    event = JSON.parse(rawBody);
  } catch (error) {
    console.error('Error parsing webhook JSON body:', error);
    return NextResponse.json({ message: 'Invalid JSON payload.' }, { status: 400 });
  }

  console.log('Received Paystack Webhook Event:', event.event);
  console.log('Event Data:', event.data);

  // 5. Handle Different Event Types
  // The 'event' field in the payload tells you what type of event occurred.
  // The 'data' field contains the details of the event.
  switch (event.event) {
    case 'charge.success':
      // This is the most common and important event for payment confirmation.
      const transactionReference = event.data.reference;
      const amountPaid = event.data.amount / 100; // Amount in your currency's main unit (e.g., NGN, USD)
      const customerEmail = event.data.customer.email;
      const transactionStatus = event.data.status; // Should be 'success'

      console.log(`Charge Successful! Ref: ${transactionReference}, Amount: ${amountPaid}, Email: ${customerEmail}`);

      // TODO: Implement your backend logic here:
      // a. Retrieve the order from your database using `transactionReference`.
      // b. IMPORTANT: Verify that the `amountPaid` matches the expected amount for that order.
      //    This prevents fraud where a user might try to pay less than expected.
      // c. Update the order status in your database to 'paid' or 'completed'.
      // d. Grant access to the purchased service/product.
      // e. Send a confirmation email to the customer.
      // f. Mark the `transactionReference` as processed to ensure idempotency
      //    (e.g., store it in a table of processed webhooks).

      // Example of database update (pseudo-code)
      // await db.orders.update({ reference: transactionReference, status: 'completed', paidAmount: amountPaid });
      // await sendConfirmationEmail(customerEmail, transactionReference, amountPaid);

      break;

    case 'charge.failed':
      // Handle failed charges, e.g., update order status, log error.
      console.log('Charge Failed:', event.data.reference, event.data.gateway_response);
      // TODO: Update order status to 'failed', potentially notify customer.
      break;

    case 'transfer.success':
      // If you are using Paystack for payouts/transfers
      console.log('Transfer Successful:', event.data.reference, event.data.status);
      // TODO: Update transfer status in your system.
      break;

    // Add more cases for other events you want to handle (e.g., 'invoice.create', 'customer.create')
    default:
      console.log(`Unhandled Paystack Event: ${event.event}`);
      break;
  }

  // 6. Respond with 200 OK
  // This tells Paystack you successfully received the webhook.
  return NextResponse.json({ message: 'Webhook received successfully.' }, { status: 200 });
}
