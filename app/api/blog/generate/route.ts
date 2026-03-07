import { NextRequest, NextResponse } from "next/server";
import { BlogOrchestrator } from "@/lib/ai/blog-orchestrator";

export async function POST(req: NextRequest) {
  try {
    const { topic, pointOfView } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const orchestrator = new BlogOrchestrator();

    // For now, we wait for the full generation.
    // In a more advanced version, we could use SSE for streaming status.
    const content = await orchestrator.generate(topic, pointOfView);

    return NextResponse.json({ content });
  } catch (error: any) {
    console.error("Generation error:", error);

    const isQuotaError =
      error.message?.includes("rate limit") ||
      error.message?.includes("quota") ||
      error.message?.includes("upgrade your Google AI plan");

    return NextResponse.json(
      { error: error.message || "Failed to generate blog post" },
      { status: isQuotaError ? 503 : 500 },
    );
  }
}
