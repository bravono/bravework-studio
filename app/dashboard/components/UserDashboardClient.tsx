"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Bell,
  Wallet,
  Users,
  Briefcase,
  Gift,
  FileText,
  Book,
  Eye,
  Settings,
  LogOut,
  ChevronLeft,
  CalendarCheck,
  RefreshCw,
  GraduationCap,
  Baby,
  Edit3,
  Key,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { Session } from "next-auth";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

import { cn } from "@/lib/utils/cn";
import { toast } from "react-toastify";

// Imported User Modules
import StudentView from "../../user/dashboard/_components/modules/StudentView";
import ClientView from "../../user/dashboard/_components/modules/ClientView";
import RenterView from "../../user/dashboard/_components/modules/RenterView";
import ParentView from "../../user/dashboard/_components/modules/ParentView";
import ContributorView from "../../user/dashboard/_components/modules/ContributorView";

interface UserDashboardClientProps {
  user: any;
  roles: string[];
}

export default function UserDashboardClient({
  user,
  roles,
}: UserDashboardClientProps) {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Normalize roles
  const normalizedRoles = roles.map((r) => r.toLowerCase());

  const [activeTab, setActiveTab] = useState<string>("overview");
  const [loadingData, setLoadingData] = useState(false);

  // Stats state (Total counts for overview)
  const [stats, setStats] = useState({
    courses: 0,
    orders: 0,
    invoices: 0,
    bookings: 0,
    unreadNotifications: 0,
  });

  const fetchUserStats = useCallback(async () => {
    setLoadingData(true);
    try {
      // Fetching multiple stats in parallel
      const [coursesRes, ordersRes, invoicesRes, bookingsRes] =
        await Promise.all([
          fetch("/api/user/courses"),
          fetch("/api/user/orders"),
          fetch("/api/user/invoices"),
          fetch("/api/user/bookings"),
        ]);

      const [courses, orders, invoices, bookings] = await Promise.all([
        coursesRes.ok ? coursesRes.json() : [],
        ordersRes.ok ? ordersRes.json() : [],
        invoicesRes.ok ? invoicesRes.json() : [],
        bookingsRes.ok ? bookingsRes.json() : [],
      ]);

      setStats({
        courses: Array.isArray(courses) ? courses.length : 0,
        orders: Array.isArray(orders) ? orders.length : 0,
        invoices: Array.isArray(invoices) ? invoices.length : 0,
        bookings: Array.isArray(bookings) ? bookings.length : 0,
        unreadNotifications: 0, // Placeholder
      });
    } catch (err) {
      console.error("Error fetching user stats:", err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchUserStats();
  }, [fetchUserStats]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  // Define navigation items based on user roles
  const navItems = [
    {
      id: "overview",
      label: "Overview",
      icon: <Eye size={20} />,
      roles: ["any"],
    },
    {
      id: "academy",
      label: "Academy",
      icon: <GraduationCap size={20} />,
      roles: ["student"],
    },
    {
      id: "studio",
      label: "Studio",
      icon: <Briefcase size={20} />,
      roles: ["client"],
    },
    {
      id: "finance",
      label: "Finance",
      icon: <Wallet size={20} />,
      roles: ["client"],
    },
    {
      id: "rentals",
      label: "Rentals",
      icon: <Key size={20} />,
      roles: ["renter"],
    },
    { id: "kids", label: "Kids", icon: <Baby size={20} />, roles: ["parent"] },
    {
      id: "contributor",
      label: "Contributor",
      icon: <Edit3 size={20} />,
      roles: ["contributor"],
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: <Bell size={20} />,
      roles: ["any"],
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings size={20} />,
      roles: ["any"],
    },
  ];

  const filteredNavItems = navItems.filter(
    (item) =>
      item.roles.includes("any") ||
      item.roles.some((role) => normalizedRoles.includes(role)),
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl col-span-full">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Welcome back, {user.name}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {normalizedRoles.includes("student") && (
                  <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-xl text-center shadow-sm border border-blue-100 dark:border-blue-900">
                    <span className="block text-3xl font-bold text-blue-600 dark:text-blue-300 mb-1">
                      {stats.courses}
                    </span>
                    <span className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                      Enrolled Courses
                    </span>
                    <button
                      onClick={() => setActiveTab("academy")}
                      className="mt-3 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View Academy →
                    </button>
                  </div>
                )}
                {normalizedRoles.includes("client") && (
                  <>
                    <div className="bg-purple-50 dark:bg-purple-950 p-6 rounded-xl text-center shadow-sm border border-purple-100 dark:border-purple-900">
                      <span className="block text-3xl font-bold text-purple-600 dark:text-purple-300 mb-1">
                        {stats.orders}
                      </span>
                      <span className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                        Active Projects
                      </span>
                      <button
                        onClick={() => setActiveTab("studio")}
                        className="mt-3 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                      >
                        View Projects →
                      </button>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950 p-6 rounded-xl text-center shadow-sm border border-green-100 dark:border-green-900">
                      <span className="block text-3xl font-bold text-green-600 dark:text-green-300 mb-1">
                        {stats.invoices}
                      </span>
                      <span className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                        Pending Invoices
                      </span>
                      <button
                        onClick={() => setActiveTab("finance")}
                        className="mt-3 text-xs font-semibold text-green-600 dark:text-green-400 hover:underline"
                      >
                        View Finance →
                      </button>
                    </div>
                  </>
                )}
                {normalizedRoles.includes("renter") && (
                  <div className="bg-orange-50 dark:bg-orange-950 p-6 rounded-xl text-center shadow-sm border border-orange-100 dark:border-orange-900">
                    <span className="block text-3xl font-bold text-orange-600 dark:text-orange-300 mb-1">
                      {stats.bookings}
                    </span>
                    <span className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                      Active Bookings
                    </span>
                    <button
                      onClick={() => setActiveTab("rentals")}
                      className="mt-3 text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline"
                    >
                      View Rentals →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions or Summary from modules could go here */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl col-span-full lg:col-span-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Quick Shortcuts
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <Link
                  href="/profile"
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center gap-3"
                >
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-lg">
                    <Users size={18} />
                  </div>
                  <span className="font-medium text-sm">Edit Profile</span>
                </Link>
                <Link
                  href="/academy"
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center gap-3"
                >
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg">
                    <Book size={18} />
                  </div>
                  <span className="font-medium text-sm">Browse Courses</span>
                </Link>
                <Link
                  href="/studio"
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center gap-3"
                >
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-lg">
                    <Briefcase size={18} />
                  </div>
                  <span className="font-medium text-sm">Hire Studio</span>
                </Link>
                <Link
                  href="/rentals"
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center gap-3"
                >
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 rounded-lg">
                    <Key size={18} />
                  </div>
                  <span className="font-medium text-sm">Gear Rentals</span>
                </Link>
              </div>
            </div>
          </div>
        );
      case "academy":
        return <StudentView user={user} />;
      case "studio":
        return <ClientView user={user} filter="studio" />;
      case "finance":
        return <ClientView user={user} filter="finance" />;
      case "rentals":
        return <RenterView user={user} />;
      case "kids":
        return <ParentView user={user} />;
      case "contributor":
        return <ContributorView user={user} />;
      case "notifications":
        return (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Notifications
            </h2>
            <p className="text-gray-500">
              Your notifications will appear here.
            </p>
          </div>
        );
      case "settings":
        return (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Account Settings
            </h2>
            <div className="flex items-center space-x-6 mb-8">
              <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-3xl font-bold text-indigo-600">
                {user.name?.[0] || "U"}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {user.name}
                </h3>
                <p className="text-gray-500">{user.email}</p>
              </div>
            </div>
            <div className="space-y-4">
              <Link
                href="/profile"
                className="block px-6 py-3 bg-indigo-500 text-white font-semibold rounded-xl text-center hover:bg-indigo-600 transition-colors"
              >
                Manage Profile
              </Link>
              <button
                onClick={() => router.push("/auth/change-password")}
                className="w-full px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Change Password
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loadingData && activeTab === "overview") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="animate-spin text-indigo-500 mr-2" />
        <span className="text-gray-500 font-medium">
          Loading your dashboard...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-950 font-sans">
      {/* Sidebar */}
      <aside className="bg-white dark:bg-gray-900 w-full md:w-64 p-4 md:p-6 shadow-xl flex flex-col border-r border-gray-200 dark:border-gray-800">
        <div className="mb-10 px-2 flex items-center justify-center md:justify-start">
          <Link href="/">
            <Image
              src="/assets/Braveword_Studio-Logo-Color.png"
              alt="Bravework"
              width={140}
              height={40}
              className="dark:filter dark:brightness-200"
            />
          </Link>
        </div>

        <nav className="space-y-1 flex-1">
          {filteredNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex items-center w-full px-4 py-3 rounded-xl text-left transition-all duration-200 group",
                activeTab === item.id
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none"
                  : "text-gray-600 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-white",
              )}
            >
              <span
                className={cn(
                  "mr-3 transition-colors",
                  activeTab === item.id
                    ? "text-white"
                    : "text-gray-400 group-hover:text-indigo-500",
                )}
              >
                {item.icon}
              </span>
              <span className="font-semibold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 rounded-xl text-left text-gray-500 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 transition-all duration-200"
          >
            <LogOut size={20} className="mr-3" />
            <span className="font-semibold text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto">
        {activeTab !== "overview" && (
          <button
            onClick={() => setActiveTab("overview")}
            className="mb-6 flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <ChevronLeft size={16} />
            Back to Overview
          </button>
        )}

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
