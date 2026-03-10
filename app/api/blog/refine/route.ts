import { NextRequest, NextResponse } from "next/server";
import { BlogOrchestrator } from "@/lib/ai/blog-orchestrator";

export async function POST(req: NextRequest) {
  try {
    const { content, instructions } = await req.json();

    if (!content || !instructions) {
      return NextResponse.json(
        { error: "Content and instructions are required" },
        { status: 400 },
      );
    }

    const orchestrator = new BlogOrchestrator();

    const refinedContent = await orchestrator.refine(content, instructions);

    return NextResponse.json({ content: refinedContent });
  } catch (error: any) {
    console.error("Refinement error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to refine content" },
      { status: 500 },
    );
  }
}
