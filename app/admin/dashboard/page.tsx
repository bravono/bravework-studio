import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "../../../lib/auth-options"; // Adjust path as needed

// Import the Client Component for the actual dashboard content
import AdminDashboardClient from "../../components/AdminDashboardClient";

export default async function AdminDashboardPage() {
  // 1. Server-side Authentication and Authorization Check
  const session = await getServerSession(authOptions);

  // Check if authenticated
  if (!session || !session.user) {
    // This redirect happens on the server, before any client-side rendering
    redirect("/auth/login?error=unauthenticated");
  }

  // Check for specific role (Authorization)
  // Ensure 'role' is correctly added to your session/JWT in authOptions callbacks
  const userRoles = (session.user as any).roles.map((role) =>
    role.toLowerCase()
  );

  console.log("Includes? :", userRoles.includes("admin"));
  if (!userRoles.includes("admin")) {
    // This redirect also happens on the server
    redirect("/auth/error?message=forbidden");
  }

  // Now, render the client component that contains the interactive dashboard UI
  return <AdminDashboardClient initialSession={session} />;
}
