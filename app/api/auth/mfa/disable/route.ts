import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { queryDatabase } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Disable MFA
  await queryDatabase(
    "UPDATE users SET two_factor_enabled = false, two_factor_secret = NULL WHERE email = $1",
    [session.user.email],
  );

  return NextResponse.json({ success: true, message: "MFA disabled" });
}
