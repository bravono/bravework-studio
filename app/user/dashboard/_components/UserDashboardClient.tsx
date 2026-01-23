"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  Suspense,
  useRef,
} from "react";
import { ChevronLeft } from "lucide-react";
import { toast } from "react-toastify";

import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

import {
  Order,
  Course,
  UserProfile,
  Invoice,
  Notification,
  CustomOffer,
  Rental,
  Booking,
} from "app/types/app";
import { KOBO_PER_NAIRA } from "@/lib/constants";

// Importing page sections as components
import UserCustomOffersSection from "./UserCustomOfferSection";
import UserInvoicesSection from "./UserInvoicesSection";
import UserNotificationsSection from "./UserNotificationsSection";
import UserOrdersSection from "./UserOrdersSection";
import UserReferralsSection from "./UserReferralsSection";
import UserOverviewSection from "./UserOverviewSection";

// Custom Hooks
import useExchangeRates from "@/hooks/useExchangeRates";
import useSelectedCurrency from "@/hooks/useSelectedCurrency";

import CourseDetailCard from "@/app/components/CourseDetailCard";
import UserRentalsSection from "./UserRentalsSection";
import UserBookingsSection from "./UserBookingsSection";
import UserWalletSection from "./UserWalletSection";
import Loader from "@/app/components/Loader";

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
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination states
  const [ordersPage, setOrdersPage] = useState(1);
  const [offersPage, setOffersPage] = useState(1);
  const [coursesPage, setCoursesPage] = useState(1);
  const [invoicesPage, setInvoicesPage] = useState(1);
  const [rentalsPage, setRentalsPage] = useState(1);
  const [bookingsPage, setBookingsPage] = useState(1);
  const itemsPerPage = 5; // Can be adjusted

  const [isAcceptConfirmationModalOpen, setIsAcceptConfirmationModalOpen] =
    useState(false);
  const [isRejectReasonModalOpen, setIsRejectReasonModalOpen] = useState(false);
  const [selectedOfferForRejection, setSelectedOfferForRejection] =
    useState<CustomOffer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

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

      // 4. Fetch Invoices
      const invoicesRes = await fetch("/api/user/invoices"); // Create this API route
      if (!invoicesRes.ok) throw new Error("Failed to fetch invoices");
      const invoicesData: Invoice[] = await invoicesRes.json();
      setInvoices(invoicesData);

      const notificationRes = await fetch("/api/user/notifications");
      if (!notificationRes.ok) throw new Error("Failed to fetch notifications");
      const notificationData: Notification[] = await notificationRes.json();
      setNotifications(notificationData);

      // Fetch Rentals
      const rentalsRes = await fetch("/api/user/rentals");
      if (rentalsRes.ok) {
        const rentalsData = await rentalsRes.json();
        setRentals(rentalsData);
      }

      // Fetch Bookings
      const bookingsRes = await fetch("/api/user/bookings");
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData);
      }
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
      setError(
        err.message || "An error occurred while fetching dashboard data.",
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
        c.paymentStatus !== 4, // ADDED (c.paymentStatus != null)
    );

    if (course && course.price > 0) {
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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
  const handleInitiatePayment = (
    id: any,
    type: "invoice" | "booking" = "invoice",
  ) => {
    if (type === "booking") {
      router.push(`/user/dashboard/payment?bookingId=${id}`);
    } else {
      toast.info(`Initiating payment for Invoice ID: ${id}`);
      // Example: router.push(`/checkout?invoice=${invoiceId}`);
    }
  };

  const handleReleaseFunds = async (bookingId: number) => {
    if (
      !window.confirm(
        "Are you sure you want to release funds to the owner? This cannot be undone.",
      )
    )
      return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/user/bookings/${bookingId}/release`, {
        method: "POST",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to release funds");
      }

      toast.success("Funds released successfully");
      fetchDashboardData();
    } catch (error: any) {
      console.error("Error releasing funds:", error);
      toast.error(error.message || "Failed to release funds");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRentAgain = (rentalId: number) => {
    router.push(`/academy/rentals/inventory/${rentalId}`);
  };

  const handleOfferAction = useCallback(
    async (
      offer: CustomOffer,
      action: "accept" | "reject",
      reason?: string,
    ) => {
      if (!offer?.id) return; // ADDED ?.

      const currentOfferStatus = offer.status?.toLowerCase();

      if (currentOfferStatus !== "pending") {
        toast.error(
          `This offer is already ${currentOfferStatus || "not available"}.`,
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
          },
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
          offer.offerAmount?.toString() ?? "", // USED ?? instead of ||
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
          `Error ${action}ing offer: ` + (err.message || "Unknown error."),
        );
      } finally {
        setActionLoading(false);
      }
    },
    [],
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
    (order) => order.status === "overpayment_detected",
  ).length;
  const projectOrders = orders.filter(
    (order) => order.serviceName !== "Course",
  ).length;
  const coursesInProgress = orders.filter(
    (order) => order.serviceName === "Course",
  ).length;
  const totalSpent =
    orders.reduce((sum, order) => sum + (order.amount || 0), 0) /
    KOBO_PER_NAIRA;

  // Pagination Logic
  const paginatedOrders = orders.slice(
    (ordersPage - 1) * itemsPerPage,
    ordersPage * itemsPerPage,
  );
  const totalOrdersPages = Math.ceil(orders.length / itemsPerPage);

  const paginatedOffers = offers.slice(
    (offersPage - 1) * itemsPerPage,
    offersPage * itemsPerPage,
  );
  const totalOffersPages = Math.ceil(offers.length / itemsPerPage);

  const paginatedInvoices = invoices.slice(
    (invoicesPage - 1) * itemsPerPage,
    invoicesPage * itemsPerPage,
  );
  const totalInvoicesPages = Math.ceil(invoices.length / itemsPerPage);

  const paginatedRentals = rentals.slice(
    (rentalsPage - 1) * itemsPerPage,
    rentalsPage * itemsPerPage,
  );
  const totalRentalsPages = Math.ceil(rentals.length / itemsPerPage);

  const paginatedBookings = bookings.slice(
    (bookingsPage - 1) * itemsPerPage,
    bookingsPage * itemsPerPage,
  );
  const totalBookingsPages = Math.ceil(bookings.length / itemsPerPage);

  const handleCreateCourse = () => {
    setIsModalOpen(true);
    setSelectedCourse(null);
  };

  const renderContent = () => {
    const withBackToOverview = (content: React.ReactNode) => (
      <div className="flex flex-col h-full">
        {content}
        <button
          onClick={() => setActiveTab("overview")}
          className="self-start flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
        >
          <ChevronLeft size={20} />
          Back to Dashboard
        </button>
      </div>
    );

    switch (activeTab) {
      case "overview":
        return (
          <UserOverviewSection
            session={session}
            courses={courses}
            selectedCurrency={selectedCurrency}
            exchangeRates={exchangeRates}
            handleCreateCourse={handleCreateCourse}
            orders={orders}
            paginatedOrders={paginatedOrders}
            ordersPage={ordersPage}
            totalOrdersPages={totalOrdersPages}
            setOrdersPage={setOrdersPage}
            offers={offers}
            paginatedOffers={paginatedOffers}
            offersPage={offersPage}
            totalOffersPages={totalOffersPages}
            setOffersPage={setOffersPage}
            invoices={invoices}
            paginatedInvoices={paginatedInvoices}
            invoicesPage={invoicesPage}
            totalInvoicesPages={totalInvoicesPages}
            setInvoicesPage={setInvoicesPage}
            rentals={rentals}
            paginatedRentals={paginatedRentals}
            rentalsPage={rentalsPage}
            totalRentalsPages={totalRentalsPages}
            setRentalsPage={setRentalsPage}
            bookings={bookings}
            paginatedBookings={paginatedBookings}
            bookingsPage={bookingsPage}
            totalBookingsPages={totalBookingsPages}
            setBookingsPage={setBookingsPage}
            userProfile={userProfile}
            isEditingProfile={isEditingProfile}
            setIsEditingProfile={setIsEditingProfile}
            editableProfile={editableProfile}
            setEditableProfile={setEditableProfile}
            handleProfileChange={handleProfileChange}
            handleSaveProfile={handleSaveProfile}
            loading={loading}
            handleChangePassword={handleChangePassword}
            notificationCount={notificationCount}
            setActiveTab={setActiveTab}
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            selectedCourse={selectedCourse}
            handleInitiatePayment={handleInitiatePayment}
            handleOfferAction={handleOfferAction}
            handleRejectClick={handleRejectClick}
            actionLoading={actionLoading}
            isRejectReasonModalOpen={isRejectReasonModalOpen}
            setIsRejectReasonModalOpen={setIsRejectReasonModalOpen}
            selectedOfferForRejection={selectedOfferForRejection}
            handleConfirmReject={handleConfirmReject}
            handleReleaseFunds={handleReleaseFunds}
            handleRentAgain={handleRentAgain}
          />
        );

      case "orders":
        return withBackToOverview(<UserOrdersSection />);
      case "invoices":
        return withBackToOverview(<UserInvoicesSection />);
      case "notifications":
        return withBackToOverview(<UserNotificationsSection />);
      case "custom-offers":
        return withBackToOverview(<UserCustomOffersSection />);
      case "rentals":
        return withBackToOverview(<UserRentalsSection />);
      case "bookings":
        return withBackToOverview(<UserBookingsSection />);
      case "wallet":
        return withBackToOverview(<UserWalletSection />);
      case "referrals":
        return withBackToOverview(<UserReferralsSection />);
      case "courses":
        return withBackToOverview(
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              My Courses
            </h2>
            {courses.map((course) => (
              <CourseDetailCard
                key={course.id}
                course={course}
                selectedCurrency={selectedCurrency}
                exchangeRates={exchangeRates}
              />
            ))}
          </div>,
        );
      default:
        return null;
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
