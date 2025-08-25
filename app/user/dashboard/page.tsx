// Import the Client Component for the actual dashboard content
import UserDashboardClient from "./_components/UserDashboardClient";

export default async function AdminDashboardPage() {
  // Now, render the client component that contains the interactive dashboard UI
  return <UserDashboardClient />;
}
