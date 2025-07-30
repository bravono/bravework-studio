import { verifyAdminPages } from "../../../lib/admin-auth-guard-pages"; // Adjust the import path as necessary

// Import the Client Component for the actual dashboard content
import AdminDashboardClient from "./_components/AdminDashboardClient";

export default async function AdminDashboardPage() {
  const session = await verifyAdminPages();

  // Now, render the client component that contains the interactive dashboard UI
  return <AdminDashboardClient initialSession={session} />;
}
