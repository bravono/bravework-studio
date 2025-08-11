// app/api/admin/custom-offers/[offerId]/route.ts
import { NextResponse } from "next/server";
import { verifyAdminPages } from "../../../../../lib/admin-auth-guard-pages";
import { queryDatabase } from "../../../../../lib/db";

export const runtime = "nodejs";

// PUT /api/admin/custom-offers/[offerId]
// Update an existing custom offer
export async function PUT(request: Request, { params }: { params: { offerId: string } }) {
  const session = await verifyAdminPages();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { offerId } = params;
    const body = await request.json();
    const { offer_amount_in_kobo, description, expires_at } = body;

    if (!offer_amount_in_kobo || !description || !expires_at) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const updateQuery = `
      UPDATE custom_offers
      SET
        offer_amount_in_kobo = $1,
        description = $2,
        expires_at = $3,
        updated_at = NOW()
      WHERE offer_id = $4
      RETURNING *;
    `;
    const updatedOffer = await queryDatabase(updateQuery, [
      offer_amount_in_kobo,
      description,
      expires_at,
      offerId,
    ]);

    if (updatedOffer.length === 0) {
      return NextResponse.json({ error: "Custom offer not found" }, { status: 404 });
    }

    return NextResponse.json(updatedOffer[0]);
  } catch (error) {
    console.error(`Error updating custom offer ${params.offerId}:`, error);
    return NextResponse.json({ error: "Failed to update custom offer" }, { status: 500 });
  }
}

// DELETE /api/admin/custom-offers/[offerId]
// Delete a custom offer
export async function DELETE(request: Request, { params }: { params: { offerId: string } }) {
  const session = await verifyAdminPages();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { offerId } = params;

    const deleteQuery = "DELETE FROM custom_offers WHERE offer_id = $1 RETURNING offer_id;";
    const result = await queryDatabase(deleteQuery, [offerId]);

    if (result.length === 0) {
      return NextResponse.json({ error: "Custom offer not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Custom offer deleted successfully" });
  } catch (error) {
    console.error(`Error deleting custom offer ${params.offerId}:`, error);
    return NextResponse.json({ error: "Failed to delete custom offer" }, { status: 500 });
  }
}
