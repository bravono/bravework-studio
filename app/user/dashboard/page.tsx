"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Bell,
  ListOrdered,
  DollarSign,
  BookOpen,
  Pencil,
  Save,
  X,
  KeyRound,
  Mail,
  Package,
  BadgeEuro,
  FileText,
  BadgeDollarSign,
  ChevronLeft,
  ChevronRight,
  User,
  HeartHandshake,
} from "lucide-react";
import { toast } from "react-toastify"; // Using react-toastify as it was already imported in other files

import {
  Order,
  Course,
  UserProfile,
  Invoice,
  Notification,
} from "app/types/app";
// The existing dashboard.css import is commented out to use Tailwind for consistent styling
// import "../../css/dashboard.css";

// Generic Pagination component
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-4 mt-4 text-sm text-gray-600">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1 p-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={16} /> Previous
      </button>
      <span className="text-gray-700">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 p-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Next <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // State for user profile data (initially empty or from session if available)
  const [userProfile, setUserProfile] = useState<UserProfile>({
    fullName: "",
    email: "",
    bio: "",
    profileImage: "/assets/Bravework_Studio-Logo-Color.png", // Default image
    companyName: "",
    phone: "",
    memberSince: "",
    referrals: 0,
    coupons: [],
  });

  // State for editing mode
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editableProfile, setEditableProfile] =
    useState<UserProfile>(userProfile);

  // States for other dashboard data
  const [orders, setOrders] = useState<Order[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination states
  const [ordersPage, setOrdersPage] = useState(1);
  const [coursesPage, setCoursesPage] = useState(1);
  const [invoicesPage, setInvoicesPage] = useState(1);
  const itemsPerPage = 5; // Can be adjusted

  const kobo = 100;
  const notificationCount = notifications.filter((n) => !n.isRead).length;

  // Function to fetch all dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (status !== "authenticated") return; // Only fetch if authenticated

    setLoading(true);
    setError(null);

    try {
      // 1. Fetch User Profile Data
      const profileRes = await fetch("/api/user/profile");
      if (!profileRes.ok) throw new Error("Failed to fetch profile data");
      const profileData: UserProfile = await profileRes.json();
      setUserProfile(profileData);
      setEditableProfile(profileData); // Initialize editable state

      // 2. Fetch Orders
      const ordersRes = await fetch("/api/user/orders");
      if (!ordersRes.ok) throw new Error("Failed to fetch orders");
      const ordersData: Order[] = await ordersRes.json();
      setOrders(ordersData);

      // 3. Fetch Courses
      // const coursesRes = await fetch("/api/user/courses"); // Create this API route
      // if (!coursesRes.ok) throw new Error("Failed to fetch courses");
      // const coursesData: Course[] = await coursesRes.json();
      // setCourses(coursesData);

      // 4. Fetch Invoices
      // const invoicesRes = await fetch("/api/user/invoices"); // Create this API route
      // if (!invoicesRes.ok) throw new Error("Failed to fetch invoices");
      // const invoicesData: Invoice[] = await invoicesRes.json();
      // setInvoices(invoicesData);

      const notificationRes = await fetch("/api/user/notifications");
      if (!notificationRes.ok) throw new Error("Failed to fetch notifications");
      const notificationData: Notification[] = await notificationRes.json();
      setNotifications(notificationData);
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
      setError(
        err.message || "An error occurred while fetching dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }, [status]); // Re-run if authentication status changes

  // Effect to trigger data fetch when authenticated
  useEffect(() => {
    if (status === "authenticated") {
      fetchDashboardData();
    } else if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, fetchDashboardData, router]);

  // Handle profile edit changes
  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditableProfile((prev) => ({ ...prev, [name]: value }));
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editableProfile),
      });

      if (!res.ok) throw new Error("Failed to save profile changes");
      const updatedProfile = await res.json();
      setUserProfile(updatedProfile);
      setEditableProfile(updatedProfile);
      setIsEditingProfile(false);
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      console.error("Error saving profile:", err);
      setError(err.message || "Failed to save profile changes.");
      toast.error("Error saving profile: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  // Handle password change (redirect or open modal)
  const handleChangePassword = () => {
    router.push("/auth/change-password");
  };

  // Handle initiate payment
  const handleInitiatePayment = (invoiceId: string) => {
    toast.info(`Initiating payment for Invoice ID: ${invoiceId}`);
    // Example: router.push(`/checkout?invoice=${invoiceId}`);
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-lg">
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin duration-[2s] ease-in-out delay-300 border-green-500"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-6 bg-white rounded-xl shadow-lg">
          <p className="text-xl font-semibold text-gray-800">
            Please log in to view your dashboard.
          </p>
          <Link
            href="/auth/login"
            className="mt-4 inline-block px-6 py-3 text-white bg-green-600 rounded-lg shadow hover:bg-green-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-6 bg-white rounded-xl shadow-lg">
          <p className="text-xl font-semibold text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  // Calculate overview stats from fetched data
  const activeOrders = orders.filter(
    (order) =>
      order.statusName !== "failed" &&
      order.statusName !== "pending" &&
      order.statusName !== "currency_mismatch"
  ).length;
  const coursesInProgress = courses.filter(
    (course) => course.progress < 100
  ).length;
  const totalSpent =
    orders.reduce((sum, order) => sum + (order.amount || 0), 0) / kobo;

  // Pagination Logic
  const paginatedOrders = orders.slice(
    (ordersPage - 1) * itemsPerPage,
    ordersPage * itemsPerPage
  );
  const totalOrdersPages = Math.ceil(orders.length / itemsPerPage);

  const paginatedCourses = courses.slice(
    (coursesPage - 1) * itemsPerPage,
    coursesPage * itemsPerPage
  );
  const totalCoursesPages = Math.ceil(courses.length / itemsPerPage);

  const paginatedInvoices = invoices.slice(
    (invoicesPage - 1) * itemsPerPage,
    invoicesPage * itemsPerPage
  );
  const totalInvoicesPages = Math.ceil(invoices.length / itemsPerPage);

  return (
    <div className="bg-gray-100 min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 p-6 bg-white rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back,{" "}
            <span className="text-green-600">
              {userProfile.fullName ||
                session?.user?.name ||
                session?.user?.email}
              !
            </span>
          </h1>
          <Link
            href="/profile"
            className="mt-4 md:mt-0 flex items-center gap-2 text-green-600 hover:text-green-800 font-semibold transition-colors"
          >
            <User size={20} />
            Edit Profile
          </Link>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview Card */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800 mb-4">
                <ListOrdered size={24} className="text-green-600" />
                Overview
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-green-700">
                      {activeOrders}
                    </span>
                    <Package size={28} className="text-green-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-500 block mt-1">
                    Active Orders
                  </span>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-green-700">
                      {coursesInProgress}
                    </span>
                    <BookOpen size={28} className="text-green-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-500 block mt-1">
                    Courses in Progress
                  </span>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-green-700">
                      ₦{totalSpent.toLocaleString()}
                    </span>
                    <BadgeDollarSign size={28} className="text-green-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-500 block mt-1">
                    Total Spent
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
                  <Package size={24} className="text-green-600" />
                  Recent Orders
                </h2>
                <Link
                  href="/orders"
                  className="text-green-600 hover:underline font-medium"
                >
                  View All
                </Link>
              </div>
              {orders.length > 0 ? (
                <div className="space-y-4">
                  {paginatedOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex-grow mb-2 sm:mb-0">
                        <h3 className="font-semibold text-lg text-gray-800">
                          {order.service}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Order ID: {order.id}
                        </p>
                        <p className="text-sm text-gray-500">
                          Date: {order.date}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <span
                          className={`px-3 py-1 text-xs font-bold rounded-full ${
                            order.statusName === "paid"
                              ? "bg-green-200 text-green-800"
                              : order.statusName === "pending"
                              ? "bg-yellow-200 text-yellow-800"
                              : "bg-red-200 text-red-800"
                          }`}
                        >
                          {order.statusName}
                        </span>
                        <span className="font-bold text-gray-800">
                          ₦{(order.amount / kobo).toLocaleString()}
                        </span>
                        {(order.statusName === "paid" ||
                          order.statusName === "partially_paid" ||
                          order.statusName === "overpayment_detected") && (
                          <Link
                            href={`/orders/track/${
                              order.trackingId || order.id
                            }`}
                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Track
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                  <Pagination
                    currentPage={ordersPage}
                    totalPages={totalOrdersPages}
                    onPageChange={setOrdersPage}
                  />
                </div>
              ) : (
                <p className="text-gray-500">No recent orders found.</p>
              )}
            </div>

            {/* Course Progress */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
                  <BookOpen size={24} className="text-green-600" />
                  My Courses
                </h2>
                <Link
                  href="/courses"
                  className="text-green-600 hover:underline font-medium"
                >
                  Explore All
                </Link>
              </div>
              {courses.length > 0 ? (
                <div className="space-y-4">
                  {paginatedCourses.map((course) => (
                    <div
                      key={course.id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                        <div className="flex-grow mb-2 sm:mb-0">
                          <h3 className="font-semibold text-lg text-gray-800">
                            {course.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Last accessed: {course.lastAccessed}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 flex-shrink-0">
                          <span className="font-medium text-gray-700">
                            {course.progress}% Complete
                          </span>
                          <Link
                            href={course.link}
                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Go to Course
                          </Link>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                        <div
                          className="h-full bg-green-500 rounded-full transition-all duration-500"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                  <Pagination
                    currentPage={coursesPage}
                    totalPages={totalCoursesPages}
                    onPageChange={setCoursesPage}
                  />
                </div>
              ) : (
                <p className="text-gray-500">
                  You haven't enrolled in any courses yet.
                </p>
              )}
            </div>

            {/* Invoices */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
                  <FileText size={24} className="text-green-600" />
                  My Invoices
                </h2>
                <Link
                  href="/invoices"
                  className="text-green-600 hover:underline font-medium"
                >
                  View All
                </Link>
              </div>
              {invoices.length > 0 ? (
                <div className="space-y-4">
                  {paginatedInvoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex-grow mb-2 sm:mb-0">
                        <h3 className="font-semibold text-lg text-gray-800">
                          Invoice #{invoice.id}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Date: {invoice.issueDate}
                        </p>
                        <p className="text-sm text-gray-500">
                          Amount: ₦{(invoice.amount / kobo).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <span
                          className={`px-3 py-1 text-xs font-bold rounded-full ${
                            invoice.status === "Paid"
                              ? "bg-green-200 text-green-800"
                              : "bg-red-200 text-red-800"
                          }`}
                        >
                          {invoice.status}
                        </span>
                        {invoice.status !== "Paid" && (
                          <button
                            onClick={() => handleInitiatePayment(invoice.id)}
                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Initiate Payment
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <Pagination
                    currentPage={invoicesPage}
                    totalPages={totalInvoicesPages}
                    onPageChange={setInvoicesPage}
                  />
                </div>
              ) : (
                <p className="text-gray-500">No invoices found.</p>
              )}
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-1 space-y-8">
            {/* User Profile Details (Editable) */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800 mb-4">
                <User size={24} className="text-green-600" />
                Your Profile
              </h2>
              <div className="space-y-4">
                <div className="flex flex-col items-center">
                  <img
                    src={
                      userProfile.profileImage ||
                      "/assets/Bravework_Studio-Logo-Color.png"
                    }
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-green-200"
                  />
                </div>
                {isEditingProfile ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      name="fullName"
                      value={editableProfile.fullName}
                      onChange={handleProfileChange}
                      placeholder="Full Name"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                      type="text"
                      name="companyName"
                      value={editableProfile.companyName}
                      onChange={handleProfileChange}
                      placeholder="Company Name"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                      type="text"
                      name="phone"
                      value={editableProfile.phone}
                      onChange={handleProfileChange}
                      placeholder="Phone"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <textarea
                      name="bio"
                      value={editableProfile.bio}
                      onChange={handleProfileChange}
                      placeholder="Bio"
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    ></textarea>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveProfile}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 flex-grow p-3 text-white bg-green-600 rounded-lg shadow hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <Save size={16} />
                        {loading ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingProfile(false);
                          setEditableProfile(userProfile);
                        }}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 flex-grow p-3 text-gray-700 bg-gray-200 rounded-lg shadow hover:bg-gray-300 transition-colors disabled:opacity-50"
                      >
                        <X size={16} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p>
                      <strong>Email:</strong>{" "}
                      {userProfile.email || session?.user?.email}
                    </p>
                    <p>
                      <strong>Member Since:</strong> {userProfile.memberSince}
                    </p>
                    <p>
                      <strong>Full Name:</strong>{" "}
                      {userProfile.fullName || "Not set"}
                    </p>
                    <p>
                      <strong>Company Name:</strong>{" "}
                      {userProfile.companyName || "Not set"}
                    </p>
                    <p>
                      <strong>Phone:</strong> {userProfile.phone || "Not set"}
                    </p>
                    <p>
                      <strong>Bio:</strong> {userProfile.bio || "No bio yet."}
                    </p>
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="flex items-center gap-2 w-full p-3 text-white bg-green-600 rounded-lg shadow hover:bg-green-700 transition-colors"
                    >
                      <Pencil size={16} />
                      Edit Profile
                    </button>
                  </div>
                )}
                <hr className="my-4 border-gray-200" />
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleChangePassword}
                    className="flex items-center gap-2 w-full p-3 text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <KeyRound size={16} />
                    Change Password
                  </button>
                  <Link
                    href="/profile/change-email"
                    className="flex items-center gap-2 w-full p-3 text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <Mail size={16} />
                    Change Email
                  </Link>
                </div>
              </div>
            </div>

            {/* Referrals & Coupons */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800 mb-4">
                <HeartHandshake size={24} className="text-green-600" />
                Referrals & Coupons
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-lg font-semibold text-gray-700">
                    Referrals
                  </p>
                  <p className="text-gray-600">
                    {userProfile.referrals} total referrals
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Share your unique referral link to earn rewards!
                  </p>
                  <Link
                    href="/referrals"
                    className="mt-3 inline-block px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Manage Referrals
                  </Link>
                </div>
                <hr className="border-gray-200" />
                <div>
                  <p className="text-lg font-semibold text-gray-700">
                    Your Coupons
                  </p>
                  {userProfile?.coupons?.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 mt-2">
                      {userProfile.coupons.map((coupon, index) => (
                        <li key={index} className="text-gray-600">
                          {coupon}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No active coupons.</p>
                  )}
                  <Link
                    href="/coupons"
                    className="mt-3 inline-block px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    View All Coupons
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800 mb-4">
                <Bell size={24} className="text-green-600" />
                Quick Actions
              </h2>
              <div className="flex flex-col gap-4">
                <Link
                  href="/contact"
                  className="flex items-center justify-center gap-2 w-full p-4 text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors font-semibold"
                >
                  <User size={20} />
                  Get Support
                </Link>
                <Link
                  href="/user/dashboard/notifications"
                  className="relative flex items-center justify-center gap-2 w-full p-4 text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors font-semibold"
                >
                  <Bell size={20} />
                  Notifications
                  {notificationCount > 0 && (
                    <span className="absolute top-2 right-2 flex items-center justify-center px-2 py-1 text-xs font-bold text-white bg-red-600 rounded-full">
                      {notificationCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
