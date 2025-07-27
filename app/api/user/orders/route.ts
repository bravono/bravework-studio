// app/api/user/orders/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import {authOptions} from "../../../../lib/auth-options"; 
import { queryDatabase } from "../../../../lib/db";

export async function GET(request: Request) {
  try {
    // 1. Get the session to authenticate the user
    const session = await getServerSession(authOptions);

    // 2. Check if the user is authenticated
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3. Get the user ID from the session
    // Ensure 'id' is added to your session object via NextAuth.js callbacks
    const userId = (session.user as any).id;

    if (!userId) {
      console.error("Session user ID is missing when fetching orders.");
      return NextResponse.json({ error: "User ID not found in session" }, { status: 400 });
    }

    // 4. Fetch orders from the database where order's user_id matches the current user's ID
    // Adjust column names (e.g., 'user_id', 'order_id', 'category_id', 'created_at', 'order_status_id', 'total_expected_amount_kobo', 'amount_paid_to_date_kobo')
    // to match your actual 'orders' table schema.
    // Use aliases (AS "camelCase") to match your frontend Order interface.
    const queryText = `
      SELECT
        order_id AS id,
        category_id AS service,
        created_at AS date,
        order_status_id AS status,
        total_expected_amount_kobo AS amount,
        amount_paid_to_date_kobo AS amountPaid
      FROM orders
      WHERE user_id = $1
      ORDER BY created_at DESC; -- Order by most recent orders first
    `;

    const params = [userId];
    const result = await queryDatabase(queryText, params);

    // 5. Return the fetched orders
    // Add a revalidate option to the response to control caching behavior.
    // This tells Next.js how long to cache the response of this API route.
    // For example, revalidate every 60 seconds.
    // Note: This 'revalidate' option is typically used with `fetch` in Server Components
    // or when calling `fetch` directly in a Route Handler.
    // When a client component calls this API route, Next.js will cache its response
    // based on default caching rules, or you can explicitly control it on the client-side fetch.
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=59', // Cache for 60 seconds, allow stale for another 59s
      },
    });

  } catch (error) {
    console.error("Error fetching user orders:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
