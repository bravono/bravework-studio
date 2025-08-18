import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options"; // adjust path as needed
import { NextResponse } from "next/server";

export async function verifyUser() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return {
      isAuthenticated: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const userId = (session.user as any).id;
  if (!userId) {
    return {
      isAuthenticated: false,
      response: NextResponse.json(
        { error: "User ID not found in session" },
        { status: 400 }
      ),
    };
  }

  return {
    isAuthenticated: true,
    userId,
  };
}