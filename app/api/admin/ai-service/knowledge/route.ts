import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth/admin-auth-guard";
import { ensureDefaultKnowledgeBase } from "@/lib/ai/seed-knowledge";

export async function GET(req: Request) {
  const authError = await verifyAdmin(req);
  if (authError) return authError;

  try {
    await ensureDefaultKnowledgeBase();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const where: any = {};
    if (category && category !== "all") {
      where.category = category;
    }
    if (search) {
      where.OR = [
        { question: { contains: search, mode: "insensitive" } },
        { answer: { contains: search, mode: "insensitive" } },
        { keywords: { contains: search, mode: "insensitive" } },
      ];
    }

    const items = await prisma.ai_knowledge_base.findMany({
      where,
      orderBy: { updated_at: "desc" },
    });

    return NextResponse.json({ items });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const authError = await verifyAdmin(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { question, answer, category, keywords, is_active } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { error: "Question and answer are required." },
        { status: 400 }
      );
    }

    const newItem = await prisma.ai_knowledge_base.create({
      data: {
        question: question.trim(),
        answer: answer.trim(),
        category: (category || "general").trim(),
        keywords: keywords ? keywords.trim() : null,
        is_active: is_active ?? true,
        source: "admin",
      },
    });

    return NextResponse.json({ item: newItem }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
