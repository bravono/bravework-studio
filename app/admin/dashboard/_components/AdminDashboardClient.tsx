"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Bell,
  Wallet,
  Users,
  Briefcase,
  Gift,
  FileText,
  User,
  Eye,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import "../../../css/dashboard.css";

import { AdminProfile, AdminStats } from "../../../types/app";
import { cn } from "@/lib/utils/cn";

import AdminOrdersSection from "./AdminOrdersSection";
import AdminUsersSection from "./AdminUsersSection";
import AdminJobApplicationsSection from "./AdminJobApplicationsSection";
import AdminInvoicesSection from "./AdminInvoicesSection";
import AdminNotificationsSection from "./AdminNotificationsSection";

interface AdminDashboardClientProps {
  initialSession: Session;
}

const navItems = [
  { id: "overview", label: "Overview", icon: <Eye size={20} /> },
  { id: "orders", label: "Orders & Projects", icon: <FileText size={20} /> },
  { id: "custom-offers", label: "Custom Offers", icon: <Gift size={20} /> }, // New tab
  { id: "users", label: "Users", icon: <Users size={20} /> },
  { id: "invoices", label: "Invoices & Payments", icon: <Wallet size={20} /> },
  { id: "settings", label: "Settings", icon: <User size={20} /> },
  { id: "notifications", label: "Notifications", icon: <Bell size={20} /> },
  {
    id: "job-applications",
    label: "Job Applications",
    icon: <Briefcase size={20} />,
  },
];

export default function AdminDashboardClient({
  initialSession,
}: AdminDashboardClientProps) {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [activeTab, setActiveTab] = useState<string>("overview"); // State to manage active tab

  // Admin Profile state (for display, not directly editable here)
  const [adminProfile, setAdminProfile] = useState<AdminProfile>({
    id: (initialSession.user as any)?.id || "",
    fullName: initialSession.user?.name || "Admin User",
    email: initialSession.user?.email || "",
    memberSince: "N/A", // Will be fetched from backend
  });

  // Main dashboard data states
  const [stats, setStats] = useState<AdminStats>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    activeCoupons: 0,
    totalUsers: 0,
    pendingJobApplications: 0,
    totalUnreadNotifications: 0,
  });

  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  const kobo = 100;

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="dashboard-grid">
            <div className="dashboard-card overview">
              <h2>Admin Overview</h2>
              <div className="overview-stats">
                <div className="stat-item">
                  <span className="stat-value">{stats.totalOrders}</span>
                  <span className="stat-label">Total Orders</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">
                    ₦{(stats.totalRevenue / kobo).toLocaleString()}
                  </span>
                  <span className="stat-label">Total Revenue</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{stats.pendingOrders}</span>
                  <span className="stat-label">Pending Orders</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{stats.activeCoupons}</span>
                  <span className="stat-label">Active Coupons</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{stats.totalUsers}</span>
                  <span className="stat-label">Total Users</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">
                    {stats.pendingJobApplications}
                  </span>
                  <span className="stat-label">Pending Job Apps</span>
                </div>
              </div>
            </div>

            {/* Quick Management Tools */}
            <div className="dashboard-card admin-management">
              <h2>Management Tools</h2>
              <div className="quick-actions-list">
                <button
                  className="action-button"
                  onClick={() => setActiveTab("orders")}
                >
                  Manage Orders
                </button>
                <button
                  className="action-button"
                  onClick={() => setActiveTab("users")}
                >
                  Manage Users
                </button>
                <button
                  className="action-button"
                  onClick={() => setActiveTab("jobApplications")}
                >
                  Manage Job Apps
                </button>
                <button
                  className="action-button"
                  onClick={() => setActiveTab("invoices")}
                >
                  Manage Invoices
                </button>
                <Link href="/admin/reports" className="action-button">
                  View Reports
                </Link>
                <Link href="/admin/discounts" className="action-button">
                  Manage Discounts
                </Link>
              </div>
            </div>

            {/* Placeholder for other admin-specific content */}
            <div className="dashboard-card reports">
              <h2>System Health</h2>
              <p>
                Monitor server status, API performance, and database health.
              </p>
              <Link href="/admin/system-health" className="view-all">
                View System Health
              </Link>
            </div>
          </div>
        );
      case "orders":
        return <AdminOrdersSection />;
      case "custom-offers":
        return <AdminCustomOffersSection />;
      case "users":
        return <AdminUsersSection />;
      case "invoices":
        return <AdminInvoicesSection />;
      case "job-applications":
        return <AdminJobApplicationsSection />;
      case "settings":
        return (
          <>
            <div className="dashboard-card">
              <h2>Admin Settings</h2>
              <div className="profile-summary">
                <img
                  src={
                    adminProfile.profileImage ||
                    "/assets/Braveword_Studio-Logo-Color.png"
                  }
                  alt="Profile"
                  className="profile-image-thumbnail"
                />
                <Link href="/profile" className="profile-link">
                  <span>Edit Profile</span>
                </Link>
              </div>
              <p>General application settings, integrations, etc.</p>
              <button
                onClick={handleChangePassword}
                className="change-password-button"
              >
                Change Admin Password
              </button>
            </div>
            {/* Other settings forms */}
          </>
        );
      case "notifications":
        return <AdminNotificationsSection />; // Placeholder
      default:
        return (
          <div className="flex flex-col md:flex-row h-screen bg-gray-100 font-sans"></div>
        );
    }
  };

  // Function to fetch overall admin dashboard stats
  const fetchAdminStats = useCallback(async () => {
    setLoadingData(true);
    setDataError(null);
    try {
      const res = await fetch("/api/admin/stats"); // NEW API ROUTE
      if (!res.ok) throw new Error("Failed to fetch admin stats.");
      const data: AdminStats = await res.json();
      setStats(data);
    } catch (err: any) {
      console.error("Error fetching admin stats:", err);
      setDataError(err.message || "Failed to load admin overview data.");
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminStats();
  }, [fetchAdminStats]);

  // Handle password change (redirect or open modal)
  const handleChangePassword = () => {
    router.push("/auth/change-password");
  };

  // Render loading/error states for the main dashboard
  if (loadingData) {
    return (
      <div className="loading-state">Loading admin dashboard overview...</div>
    );
  }

  if (dataError) {
    return <div className="error-state">Error: {dataError}</div>;
  }

  // Fallback for session status (should be authenticated due to server-side check)
  if (status === "loading" || status === "unauthenticated") {
    return <div className="loading-state">Authenticating...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 font-sans">
      {/* Sidebar Navigation */}
      <aside className="bg-white w-full md:w-64 p-2 shadow-lg">
        <div className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">
          Admin Dashboard
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex items-center w-full px-4 py-2 rounded-lg text-left text-white-600 hover:bg-blue-500 transition-colors duration-200 relative",
                activeTab === item.id &&
                  "bg-blue-600 text-white hover:bg-blue-700"
              )}
            >
              <span
                className={cn(
                  "mr-3",
                  activeTab === item.id ? "text-white" : "text-gray-300"
                )}
              >
                {item.icon}
              </span>

              <span className={`font-medium`}>{item.label}</span>
              {item.label.toLowerCase() === "notifications" && stats.totalUnreadNotifications > 0 &&(
                <span className="absolute top-1 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                  {stats.totalUnreadNotifications}
                </span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 min-h-full">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
