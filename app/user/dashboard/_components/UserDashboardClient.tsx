"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  Suspense,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
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
  Gift,
  FileText,
  BadgeDollarSign,
  ChevronLeft,
  ChevronRight,
  User,
  HeartHandshake,
  CheckCircle,
  Clock,
  ExternalLink,
  Wallet,
  XCircle,
  PlusCircle,
  Plus,
  List,
} from "lucide-react";
import { toast } from "react-toastify";

import {
  Order,
  Course,
  UserProfile,
  Invoice,
  Notification,
  CustomOffer,
  PaginationProps,
} from "app/types/app";

import { convertCurrency } from "@/lib/utils/convertCurrency";
import { getCurrencySymbol } from "@/lib/utils/getCurrencySymbol";

// Importing page sections as components
import UserCustomOffersSection from "./UserCustomOfferSection";
import UserInvoicesSection from "./UserInvoicesSection";
import UserNotificationsSection from "./UserNotificationsSection";
import UserOrdersSection from "./UserOrdersSection";
import UserReferralsSection from "./UserReferralsSection";

// Custom Hooks
import useExchangeRates from "@/hooks/useExchangeRates";
import useSelectedCurrency from "@/hooks/useSelectedCurrency";
import RejectReasonModal from "./RejectReasonModal";

import CourseDetailCard from "@/app/components/CourseDetailCard";
import CourseModal from "@/app/components/CourseModal";
import Loader from "@/app/components/Loader";

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

function Page() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const { data: session, status } = useSession();

  const { exchangeRates } = useExchangeRates();
  const { selectedCurrency, updateSelectedCurrency } = useSelectedCurrency();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
  const [offers, setOffers] = useState<CustomOffer[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination states
  const [ordersPage, setOrdersPage] = useState(1);
  const [offersPage, setOffersPage] = useState(1);
  const [coursesPage, setCoursesPage] = useState(1);
  const [invoicesPage, setInvoicesPage] = useState(1);
  const itemsPerPage = 5; // Can be adjusted

  const [isAcceptConfirmationModalOpen, setIsAcceptConfirmationModalOpen] =
    useState(false);
  const [isRejectReasonModalOpen, setIsRejectReasonModalOpen] = useState(false);
  const [selectedOfferForRejection, setSelectedOfferForRejection] =
    useState<CustomOffer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const KOBO_PER_NAIRA = 100;
  const PERCENT_100 = 100;

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

      // 3. Fetch Custom-Offers
      const offerRes = await fetch("/api/user/custom-offers");
      if (!offerRes.ok) throw new Error("Failed to fetch custom offers");
      const offerData: CustomOffer[] = await offerRes.json();
      setOffers(offerData);

      // 3. Fetch Courses
      const coursesRes = await fetch("/api/user/courses");
      if (!coursesRes.ok) throw new Error("Failed to fetch courses");
      const coursesData: Course[] = await coursesRes.json();
      setCourses(coursesData);

      // // 4. Fetch Invoices
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

  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    // Only run after auth and when courses update
    if (hasRedirectedRef.current) return;
    if (status !== "authenticated") return;
    if (!courses || courses.length === 0) return;

    const course = courses.find(
      (c) =>
        c.paymentStatus != null &&
        c.paymentStatus !== 1 &&
        c.paymentStatus !== 4 // ADDED (c.paymentStatus != null)
    );

    if (course && course.amount > 0) {
      // Prevent repeated redirects and avoid redirecting if already on payment page
      if (
        typeof window !== "undefined" &&
        window.location.pathname.startsWith("/user/dashboard/payment")
      ) {
        return;
      }

      hasRedirectedRef.current = true;
      console.log("Found courseId with paymentStatus not 1 or 4:", course?.id); // ADDED ?.
      router.push(`/user/dashboard/payment?courseId=${course.id}`);
    }
  }, [status, courses, router]);

  useEffect(() => {
    console.log("Courses:", courses);
  }, [courses]);

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

  const handleOfferAction = useCallback(
    async (
      offer: CustomOffer,
      action: "accept" | "reject",
      reason?: string
    ) => {
      if (!offer?.id) return; // ADDED ?.

      const currentOfferStatus = offer.status?.toLowerCase();

      if (currentOfferStatus !== "pending") {
        toast.error(
          `This offer is already ${currentOfferStatus || "not available"}.`
        );
        return;
      }

      setActionLoading(true);
      try {
        const res = await fetch(
          `/api/user/custom-offers/${offer.id}/${action}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rejectionReason: reason }),
          }
        );

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || `Failed to ${action} offer.`);
        }

        const result = await res.json();
        toast.success(`Offer ${action}ed successfully!`);

        const formDataToSend = new FormData();
        formDataToSend.append(
          "offerAmount",
          offer.offerAmount?.toString() ?? "" // USED ?? instead of ||
        );
        formDataToSend.append("offerStatus", `${action}ed`);
        formDataToSend.append("offerDescription", offer.description ?? ""); // USED ??
        formDataToSend.append("rejectionReason", offer.rejectionReason ?? "");

        fetch("https://formspree.io/f/yourFormID", {
          method: "POST",
          body: JSON.stringify(formDataToSend),
          headers: {
            Accept: "application/json",
          },
        })
          .then((response) => {
            if (response.ok) {
              console.log("Form submitted successfully!");
            } else {
              console.error("Form submission failed.");
            }
          })
          .catch((error) => {
            console.error("Error submitting form:", error);
          });

        if (result.redirectTo) {
          window.location.href = result.redirectTo;
        }
      } catch (err: any) {
        console.error(`Error ${action}ing offer:`, err.message);
        toast.error(
          `Error ${action}ing offer: ` + (err.message || "Unknown error.")
        );
      } finally {
        setActionLoading(false);
      }
    },
    []
  );

  const handleRejectClick = (offer: CustomOffer) => {
    setSelectedOfferForRejection(offer);
    setIsRejectReasonModalOpen(true);
  };

  const handleConfirmReject = (reason: string) => {
    if (selectedOfferForRejection) {
      setIsRejectReasonModalOpen(false);
      handleOfferAction(selectedOfferForRejection, "reject", reason);
    }
  };

  if (status === "loading" || loading) {
    return <Loader user={"user"} />;
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
    (order) => order.status === "overpayment_detected"
  ).length;
  const projectOrders = orders.filter(
    (order) => order.serviceName !== "Course"
  ).length;
  const coursesInProgress = orders.filter(
    (order) => order.serviceName === "Course"
  ).length;
  const totalSpent =
    orders.reduce((sum, order) => sum + (order.amount || 0), 0) /
    KOBO_PER_NAIRA;

  // Pagination Logic
  const paginatedOrders = orders.slice(
    (ordersPage - 1) * itemsPerPage,
    ordersPage * itemsPerPage
  );

  const totalOrdersPages = Math.ceil(orders.length / itemsPerPage);

  const paginatedOffers = offers.slice(
    (offersPage - 1) * itemsPerPage,
    offersPage * itemsPerPage
  );
  const totalOffersPages = Math.ceil(offers.length / itemsPerPage);

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

  const getPaymentStatus = (status: number) => {
    switch (status) {
      case 1:
        return {
          label: "Enrolled",
          color: "bg-green-100 text-green-800",
          icon: CheckCircle,
        };
      case 4:
        return {
          label: "Pending",
          color: "bg-green-100 text-green-800",
          icon: Clock,
        };
      case 5:
        return {
          label: "Pending",
          color: "bg-green-100 text-green-800",
          icon: Clock,
        };
      case 6:
        return {
          label: "Enrolled",
          color: "bg-green-100 text-green-800",
          icon: CheckCircle,
        };
      // You can add other statuses as needed (e.g., 1: "Pending", 2: "Failed")
      default:
        return {
          label: "Pending",
          color: "bg-yellow-100 text-yellow-800",
          icon: Clock,
        };
    }
  };

  const handleCreateCourse = () => {
    setSelectedCourse(null);
    setIsModalOpen(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="bg-gray-100 min-h-screen p-4 mt-10 md:p-8">
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
                <div className="mt-4 md:mt-0">
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="flex items-center justify-center gap-2 w-full md:w-auto p-3 text-white bg-green-600 rounded-lg shadow hover:bg-green-700 transition-colors"
                  >
                    <User size={20} />
                    Edit Profile
                  </button>
                </div>
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
                            {projectOrders}
                          </span>
                          <Package size={28} className="text-green-500" />
                        </div>
                        <span className="text-sm font-medium text-gray-500 block mt-1">
                          Orders (Active {activeOrders})
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
                            {getCurrencySymbol(selectedCurrency)}
                            {convertCurrency(
                              totalSpent,
                              exchangeRates?.[selectedCurrency] ?? 1, // ADDED ?? 1 as fallback rate
                              getCurrencySymbol(selectedCurrency)
                            ).toLocaleString()}
                          </span>
                          <BadgeDollarSign
                            size={28}
                            className="text-green-500"
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-500 block mt-1">
                          Total Spent
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Course Progress */}
                  {session?.user?.roles?.includes("student") && (
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
                          Explore More
                        </Link>
                      </div>

                      {courses.map((course) => (
                        <CourseDetailCard
                          key={course.id}
                          course={course}
                          selectedCurrency={selectedCurrency}
                          exchangeRates={exchangeRates}
                        />
                      ))}

                      {courses.length === 0 && (
                        <p className="text-center text-gray-500 mt-12">
                          No courses found.
                        </p>
                      )}
                    </div>
                  )}

                  {session?.user?.roles?.includes("instructor") && (
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                      <div className="flex flex-col md:flex-row items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-2xl font-bold text-gray-800 mb-4 md:mb-0">
                          Course Management
                        </div>

                        <button
                          onClick={handleCreateCourse}
                          className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition duration-150 shadow-md flex items-center justify-center gap-2"
                        >
                          <Plus size={20} />
                          Create New Course
                        </button>
                      </div>
                      <p className="text-gray-500 mt-2 text-center md:text-left">
                        Start building your next educational masterpiece.
                      </p>
                      existing courses
                      <div className="mt-4 border-t pt-4">
                        <Link
                          href="/instructor/courses"
                          className="text-gray-600 hover:text-blue-600 hover:underline font-medium flex items-center gap-1"
                        >
                          <List size={18} />
                          View All Drafts & Published Courses
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Recent Orders */}
                  <div className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
                        <Package size={24} className="text-green-600" />
                        Recent Orders
                      </h2>
                      <button
                        onClick={() => setActiveTab("orders")}
                        className="text-green-600 hover:underline font-medium"
                      >
                        View All
                      </button>
                    </div>
                    {orders.length > 0 && (
                      <div className="space-y-4">
                        {paginatedOrders.map((order) => (
                          <div
                            key={order.id}
                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <div className="flex-grow mb-2 sm:mb-0">
                              <h3 className="font-semibold text-lg text-gray-800">
                                {order.serviceName}
                              </h3>
                              <p className="text-sm text-gray-500">
                                Order ID: {order.id}
                              </p>
                              <p className="text-sm text-gray-500">
                                Date:{" "}
                                {order.date
                                  ? new Date(order.date).toLocaleString()
                                  : "N/A"}
                              </p>
                            </div>
                            <div className="flex items-center gap-4 flex-shrink-0">
                              <span
                                className={`px-3 py-1 text-xs font-bold rounded-full ${
                                  order.status === "paid"
                                    ? "bg-green-200 text-green-800"
                                    : order.status === "pending"
                                    ? "bg-yellow-200 text-yellow-800"
                                    : "bg-red-200 text-red-800"
                                }`}
                              >
                                {order.status}
                              </span>
                              <span className="font-bold text-gray-800">
                                {getCurrencySymbol(selectedCurrency)}
                                {convertCurrency(
                                  order.amount / KOBO_PER_NAIRA,
                                  exchangeRates?.[selectedCurrency],
                                  getCurrencySymbol(selectedCurrency)
                                ).toLocaleString()}
                              </span>
                              {(order.status === "paid" ||
                                order.status === "partially_paid" ||
                                order.status === "overpayment_detected") && (
                                <Link
                                  href={`/orders/track/${
                                    order?.trackingId && order?.trackingId
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
                    )}
                  </div>
                  {/* Custom Offers */}
                  <div className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
                        <Gift size={24} className="text-green-600" />
                        Custom Offers
                      </h2>
                      <button
                        onClick={() => setActiveTab("orders")}
                        className="text-green-600 hover:underline font-medium"
                      >
                        View All
                      </button>
                    </div>
                    {offers.length > 0 && (
                      <div className="space-y-4">
                        {paginatedOffers.map((offer) => {
                          // Status color mapping
                          const statusColors = {
                            pending: "bg-yellow-100 text-yellow-800",
                            accepted: "bg-green-100 text-green-800",
                            rejected: "bg-red-100 text-red-800",
                            expired: "bg-gray-200 text-gray-600",
                          };

                          // Check if offer is expired
                          const isOfferExpired =
                            offer.expiresAt &&
                            new Date(offer.expiresAt) < new Date() &&
                            offer.status !== "accepted" &&
                            offer.status !== "rejected";

                          // Compute status key
                          const offerStatusKey = isOfferExpired
                            ? "expired"
                            : offer.status?.toLowerCase() || "unknown";

                          const canActOnOffer =
                            offer.status === "pending" && !isOfferExpired;

                          const owing =
                            offer.offerAmount -
                            (Number(offer.totalPaid) +
                              (offer.discount
                                ? offer.offerAmount *
                                  (offer.discount / PERCENT_100)
                                : 0));
                          return (
                            <div className="space-y-6" key={offer.id}>
                              <div
                                className={`bg-white border rounded-xl shadow-sm p-6 cursor-pointer transition-transform duration-300 ease-in-out hover:shadow-lg`}
                              >
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm mt-4 space-y-2">
                                  {/* <div className="flex items-center justify-between">
                                    <p className="flex items-center gap-2 text-gray-600">
                                      <KeyRound className="w-4 h-4 text-gray-500 font-bold" />
                                      <strong>Offer ID:</strong>{" "}
                                      <span className="text-gray-900 font-bold">
                                        {offer.id}
                                      </span>
                                    </p>
                                    
                                  </div> */}

                                  <div className="flex items-center justify-between">
                                    <p className="flex items-center gap-2 text-gray-600">
                                      <Wallet className="w-4 h-4 text-gray-500 font-bold" />
                                      <strong>Amount:</strong>{" "}
                                      <span className="text-gray-900 font-bold">
                                        {getCurrencySymbol(selectedCurrency)}
                                        {convertCurrency(
                                          offer.offerAmount / KOBO_PER_NAIRA,
                                          exchangeRates?.[selectedCurrency],
                                          getCurrencySymbol(selectedCurrency)
                                        ).toLocaleString()}
                                      </span>
                                    </p>
                                    {
                                      <span
                                        className={`px-3 py-1 rounded-full text-xs  ${
                                          statusColors[offerStatusKey] ||
                                          "bg-gray-100 text-gray-700"
                                        }`}
                                      >
                                        {offerStatusKey
                                          .charAt(0)
                                          .toUpperCase() +
                                          offerStatusKey.slice(1)}
                                      </span>
                                    }
                                  </div>
                                  {owing && offer.status === "accepted" ? (
                                    <div className="flex items-center justify-between">
                                      <p className="flex items-center gap-2 text-gray-600">
                                        <DollarSign className="w-4 h-4 text-gray-500 font-bold" />
                                        <strong>Balance:</strong>{" "}
                                        <span className="text-gray-900 font-bold">
                                          {getCurrencySymbol(selectedCurrency)}

                                          {convertCurrency(
                                            owing / KOBO_PER_NAIRA,
                                            exchangeRates?.[selectedCurrency],
                                            getCurrencySymbol(selectedCurrency)
                                          ).toLocaleString()}
                                        </span>
                                      </p>
                                    </div>
                                  ) : null}
                                  <div className="flex items-center justify-between">
                                    <p className="flex items-center gap-2 text-gray-600">
                                      <FileText className="w-4 h-4 text-gray-500 font-bold" />
                                      <strong>Description:</strong>{" "}
                                      <span className="text-gray-900 font-bold">
                                        {offer.description}
                                      </span>
                                    </p>
                                  </div>

                                  {offer.expiresAt && (
                                    <p
                                      className={`flex items-center gap-2 text-gray-600`}
                                    >
                                      <Clock className="w-4 h-4 text-gray-500 font-bold" />
                                      <strong>Expires:</strong>{" "}
                                      <span className="text-gray-900 font-bold">
                                        {offer.expiresAt
                                          ? new Date(
                                              offer.expiresAt
                                            ).toLocaleDateString()
                                          : "N/A"}
                                      </span>
                                    </p>
                                  )}
                                  {offer.status === "rejected" &&
                                    offer.rejectionReason && (
                                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                                        <h4 className="text-red-700 font-bold mb-1">
                                          Reason for Rejection:
                                        </h4>
                                        <p className="text-red-600 italic">
                                          {offer.rejectionReason}
                                        </p>
                                      </div>
                                    )}
                                  {canActOnOffer ? (
                                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 mt-4">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setIsAcceptConfirmationModalOpen(
                                            false
                                          );

                                          handleOfferAction(offer, "accept");
                                        }}
                                        disabled={actionLoading}
                                        className="flex-1 px-5 py-2 rounded-lg font-semibold transition-all duration-200 ease-in-out text-center bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                      >
                                        <CheckCircle className="w-5 h-5" />
                                        {actionLoading
                                          ? "Accepting..."
                                          : "Accept Offer"}
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRejectClick(offer);
                                        }}
                                        disabled={actionLoading}
                                        className="flex-1 px-5 py-2 rounded-lg font-semibold transition-all duration-200 ease-in-out text-center bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                      >
                                        <XCircle className="w-5 h-5" />
                                        {actionLoading
                                          ? "Rejecting..."
                                          : "Reject Offer"}
                                      </button>
                                    </div>
                                  ) : owing && offer.status === "accepted" ? (
                                    <div className="pt-4 border-t border-gray-200 mt-4">
                                      <button
                                        onClick={() =>
                                          router.push(
                                            `/user/dashboard/payment?offerId=${offer.id}&balance=true`
                                          )
                                        }
                                        className="w-[50] px-5 py-2 rounded-lg font-semibold transition-all duration-200 ease-in-out text-center bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                      >
                                        Pay Balance
                                      </button>
                                    </div>
                                  ) : null}
                                </div>
                                <button
                                  onClick={() => {
                                    setActiveTab("custom-offers");
                                  }}
                                  className="text-blue-600 hover:text-blue-800 font-medium text-sm mt-3 flex items-center gap-1"
                                >
                                  View Details{" "}
                                  <ExternalLink className="w-4 h-4" />
                                </button>
                              </div>
                              {isRejectReasonModalOpen &&
                                selectedOfferForRejection && (
                                  <RejectReasonModal
                                    onClose={() =>
                                      setIsRejectReasonModalOpen(false)
                                    }
                                    onConfirm={handleConfirmReject}
                                    isLoading={actionLoading}
                                  />
                                )}
                            </div>
                          );
                        })}
                        <Pagination
                          currentPage={offersPage}
                          totalPages={totalOffersPages}
                          onPageChange={setOffersPage}
                        />
                      </div>
                    )}
                  </div>

                  {/* Invoices */}
                  <div className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
                        <FileText size={24} className="text-green-600" />
                        My Invoices
                      </h2>
                      <button
                        onClick={() => setActiveTab("invoices")}
                        className="text-green-600 hover:underline font-medium"
                      >
                        View All
                      </button>
                    </div>
                    {invoices.length > 0 && (
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
                                Amount: ₦
                                {(
                                  invoice.amount / KOBO_PER_NAIRA
                                ).toLocaleString()}
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
                                  onClick={() =>
                                    handleInitiatePayment(invoice.id)
                                  }
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
                            <strong>Member Since:</strong>{" "}
                            {userProfile.memberSince
                              ? new Date(
                                  userProfile.memberSince
                                ).toLocaleDateString()
                              : "N/A"}
                          </p>
                          <p>
                            <strong>Full Name:</strong> {session?.user?.name}
                          </p>
                          <p>
                            <strong>Company Name:</strong>{" "}
                            {userProfile.companyName || "Not set"}
                          </p>
                          <p>
                            <strong>Phone:</strong>{" "}
                            {userProfile.phone || "Not set"}
                          </p>
                          <p>
                            <strong>Bio:</strong>{" "}
                            {userProfile.bio || "No bio yet."}
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
                        <button
                          onClick={() => setActiveTab("referrals")}
                          className="mt-3 inline-block px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Manage Referrals
                        </button>
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
                        ) : null}
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
                      <button
                        onClick={() => setActiveTab("notifications")}
                        className="relative flex items-center justify-center gap-2 w-full p-4 text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors font-semibold"
                      >
                        <Bell size={20} />
                        Notifications
                        {notificationCount > 0 && (
                          <span className="absolute top-2 right-2 flex items-center justify-center px-2 py-1 text-xs font-bold text-white bg-red-600 rounded-full">
                            {notificationCount}
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => setActiveTab("referrals")}
                        className="flex items-center justify-center gap-2 w-full p-4 text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors font-semibold"
                      >
                        <HeartHandshake size={20} />
                        Referrals
                      </button>

                      {isModalOpen && (
                        <CourseModal
                          onClose={() => setIsModalOpen(false)}
                          existingCourse={selectedCourse}
                          onSave={null}
                          userRole="instructor"
                          currentInstructorName={session.user.name}
                          currentInstructorId={session.user.id}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "orders":
        return <UserOrdersSection />;
      case "invoices":
        return <UserInvoicesSection />;
      case "notifications":
        return <UserNotificationsSection />;
      case "custom-offers":
        return <UserCustomOffersSection />;
      case "referrals":
        return <UserReferralsSection />;
      case "courses":
    }
  };
  return renderContent();
}

export default function DashboardPage() {
  return (
    <Suspense>
      <Page />
    </Suspense>
  );
}
