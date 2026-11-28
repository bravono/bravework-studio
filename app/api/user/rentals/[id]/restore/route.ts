import { NextResponse } from "next/server";
import { queryDatabase, withTransaction } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Missing rental id" }, { status: 400 });
    }

    // Verify ownership and that it is actually deleted
    const rentalCheck = await queryDatabase(
      "SELECT user_id, deleted_at FROM rentals WHERE rental_id = $1",
      [id]
    );

    if (rentalCheck.length === 0) {
      return NextResponse.json({ error: "Rental not found" }, { status: 404 });
    }

    if (rentalCheck[0].user_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

    return NextResponse.json({ message: "Rental restored successfully" });
  } catch (error) {
    console.error("Error restoring rental:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
