import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth/admin-auth-guard";

export async function GET(req: Request) {
  const authError = await verifyAdmin(req);
  if (authError) return authError;

  try {
    const sessions = await prisma.ai_chat_sessions.findMany({
      orderBy: { updated_at: "desc" },
      take: 40,
      include: {
        messages: {
          orderBy: { created_at: "asc" },
        },
      },
    });

    return NextResponse.json({ sessions });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
