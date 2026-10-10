import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth/admin-auth-guard";
import { synthesizeOfferingGapsFromHistory } from "@/lib/ai/gap-analyzer";

export async function POST(req: Request) {
  const authError = await verifyAdmin(req);
  if (authError) return authError;

  try {
    const result = await synthesizeOfferingGapsFromHistory();
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
