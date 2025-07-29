import Reat, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function AdminUsersSection() {
  const { data: session } = useSession();
  const [userRoles, setUserRoles] = useState([]);

  useEffect(() => {
    if (session && session.user) {
      const roles = (session.user as any).roles || [];
      setUserRoles(roles.map((role: string) => role.toLowerCase()));
    }
  }, [session]);

  // Render the dashboard content
  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <p>Welcome, {session?.user?.name || "Admin"}!</p>
      {/* Add more sections as needed */}
    </div>
  );
}
