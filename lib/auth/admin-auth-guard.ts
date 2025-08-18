import { getServerSession } from "next-auth";
import { authOptions } from "./auth-options";
import { NextResponse } from "next/server";
import { AuthSession } from "../../app/types/auth";

export async function verifyAdmin(req: Request): Promise<NextResponse | null> {
  const session = (await getServerSession(authOptions)) as AuthSession;

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userRoles = session.user.roles.map((role) => role.toLowerCase());

  if (!userRoles.includes("admin")) {
    return NextResponse.json(
      { message: "Forbidden: Insufficient permissions" },
      { status: 403 }
    );
  }

  return null; // All clear!
}
