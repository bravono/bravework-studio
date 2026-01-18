import { NextResponse } from "next/server";
import { withTransaction } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";
import { createZohoLead } from "@/lib/zoho";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user ? (session.user as any).id : null;
    const userEmail = session?.user?.email;
    const userName = session?.user?.name || "Unknown User";

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

    // Create Zoho Lead if user is logged in
    if (userEmail) {
      try {
        const nameParts = userName.split(" ");
        const lastName =
          nameParts.length > 1 ? nameParts.slice(1).join(" ") : nameParts[0];
        const firstName = nameParts.length > 1 ? nameParts[0] : "";

        await createZohoLead({
          Last_Name: lastName,
          First_Name: firstName,
          Email: userEmail,
          Description: `User couldn't find device near Lat: ${lat}, Lng: ${lng}`,
          Lead_Source: "Web App - No Device Found",
        });
      } catch (zohoError) {
        console.error("Error creating Zoho Lead:", zohoError);
      }
    }

    return NextResponse.json({ message: "Demand recorded" }, { status: 201 });
  } catch (error) {
    console.error("Error recording demand:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
