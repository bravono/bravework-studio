import { verifyAdminPages } from "@/lib/auth/admin-auth-guard-pages";
import ServerMonitorClient from "./_components/ServerMonitorClient";

export default async function AdminMonitorPage() {
  const session = await verifyAdminPages();

  return <ServerMonitorClient initialSession={session} />;
}
