import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth-options";
import UserDashboardClient from "@/app/user/dashboard/_components/UserDashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login?callbackUrl=/dashboard");
  }

  return <UserDashboardClient />;
}
