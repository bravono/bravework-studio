// app/api/paystack-verify/route.ts (example for App Router)
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { reference } = await req.json(); // Get reference from client-side callback

  if (!reference) {
    return NextResponse.json({ success: false, message: 'No reference provided' }, { status: 400 });
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY; // Your LIVE Secret Key

  if (!secretKey) {
    console.error("Paystack Secret Key not found in environment variables.");
    return NextResponse.json({ success: false, message: 'Server configuration error' }, { status: 500 });
  }

  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (data.status && data.data && data.data.status === 'success') {
      // Payment is genuinely successful
      const paystackAmount = data.data.amount / 100; // Convert kobo back to main currency
      const paystackCurrency = data.data.currency;
      const customerEmail = data.data.customer.email;

      // TODO: IMPORTANT:
      // 1. Compare `paystackAmount` with the actual expected amount for the service.
      //    e.g., if (paystackAmount !== expectedAmountForService) { handle fraud }
      // 2. Check `paystackCurrency` matches your expected currency.
      // 3. Update your database: Mark the order as paid, grant access to service, send confirmation email.
      // 4. Handle edge cases: What if the reference already exists (duplicate webhook/verification call)?

      console.log("Paystack verification successful:", data.data);
      return NextResponse.json({ success: true, message: 'Payment verified', data: data.data });
    } else {
      console.error("Paystack verification failed:", data);
      return NextResponse.json({ success: false, message: 'Payment verification failed', details: data }, { status: 400 });
    }
  } catch (error) {
    console.error("Error verifying Paystack transaction:", error);
    return NextResponse.json({ success: false, message: 'Internal server error during verification' }, { status: 500 });
  }
}