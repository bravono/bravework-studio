import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth/admin-auth-guard";

export async function GET(req: Request) {
  const authError = await verifyAdmin(req);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status && status !== "all") {
      where.status = status;
    }

    const escalations = await prisma.ai_escalations.findMany({
      where,
      orderBy: { created_at: "desc" },
    });

    const pendingCount = await prisma.ai_escalations.count({
      where: { status: "pending" },
    });

    return NextResponse.json({
      escalations,
      pendingCount,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
