import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth/admin-auth-guard";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const authError = await verifyAdmin(req);
  if (authError) return authError;

  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid escalation id" }, { status: 400 });
    }

    const body = await req.json();
    const { answer, category, keywords } = body;

    if (!answer || typeof answer !== "string" || !answer.trim()) {
      return NextResponse.json(
        { error: "An answer is required to resolve this escalation and train the AI." },
        { status: 400 }
      );
    }

    const escalation = await prisma.ai_escalations.findUnique({
      where: { id },
    });

    if (!escalation) {
      return NextResponse.json({ error: "Escalation not found." }, { status: 404 });
    }

    // 1. Mark escalation as resolved
    const updatedEscalation = await prisma.ai_escalations.update({
      where: { id },
      data: {
        admin_response: answer.trim(),
        status: "answered",
        resolved_at: new Date(),
      },
    });

    // 2. Train AI memory: create or update knowledge base entry
    const learnedKnowledge = await prisma.ai_knowledge_base.create({
      data: {
        question: escalation.question.trim(),
        answer: answer.trim(),
        category: (category || "general").trim(),
        keywords: keywords ? keywords.trim() : null,
        is_active: true,
        source: "escalation_resolution",
      },
    });

    return NextResponse.json({
      success: true,
      escalation: updatedEscalation,
      learnedKnowledge,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
