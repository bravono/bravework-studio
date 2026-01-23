import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth-options";
import DashboardShell from "./components/DashboardShell";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login?callbackUrl=/dashboard");
  }

  // Ensure roles is always an array
  const userRoles = session.user.roles || [];

  return <DashboardShell user={session.user} roles={userRoles} />;
}
