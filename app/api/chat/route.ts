import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { processCustomerMessage, ChatHistoryMessage } from "@/lib/ai/customer-service-agent";
import { ensureDefaultKnowledgeBase } from "@/lib/ai/seed-knowledge";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, message, userEmail, userName } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Message content is required." },
        { status: 400 }
      );
    }

    // Ensure foundational verified knowledge is in place
    await ensureDefaultKnowledgeBase();

    // Manage or initialize session
    let session = null;
    if (sessionId) {
      session = await prisma.ai_chat_sessions.findUnique({
        where: { session_id: sessionId },
      });
    }

    if (!session) {
      session = await prisma.ai_chat_sessions.create({
        data: {
          user_email: userEmail || null,
          user_name: userName || null,
        },
      });
    } else if (userEmail && !session.user_email) {
      session = await prisma.ai_chat_sessions.update({
        where: { session_id: session.session_id },
        data: {
          user_email: userEmail,
          user_name: userName || session.user_name,
        },
      });
    }

    // Retrieve previous recent messages for conversation history
    const pastMessages = await prisma.ai_chat_messages.findMany({
      where: { session_id: session.session_id },
      orderBy: { created_at: "desc" },
      take: 8,
    });

    const formattedHistory: ChatHistoryMessage[] = pastMessages
      .reverse()
      .map((m) => ({
        sender: m.sender as "user" | "assistant" | "system",
        content: m.content,
      }));

    // Record user message
    await prisma.ai_chat_messages.create({
      data: {
        session_id: session.session_id,
        sender: "user",
        content: message.trim(),
      },
    });

    // Process through Customer Service Agent
    const agentResult = await processCustomerMessage(
      session.session_id,
      message.trim(),
      formattedHistory
    );

    // If unanswerable topic was detected, record escalation for administrators
    if (agentResult.isEscalated) {
      await prisma.ai_escalations.create({
        data: {
          session_id: session.session_id,
          user_email: userEmail || session.user_email || null,
          user_name: userName || session.user_name || null,
          question: message.trim(),
          context: agentResult.escalatedTopic
            ? `Identified unknown topic: ${agentResult.escalatedTopic}`
            : `Uncertain query: ${message.trim()}`,
          status: "pending",
        },
      });
    }

    // If an unmet customer request or business gap was detected, record it
    if (agentResult.businessGap) {
      const existingGap = await prisma.ai_offering_gaps.findFirst({
        where: {
          title: {
            contains: agentResult.businessGap.title.substring(0, 30),
            mode: "insensitive",
          },
        },
      });

      if (existingGap) {
        await prisma.ai_offering_gaps.update({
          where: { id: existingGap.id },
          data: {
            occurrences_count: { increment: 1 },
            customer_context: `${existingGap.customer_context || ""}\n- "${message.trim()}"`.trim(),
          },
        });
      } else {
        await prisma.ai_offering_gaps.create({
          data: {
            title: agentResult.businessGap.title,
            category: agentResult.businessGap.category,
            description: agentResult.businessGap.description,
            customer_context: `Visitor query: "${message.trim()}"`,
            suggested_offering: agentResult.businessGap.suggested_offering,
            potential_impact: agentResult.businessGap.impact,
            status: "new",
          },
        });
      }
    }

    // Record assistant reply
    await prisma.ai_chat_messages.create({
      data: {
        session_id: session.session_id,
        sender: "assistant",
        content: agentResult.reply,
        suggested_services: agentResult.recommendations.length > 0 ? (agentResult.recommendations as any) : null,
        is_escalated: agentResult.isEscalated,
      },
    });

    return NextResponse.json({
      sessionId: session.session_id,
      reply: agentResult.reply,
      recommendations: agentResult.recommendations,
      isEscalated: agentResult.isEscalated,
      businessGapDetected: !!agentResult.businessGap,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
