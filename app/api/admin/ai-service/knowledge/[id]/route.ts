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
      return NextResponse.json({ error: "Invalid item id" }, { status: 400 });
    }

    const body = await req.json();
    const { question, answer, category, keywords, is_active } = body;

    const updated = await prisma.ai_knowledge_base.update({
      where: { id },
      data: {
        ...(question !== undefined && { question: question.trim() }),
        ...(answer !== undefined && { answer: answer.trim() }),
        ...(category !== undefined && { category: category.trim() }),
        ...(keywords !== undefined && { keywords: keywords ? keywords.trim() : null }),
        ...(is_active !== undefined && { is_active: Boolean(is_active) }),
      },
    });

    return NextResponse.json({ item: updated });
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
      return NextResponse.json({ error: "Invalid item id" }, { status: 400 });
    }

    await prisma.ai_knowledge_base.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
