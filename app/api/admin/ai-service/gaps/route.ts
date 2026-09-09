import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth/admin-auth-guard";

export async function GET(req: Request) {
  const authError = await verifyAdmin(req);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const impact = searchParams.get("impact");

    const where: any = {};
    if (status && status !== "all") where.status = status;
    if (category && category !== "all") where.category = category;
    if (impact && impact !== "all") where.potential_impact = impact;

    const gaps = await prisma.ai_offering_gaps.findMany({
      where,
      orderBy: [{ potential_impact: "asc" }, { occurrences_count: "desc" }, { updated_at: "desc" }],
    });

    const stats = {
      total: await prisma.ai_offering_gaps.count(),
      new: await prisma.ai_offering_gaps.count({ where: { status: "new" } }),
      planned: await prisma.ai_offering_gaps.count({ where: { status: "planned" } }),
      adopted: await prisma.ai_offering_gaps.count({ where: { status: "adopted" } }),
      highImpact: await prisma.ai_offering_gaps.count({ where: { potential_impact: "high" } }),
    };

    return NextResponse.json({ gaps, stats });
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
    const { title, category, description, customer_context, suggested_offering, potential_impact } = body;

    if (!title || !description || !suggested_offering) {
      return NextResponse.json(
        { error: "Title, description, and suggested offering are required." },
        { status: 400 }
      );
    }

    const newGap = await prisma.ai_offering_gaps.create({
      data: {
        title: title.trim(),
        category: (category || "Services").trim(),
        description: description.trim(),
        customer_context: customer_context ? customer_context.trim() : null,
        suggested_offering: suggested_offering.trim(),
        potential_impact: potential_impact || "medium",
        status: "new",
      },
    });

    return NextResponse.json({ gap: newGap }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
