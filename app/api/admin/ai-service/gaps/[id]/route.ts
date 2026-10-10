import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth/admin-auth-guard";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const authError = await verifyAdmin(req);
  if (authError) return authError;

  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid gap id" }, { status: 400 });
    }

    const body = await req.json();
    const { title, category, description, customer_context, suggested_offering, potential_impact, status, admin_notes } = body;

    const updated = await prisma.ai_offering_gaps.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(category !== undefined && { category: category.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(customer_context !== undefined && { customer_context: customer_context ? customer_context.trim() : null }),
        ...(suggested_offering !== undefined && { suggested_offering: suggested_offering.trim() }),
        ...(potential_impact !== undefined && { potential_impact }),
        ...(status !== undefined && { status }),
        ...(admin_notes !== undefined && { admin_notes: admin_notes ? admin_notes.trim() : null }),
      },
    });

    return NextResponse.json({ gap: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const authError = await verifyAdmin(req);
  if (authError) return authError;

  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid gap id" }, { status: 400 });
    }

    await prisma.ai_offering_gaps.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
