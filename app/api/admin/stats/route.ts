export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

import { queryDatabase } from "../../../../lib/db";
import { verifyAdmin } from "@/lib/auth/admin-auth-guard";
import { AdminStats } from "@/app/types/app";

export async function GET(request: Request) {
  try {
    const guardResponse = await verifyAdmin(request);
    if (guardResponse) return guardResponse;

    // 4. Fetch aggregated statistics from the database
    const stats: AdminStats = {
      totalOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      activeCoupons: 0,
      totalUsers: 0,
      pendingJobApplications: 0,
      totalUnreadNotifications: 0,
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

    const unReadNotifications = await queryDatabase(
      `SELECT COUNT(*) FROM notifications WHERE link LIKE '/admin/dashboard/notifications/%' AND is_read = $1`,
      [false]
    );

    stats.totalUnreadNotifications = parseInt(
      unReadNotifications[0].count || "0",
      10
    );

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
