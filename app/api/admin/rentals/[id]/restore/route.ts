import { NextResponse } from "next/server";
import { queryDatabase, withTransaction } from "@/lib/db";
import { verifyAdmin } from "@/lib/auth/admin-auth-guard";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const guardResponse = await verifyAdmin(request);
    if (guardResponse) return guardResponse;

    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Missing rental id" }, { status: 400 });
    }

    const rentalCheck = await queryDatabase(
      "SELECT deleted_at FROM rentals WHERE rental_id = $1",
      [id]
    );

    if (rentalCheck.length === 0) {
      return NextResponse.json({ error: "Rental not found" }, { status: 404 });
    }

    if (!rentalCheck[0].deleted_at) {
      return NextResponse.json(
        { error: "Rental is not deleted" },
        { status: 400 }
      );
    }

    await withTransaction(async (client) => {
      await client.query(
        "UPDATE rentals SET deleted_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE rental_id = $1",
        [id]
      );
    });

    return NextResponse.json({
      message: "Rental restored successfully by admin",
    });
  } catch (error) {
    console.error("Error restoring rental by admin:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
