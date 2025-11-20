
import { NextResponse } from "next/server";
import { withTransaction } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user ? (session.user as any).id : null;

    const body = await request.json();
    const { lat, lng } = body;

    if (!lat || !lng) {
      return NextResponse.json(
        { error: "Missing location data" },
        { status: 400 }
      );
    }

    await withTransaction(async (client) => {
      await client.query(
        `INSERT INTO rental_demands (user_id, location_lat, location_lng)
         VALUES ($1, $2, $3)`,
        [userId, lat, lng]
      );
    });

    return NextResponse.json({ message: "Demand recorded" }, { status: 201 });
  } catch (error) {
    console.error("Error recording demand:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
