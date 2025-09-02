// lib/verify-admin-page-access.ts
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "./auth-options"; // Adjust if necessary

export async function verifyAdminPages() {
  const session = await getServerSession(authOptions);

  // Redirect if unauthenticated
  if (!session || !session.user) {
    redirect("/auth/login?error=unauthenticated");
  }

  // Check for admin role
  const userRoles = Array.isArray((session.user as any).roles)
    ? (session.user as any).roles.map((role: string) => role.toLowerCase())
    : [];
  

  if (!userRoles.includes("admin")) {
    redirect("/auth/error?message=forbidden");
  }

  return session; // Return session if valid and authorized
}