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
  Settings,
  LogOut,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { Session } from "next-auth";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
// The custom CSS file is no longer needed as we are using Tailwind CSS
// import "../../../css/dashboard.css";

import { AdminProfile, AdminStats } from "../../../types/app";
import { cn } from "@/lib/utils/cn";
import { toast } from "react-toastify";

// Imported Admin Sections (assuming these are also modernized or styled with Tailwind)
import AdminOrdersSection from "./AdminOrdersSection";
import AdminUsersSection from "./AdminUsersSection";
import AdminJobApplicationsSection from "./AdminJobApplicationsSection";
import AdminInvoicesSection from "./AdminInvoicesSection";
import AdminCustomOffersSection from "./AdminCustomOfferSection";
import AdminNotificationsSection from "./AdminNotificationsSection";

interface AdminDashboardClientProps {
  initialSession: Session;
}

const navItems = [
  { id: "overview", label: "Overview", icon: <Eye size={20} /> },
  { id: "orders", label: "Orders & Projects", icon: <FileText size={20} /> },
  { id: "custom-offers", label: "Custom Offers", icon: <Gift size={20} /> },
  { id: "users", label: "Users", icon: <Users size={20} /> },
  { id: "invoices", label: "Invoices & Payments", icon: <Wallet size={20} /> },
  { id: "job-applications", label: "Job Applications", icon: <Briefcase size={20} /> },
  { id: "notifications", label: "Notifications", icon: <Bell size={20} /> },
  { id: "settings", label: "Settings", icon: <Settings size={20} /> },
];

export default function AdminDashboardClient({
  initialSession,
}: AdminDashboardClientProps) {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [activeTab, setActiveTab] = useState<string>("overview"); // State to manage active tab

  const [adminProfile, setAdminProfile] = useState<AdminProfile>({
    id: (initialSession.user as any)?.id,
    fullName: initialSession.user?.name,
    email: initialSession.user?.email,
    memberSince: "N/A", // This will be fetched from the backend
  });

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

  // Function to fetch overall admin dashboard stats
  const fetchAdminStats = useCallback(async () => {
    setLoadingData(true);
    setDataError(null);
    try {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Failed to fetch admin stats.");
      const data: AdminStats = await res.json();
      setStats(data);
    } catch (err: any) {
      console.error("Error fetching admin stats:", err);
      setDataError(err.message || "Failed to load admin overview data.");
      toast.error(err.message || "Failed to load admin overview data.");
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminStats();
  }, [fetchAdminStats]);

  const handleChangePassword = () => {
    router.push("/auth/change-password");
  };

  const handleLogout = async () => {
    await signOut();
  };

  // Render content based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Admin Overview Stats Card */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl col-span-full">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Admin Overview
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-xl text-center shadow">
                  <span className="block text-2xl font-bold text-blue-600 dark:text-blue-300">
                    {stats.totalOrders}
                  </span>
                  <span className="block text-sm text-gray-500 dark:text-gray-400">
                    Total Orders
                  </span>
                </div>
                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-xl text-center shadow">
                  <span className="block text-2xl font-bold text-green-600 dark:text-green-300">
                    ₦{(stats.totalRevenue / kobo).toLocaleString()}
                  </span>
                  <span className="block text-sm text-gray-500 dark:text-gray-400">
                    Total Revenue
                  </span>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-xl text-center shadow">
                  <span className="block text-2xl font-bold text-yellow-600 dark:text-yellow-300">
                    {stats.pendingOrders}
                  </span>
                  <span className="block text-sm text-gray-500 dark:text-gray-400">
                    Pending Orders
                  </span>
                </div>
                <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-xl text-center shadow">
                  <span className="block text-2xl font-bold text-purple-600 dark:text-purple-300">
                    {stats.activeCoupons}
                  </span>
                  <span className="block text-sm text-gray-500 dark:text-gray-400">
                    Active Coupons
                  </span>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-950 p-4 rounded-xl text-center shadow">
                  <span className="block text-2xl font-bold text-indigo-600 dark:text-indigo-300">
                    {stats.totalUsers}
                  </span>
                  <span className="block text-sm text-gray-500 dark:text-gray-400">
                    Total Users
                  </span>
                </div>
                <div className="bg-red-50 dark:bg-red-950 p-4 rounded-xl text-center shadow">
                  <span className="block text-2xl font-bold text-red-600 dark:text-red-300">
                    {stats.pendingJobApplications}
                  </span>
                  <span className="block text-sm text-gray-500 dark:text-gray-400">
                    Pending Job Apps
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Management Tools Card */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl flex flex-col">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Management Tools
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  className="w-full px-6 py-4 bg-gray-100 dark:bg-gray-700 rounded-xl font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => setActiveTab("orders")}
                >
                  Manage Orders
                </button>
                <button
                  className="w-full px-6 py-4 bg-gray-100 dark:bg-gray-700 rounded-xl font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => setActiveTab("users")}
                >
                  Manage Users
                </button>
                <button
                  className="w-full px-6 py-4 bg-gray-100 dark:bg-gray-700 rounded-xl font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => setActiveTab("job-applications")}
                >
                  Manage Job Apps
                </button>
                <button
                  className="w-full px-6 py-4 bg-gray-100 dark:bg-gray-700 rounded-xl font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => setActiveTab("invoices")}
                >
                  Manage Invoices
                </button>
                <Link href="/admin/reports" className="w-full px-6 py-4 bg-gray-100 dark:bg-gray-700 rounded-xl font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center">
                  View Reports
                </Link>
                <Link href="/admin/discounts" className="w-full px-6 py-4 bg-gray-100 dark:bg-gray-700 rounded-xl font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center">
                  Manage Discounts
                </Link>
              </div>
            </div>

            {/* System Health Card */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl flex flex-col">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                System Health
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Monitor server status, API performance, and database health.
              </p>
              <Link href="/admin/system-health" className="mt-auto self-start text-indigo-500 hover:text-indigo-600 font-semibold transition-colors">
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
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Admin Settings
            </h2>
            <div className="flex items-center space-x-6 mb-8">
              <Image
                src={
                  adminProfile.profileImage ||
                  "/assets/Braveword_Studio-Logo-Color.png"
                }
                alt="Profile"
                width={100}
                height={100}
                className="rounded-full border-4 border-indigo-500 shadow-md object-cover"
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {adminProfile.fullName}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {adminProfile.email}
                </span>
                <Link href="/profile" className="text-indigo-500 hover:text-indigo-600 font-semibold mt-2">
                  Edit Profile
                </Link>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              General application settings, integrations, and more.
            </p>
            <button
              onClick={handleChangePassword}
              className="px-6 py-3 bg-indigo-500 text-white font-semibold rounded-full shadow-lg hover:bg-indigo-600 transition-colors"
            >
              Change Admin Password
            </button>
          </div>
        );
      case "notifications":
        return <AdminNotificationsSection />;
      default:
        return null;
    }
  };

  // Render loading/error states for the main dashboard
  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg text-gray-700 dark:text-gray-300">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading admin dashboard overview...
      </div>
    );
  }

  if (dataError) {
    return <div className="flex items-center justify-center min-h-screen text-lg text-red-500 dark:text-red-400">Error: {dataError}</div>;
  }

  // Fallback for session status (should be authenticated due to server-side check)
  if (status === "loading" || status === "unauthenticated") {
    return <div className="flex items-center justify-center min-h-screen text-lg text-gray-700 dark:text-gray-300">Authenticating...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 dark:bg-gray-900 font-sans">
      {/* Sidebar Navigation */}
      <aside className="bg-white dark:bg-gray-800 w-full md:w-64 p-4 shadow-xl flex flex-col">
        <div className="flex items-center justify-center md:justify-start">
            <Image
                src="/assets/Braveword_Studio-Logo-Color.png" // Replace with your logo
                alt="Logo"
                width={50}
                height={50}
                className="mb-4 hidden md:block"
            />
            <div className="text-xl font-bold text-gray-800 dark:text-white mb-6 hidden md:block ml-2">
                Admin
            </div>
        </div>
        <nav className="space-y-2 flex-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex items-center w-full px-4 py-3 rounded-xl text-left text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors duration-200 relative",
                activeTab === item.id && "bg-indigo-500 text-white hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700"
              )}
            >
              <span
                className={cn(
                  "mr-3",
                  activeTab === item.id ? "text-white" : "text-gray-400 dark:text-gray-500"
                )}
              >
                {item.icon}
              </span>

              <span className={cn("font-medium", activeTab === item.id ? "text-white" : "text-gray-800 dark:text-gray-200")}>{item.label}</span>
              {item.label.toLowerCase() === "notifications" && stats.totalUnreadNotifications > 0 &&(
                <span className="absolute top-1 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                  {stats.totalUnreadNotifications}
                </span>
              )}
            </button>
          ))}
        </nav>
        {/* Logout button */}
        <div className="mt-auto border-t border-gray-200 dark:border-gray-700 pt-4">
            <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 rounded-xl text-left text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950 transition-colors duration-200"
            >
                <LogOut size={20} className="mr-3 text-gray-400 dark:text-gray-500" />
                <span className="font-medium text-gray-800 dark:text-gray-200">Logout</span>
            </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="w-full">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
