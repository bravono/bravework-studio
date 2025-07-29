// app/api/admin/stats/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth-options";
import { queryDatabase } from "../../../../lib/db";

// Define the expected structure of the statistics
interface AdminStats {
  totalOrders: number;
  totalRevenue: number; // Stored in kobo, convert to currency unit for display
  pendingOrders: number;
  activeCoupons: number;
  totalUsers: number;
  pendingJobApplications: number;
}

export async function GET(request: Request) {
  try {
    // 1. Get the session to authenticate the user
    const session = await getServerSession(authOptions);

    // 2. Check if the user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3. Authorization: Check if the user has the 'admin' role
    const userRoles = (session.user as any).roles.map((role: string) =>
      role.toLowerCase()
    );
    if (!userRoles.includes("admin")) {
      return NextResponse.json(
        { message: "Forbidden: Insufficient permissions" },
        { status: 403 }
      );
    }

    // 4. Fetch aggregated statistics from the database
    const stats: AdminStats = {
      totalOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      activeCoupons: 0,
      totalUsers: 0,
      pendingJobApplications: 0,
    };

    // Total Orders
    const totalOrdersResult = await queryDatabase(
      "SELECT COUNT(*) FROM orders"
    );
    stats.totalOrders = parseInt(totalOrdersResult[0].count || "0", 10);

    // Total Revenue (sum of total_expected_amount_kobo)
    // Remember to convert from kobo to your main currency unit (e.g., divide by 100) on the frontend
    const totalRevenueResult = await queryDatabase(
      "SELECT SUM(total_expected_amount_kobo) FROM orders"
    );
    stats.totalRevenue = parseFloat(totalRevenueResult[0].sum || "0");

    // Pending Orders
    //'Pending' is a valid status in  'order_statuses' table and '3' is the ID for pending orders
    const pendingOrdersResult = await queryDatabase(
      "SELECT COUNT(*) FROM orders WHERE order_status_id = '3'"
    );
    stats.pendingOrders = parseInt(pendingOrdersResult[0].count || "0", 10);

    // Total Users
    const totalUsersResult = await queryDatabase("SELECT COUNT(*) FROM users");
    stats.totalUsers = parseInt(totalUsersResult[0].count || "0", 10);

    // Pending Job Applications
    // 'Pending' is a valid status in 'job_app_statuses' table and '1' is the ID for pending orders
    const pendingJobAppsResult = await queryDatabase(
      "SELECT COUNT(*) FROM job_applications WHERE status_id = 1"
    );
    stats.pendingJobApplications = parseInt(
      pendingJobAppsResult[0].count || "0",
      10
    );

    // Active Coupons (This assumes you have a 'discounts' or 'coupons' table)
    // Example: assuming a 'discounts' table with 'is_active' and 'expires_at'
    const activeCouponsResult = await queryDatabase(
      "SELECT COUNT(*) FROM coupons WHERE expiration_date > NOW()"
    );
    stats.activeCoupons = parseInt(activeCouponsResult[0].count || "0", 10);

    // 5. Return the aggregated statistics
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching admin dashboard statistics:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
