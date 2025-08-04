// app/dashboard/notifications/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

import { toast } from "react-toastify";
import { format } from "date-fns";

import { Notification } from "../../types/app";
import RejectReasonModal from "../offers/_components/RejectReasonModal";

export default function NotificationsPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const kobo = 100; // 1 NGN = 100 Kobo

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [isRejectReasonModalOpen, setIsRejectReasonModalOpen] = useState(false);
  const [selectedOfferForRejection, setSelectedOfferForRejection] =
    useState<Notification | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (sessionStatus !== "authenticated") return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/user/notifications");
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch notifications.");
      }
      const data: Notification[] = await res.json();
      setNotifications(data);
      console.log("Fetched notifications:", data);
    } catch (err: any) {
      console.error("Error fetching notifications:", err);
      setError(err.message || "An error occurred while loading notifications.");
    } finally {
      setLoading(false);
    }
  }, [sessionStatus]);

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      fetchNotifications();
    } else if (sessionStatus === "unauthenticated") {
      router.push("/auth/login?error=unauthenticated"); // Redirect if not logged in
    }
  }, [sessionStatus, fetchNotifications, router]);

  // Function to mark a notification as read
  const markNotificationAsRead = useCallback(async (notificationId: string) => {
    try {
      const res = await fetch(`/api/user/notifications?id=${notificationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error || "Failed to mark notification as read."
        );
      }
      // Update local state to reflect the change
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (err: any) {
      console.error("Error marking notification as read:", err);
      // Optionally show a toast or message
    }
  }, []);

  // Handle offer actions (Accept/Reject)
  const handleOfferAction = useCallback(
    async (
      notification: Notification,
      action: "accept" | "reject",
      reason?: string
    ) => {
      if (!notification.offerId) return; // Should only be called for offer notifications

      const currentOfferStatus = notification.offerStatus?.toLowerCase();
      const isExpired =
        notification.offerExpiresAt &&
        new Date(notification.offerExpiresAt) < new Date();

      if (currentOfferStatus !== "pending") {
        toast.error(
          `This offer is already ${currentOfferStatus || "not available"}.`
        );
        return;
      }
      if (isExpired) {
        toast.error("This offer has expired.");
        // Optionally, update the notification's offerStatus to 'Expired' in local state
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notification.id
              ? { ...notif, offerStatus: "expired" } // Changed to 'expired' string
              : notif
          )
        );
        return;
      }

      if (!confirm(`Are you sure you want to ${action} this offer?`)) return;

      setActionLoading(true);
      try {
        const res = await fetch(
          `/api/user/custom-offers/${notification.offerId}/${action}`,
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
        // Update the notification's offerStatus in local state
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notification.id
              ? {
                  ...notif,
                  offerStatus: result.newStatus.toLowerCase(), // Ensure status is lowercase for badge class
                  rejectionReason: result.rejectionReason,
                }
              : notif
          )
        );
        markNotificationAsRead(notification.id); // Mark notification as read after action
      } catch (err: any) {
        console.error(`Error ${action}ing offer:`, err);
        toast.error(
          `Error ${action}ing offer: ` + (err.message || "Unknown error.")
        );
      } finally {
        setActionLoading(false);
      }
      router.push("/dashboard/payment?offerId=" + notification.offerId); // Redirect to payment page after action
    },
    [markNotificationAsRead]
  );

  // Handle click on reject button to open modal
  const handleRejectClick = (notification: Notification) => {
    setSelectedOfferForRejection(notification);
    setIsRejectReasonModalOpen(true);
  };

  // Callback from RejectReasonModal
  const handleConfirmReject = (reason: string) => {
    if (selectedOfferForRejection) {
      setIsRejectReasonModalOpen(false);
      handleOfferAction(selectedOfferForRejection, "reject", reason);
    }
  };

  if (sessionStatus === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg text-gray-700">
        Loading notifications...
      </div>
    );
  }

  if (sessionStatus === "unauthenticated") {
    return null; // Redirect handled by useEffect
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 sm:p-8">
        <div className="flex justify-between items-center mb-6 mt-10">
          <h1 className="text-3xl font-bold text-gray-900">
            Your Notifications
          </h1>
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
          >
            <span className="mr-1">&larr;</span> Back to Dashboard
          </Link>
        </div>

        <div className="space-y-4">
          {notifications.length > 0 ? (
            <div className="space-y-4">
              {" "}
              {/* notification-items */}
              {notifications.map((notification) => {
                const isOfferNotification =
                  notification.link?.startsWith("/dashboard/offers/");
                const isOfferExpired =
                  notification.offerExpiresAt &&
                  new Date(notification.offerExpiresAt) < new Date();
                const canActOnOffer =
                  isOfferNotification &&
                  notification.offerStatus === "pending" &&
                  !isOfferExpired;

                return (
                  <div
                    key={notification.id}
                    className={`bg-white border rounded-lg shadow-sm p-4 cursor-pointer transition-all duration-200 ease-in-out
                      ${
                        notification.isRead
                          ? "bg-gray-50 border-gray-100 text-gray-600"
                          : "bg-blue-50 border-blue-200 text-gray-800 font-medium hover:bg-blue-100 shadow-md"
                      }`}
                    onClick={() =>
                      !notification.isRead &&
                      markNotificationAsRead(notification.id)
                    }
                  >
                    <div className="flex justify-between items-center mb-2">
                      {" "}
                      {/* notification-header */}
                      <h3 className="text-lg font-semibold text-gray-900">
                        {" "}
                        {/* notification-title */}
                        {notification.title}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {" "}
                        {/* notification-date */}
                        {format(
                          new Date(notification.createdAt),
                          "MMM dd, yyyy HH:mm"
                        )}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">
                      {" "}
                      {/* notification-message */}
                      {notification.message}
                    </p>

                    {isOfferNotification && (
                      <div className="bg-gray-100 border border-gray-300 rounded-md p-3 text-sm text-gray-700 mt-2">
                        {" "}
                        {/* offer-details-summary */}
                        <p>
                          <strong>Offer Amount:</strong> NGN{" "}
                          {(notification.offerAmount / kobo).toLocaleString() ||
                            "N/A"}
                        </p>
                        <p>
                          <strong>Offer Status:</strong>{" "}
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              isOfferExpired
                                ? "bg-gray-200 text-gray-600" // If expired, use expired styling
                                : notification.offerStatus === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : notification.offerStatus === "accepted"
                                ? "bg-green-100 text-green-800"
                                : notification.offerStatus === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-700" // Default if status is unknown
                            }`}
                          >
                            {isOfferExpired
                              ? "Expired"
                              : notification.offerStatus}{" "}
                            {/* Display 'Expired' if expired, else actual status */}
                          </span>
                        </p>
                        {notification.offerExpiresAt && (
                          <p>
                            <strong>Expires:</strong>{" "}
                            <span
                              className={`${
                                isOfferExpired
                                  ? "text-red-600 font-bold"
                                  : "text-orange-500 font-bold"
                              }`}
                            >
                              {format(
                                new Date(notification.offerExpiresAt),
                                "MMM dd, yyyy HH:mm"
                              )}
                              {isOfferExpired && " (expired)"}
                            </span>
                          </p>
                        )}
                        {notification.offerStatus === "rejected" &&
                          notification.rejectionReason && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 italic mt-4">
                              {" "}
                              {/* rejection-reason */}
                              <h3 className="text-red-700 font-semibold mb-2">
                                Reason for Rejection:
                              </h3>
                              <p className="text-red-600 italic">
                                {notification.rejectionReason}
                              </p>
                            </div>
                          )}
                        {canActOnOffer && (
                          <div className="flex flex-col sm:flex-row gap-3 mt-3">
                            {" "}
                            {/* offer-actions */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOfferAction(notification, "accept");
                              }}
                              disabled={actionLoading}
                              className="px-5 py-2 rounded-lg font-semibold transition-all duration-200 ease-in-out text-center bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
                            >
                              {actionLoading ? "Accepting..." : "Accept Offer"}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRejectClick(notification);
                              }}
                              disabled={actionLoading}
                              className="px-5 py-2 rounded-lg font-semibold transition-all duration-200 ease-in-out text-center bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
                            >
                              {actionLoading ? "Rejecting..." : "Reject Offer"}
                            </button>
                          </div>
                        )}
                        {!canActOnOffer &&
                          notification.offerStatus !== "expired" &&
                          notification.offerStatus !== "pending" && (
                            <p className="mt-2 text-sm text-gray-600">
                              Offer is {notification.offerStatus.toLowerCase()}.
                            </p>
                          )}
                        {isOfferExpired && ( // This block is now redundant for the text, as the badge handles it.
                          <p className="mt-2 text-sm text-red-600 font-bold">
                            {/* This text is now handled by the badge itself for expired status */}
                          </p>
                        )}
                        {notification.link && (
                          <Link
                            href={notification.link}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm inline-block mt-2"
                          >
                            View Full Offer Details &rarr;
                          </Link>
                        )}
                      </div>
                    )}

                    {!isOfferNotification && notification.link && (
                      <Link
                        href={notification.link}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm inline-block mt-2"
                      >
                        View Details &rarr;
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500 p-4">
              No new notifications.
            </p>
          )}
        </div>
      </div>

      {/* Reject Reason Modal */}
      {isRejectReasonModalOpen && selectedOfferForRejection && (
        <RejectReasonModal
          onClose={() => setIsRejectReasonModalOpen(false)}
          onConfirm={handleConfirmReject}
          isLoading={actionLoading}
        />
      )}
    </div>
  );
}
