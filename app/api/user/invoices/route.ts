import { NextResponse } from "next/server";
import { queryDatabase, withTransaction } from "../../../../lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";
import { createZohoLead } from "@/lib/zoho";
export const dynamic = "force-dynamic";

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
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 400 }
      );
    }

    const queryText = `
      SELECT
       *
      FROM invoices    
      WHERE user_id = $1
      ORDER BY date DESC;
    `;

    const params = [userId];
    const result = await queryDatabase(queryText, params);

    console.log("Invoices fetched for user:", result);

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=59", // Cache for 60 seconds, allow stale for another 59s
      },
    });
  } catch (error) {
    console.error("Error fetching user invoices:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
