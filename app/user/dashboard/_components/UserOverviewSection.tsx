"use client";

import React from "react";
import {
  Bell,
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
  User,
  HeartHandshake,
  CheckCircle,
  Clock,
  ExternalLink,
  Wallet,
  XCircle,
  Plus,
  List,
} from "lucide-react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { convertCurrency } from "@/lib/utils/convertCurrency";
import { getCurrencySymbol } from "@/lib/utils/getCurrencySymbol";

import CourseDetailCard from "@/app/components/CourseDetailCard";
import CourseModal from "@/app/components/CourseModal";
import RejectReasonModal from "./RejectReasonModal";
import Pagination from "@/app/components/Pagination";

import {
  Order,
  Course,
  UserProfile,
  Invoice,
  Notification,
  CustomOffer,
} from "app/types/app";
import { KOBO_PER_NAIRA } from "@/lib/constants";

interface UserOverviewSectionProps {
  session: any;
  courses: Course[];
  selectedCurrency: string;
  exchangeRates: any;
  handleCreateCourse: () => void;
  orders: Order[];
  paginatedOrders: Order[];
  ordersPage: number;
  totalOrdersPages: number;
  setOrdersPage: (page: number) => void;
  offers: CustomOffer[];
  paginatedOffers: CustomOffer[];
  offersPage: number;
  totalOffersPages: number;
  setOffersPage: (page: number) => void;
  invoices: Invoice[];
  paginatedInvoices: Invoice[];
  invoicesPage: number;
  totalInvoicesPages: number;
  setInvoicesPage: (page: number) => void;
  rentals: any[];
  paginatedRentals: any[];
  rentalsPage: number;
  totalRentalsPages: number;
  setRentalsPage: (page: number) => void;
  bookings: any[];
  paginatedBookings: any[];
  bookingsPage: number;
  totalBookingsPages: number;
  setBookingsPage: (page: number) => void;
  userProfile: UserProfile;
  isEditingProfile: boolean;
  setIsEditingProfile: (isEditing: boolean) => void;
  editableProfile: UserProfile;
  setEditableProfile: (profile: UserProfile) => void;
  handleProfileChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleSaveProfile: () => void;
  loading: boolean;
  handleChangePassword: () => void;
  notificationCount: number;
  setActiveTab: (tab: string) => void;
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  selectedCourse: Course | null;
  handleInitiatePayment: (id: string) => void;
  handleOfferAction: (
    offer: CustomOffer,
    action: "accept" | "reject",
    reason?: string
  ) => void;
  handleRejectClick: (offer: CustomOffer) => void;
  actionLoading: boolean;
  isRejectReasonModalOpen: boolean;
  setIsRejectReasonModalOpen: (isOpen: boolean) => void;
  selectedOfferForRejection: CustomOffer | null;
  handleConfirmReject: (reason: string) => void;
}

export default function UserOverviewSection({
  session,
  courses,
  selectedCurrency,
  exchangeRates,
  handleCreateCourse,
  orders,
  paginatedOrders,
  ordersPage,
  totalOrdersPages,
  setOrdersPage,
  offers,
  paginatedOffers,
  offersPage,
  totalOffersPages,
  setOffersPage,
  invoices,
  paginatedInvoices,
  invoicesPage,
  totalInvoicesPages,
  setInvoicesPage,
  rentals,
  paginatedRentals,
  rentalsPage,
  totalRentalsPages,
  setRentalsPage,
  bookings,
  paginatedBookings,
  bookingsPage,
  totalBookingsPages,
  setBookingsPage,
  userProfile,
  isEditingProfile,
  setIsEditingProfile,
  editableProfile,
  setEditableProfile,
  handleProfileChange,
  handleSaveProfile,
  loading,
  handleChangePassword,
  notificationCount,
  setActiveTab,
  isModalOpen,
  setIsModalOpen,
  selectedCourse,
  handleInitiatePayment,
  handleOfferAction,
  handleRejectClick,
  actionLoading,
  isRejectReasonModalOpen,
  setIsRejectReasonModalOpen,
  selectedOfferForRejection,
  handleConfirmReject,
}: UserOverviewSectionProps) {
  const router = useRouter();
  const PERCENT_100 = 100;

  return (
    <div className="flex h-screen mt-10 bg-gray-100">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
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

                    {courses
                      .filter(
                        (course) =>
                          course.price === 0 || course.paymentStatus === 1
                      )
                      .map((course) => (
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
                                ? new Date(order.date).toLocaleDateString()
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
                      onClick={() => setActiveTab("custom-offers")}
                      className="text-green-600 hover:underline font-medium"
                    >
                      View All
                    </button>
                  </div>
                  {offers.length > 0 && (
                    <div className="space-y-4">
                      {paginatedOffers.map((offer) => {
                        // Status color mapping
                        const statusColors: any = {
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
                                <div className="flex items-center justify-between">
                                  <p className="flex items-center gap-2 text-gray-600">
                                    <Wallet className="w-4 h-4 text-gray-500 font-bold" />
                                    <strong>Amount:</strong>{" "}
                                    <span className="text-gray-900 font-bold">
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
                                      {offerStatusKey.charAt(0).toUpperCase() +
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
                                        setIsRejectReasonModalOpen(false);

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
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
                      <FileText size={24} className="text-green-600" />
                      Rentals
                    </h2>
                    <button
                      onClick={() => setActiveTab("rentals")}
                      className="text-green-600 hover:underline font-medium"
                    >
                      My Listings
                    </button>
                    <button
                      onClick={() => setActiveTab("bookings")}
                      className="text-green-600 hover:underline font-medium"
                    >
                      My Bookings
                    </button>
                  </div>
                  {bookings.length > 0 && (
                    <div className="space-y-4">
                      {paginatedBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex-grow mb-2 sm:mb-0">
                            <h3 className="font-semibold text-lg text-gray-800">
                              Booking ID: {booking.id}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Date:{" "}
                              {new Date(booking.createdAt).toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500">
                              Amount: ₦
                              {(
                                booking.amount / KOBO_PER_NAIRA
                              ).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 flex-shrink-0">
                            <span
                              className={`px-3 py-1 text-xs font-bold rounded-full ${
                                booking.status === "accepted"
                                  ? "bg-green-200 text-green-800"
                                  : booking.status === "pending"
                                  ? "bg-yellow-200 text-yellow-800"
                                  : "bg-red-200 text-red-800"
                              }`}
                            >
                              {booking.status}
                            </span>
                            {booking.status === "accepted" && (
                              <button
                                onClick={() =>
                                  handleInitiatePayment(booking.id)
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
                        currentPage={bookingsPage}
                        totalPages={totalBookingsPages}
                        onPageChange={setBookingsPage}
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
                        currentInstructorName={session?.user?.name}
                        currentInstructorId={session?.user?.id}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
