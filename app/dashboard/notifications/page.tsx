// app/dashboard/notifications/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import Link from "next/link";
import RejectReasonModal from "../offers/_components/RejectReasonModal";
import "../../css/dashboard.css";

// Define Notification type
interface Notification {
  id: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
  rejectionReason?: string; // Optional, only for rejected offers
  // Custom offer specific fields (optional, from JOIN)
  offerId?: string;
  offerAmount?: number;
  offerDescription?: string;
  offerStatus?: "pending" | "accepted" | "rejected" | "expired" | string; // String for other statuses
  offerExpiresAt?: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

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
      const res = await fetch("/api/user/notifications"); // Call the new API route
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch notifications.");
      }
      const data: Notification[] = await res.json();
      setNotifications(data);
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
        alert(
          `This offer is already ${currentOfferStatus || "not available"}.`
        );
        return;
      }
      if (isExpired) {
        alert("This offer has expired.");
        // Optionally, update the notification's offerStatus to 'Expired' in local state
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notification.id
              ? { ...notif, offerStatus: "Expired" }
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
        alert(`Offer ${action}ed successfully!`);
        // Update the notification's offerStatus in local state
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notification.id
              ? {
                  ...notif,
                  offerStatus: result.newStatus,
                  rejectionReason: result.rejectionReason,
                }
              : notif
          )
        );
        markNotificationAsRead(notification.id); // Mark notification as read after action
      } catch (err: any) {
        console.error(`Error ${action}ing offer:`, err);
        alert(`Error ${action}ing offer: ` + (err.message || "Unknown error."));
      } finally {
        setActionLoading(false);
      }
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
    return <div className="loading-state">Loading notifications...</div>;
  }

  if (sessionStatus === "unauthenticated") {
    return null; // Redirect handled by useEffect
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Your Notifications</h1>
          <Link href="/dashboard" className="profile-link">
            <span>&larr; Back to Dashboard</span>
          </Link>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card notifications-list">
            {notifications.length > 0 ? (
              <div className="notification-items">
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
                      className={`notification-item ${
                        notification.isRead ? "read" : "unread"
                      }`}
                      onClick={() =>
                        !notification.isRead &&
                        markNotificationAsRead(notification.id)
                      }
                    >
                      <div className="notification-header">
                        <h3 className="notification-title">
                          {notification.title}
                        </h3>
                        <span className="notification-date">
                          {format(
                            new Date(notification.createdAt),
                            "MMM dd, yyyy HH:mm"
                          )}
                        </span>
                      </div>
                      <p className="notification-message">
                        {notification.message}
                      </p>

                      {isOfferNotification && (
                        <div className="offer-details-summary mt-2 p-2 border border-gray-200 rounded-md bg-gray-50">
                          <p>
                            <strong>Offer Amount:</strong> $
                            {notification.offerAmount?.toLocaleString() ||
                              "N/A"}
                          </p>
                          <p>
                            <strong>Offer Status:</strong>{" "}
                            <span
                              className={`status-badge ${
                                notification.offerStatus?.toLowerCase() ||
                                "unknown"
                              }`}
                            >
                              {notification.offerStatus}
                            </span>
                          </p>
                          {notification.offerExpiresAt && (
                            <p>
                              <strong>Expires:</strong>{" "}
                              <span
                                style={{
                                  color: isOfferExpired ? "#ef4444" : "#f59e0b",
                                }}
                              >
                                {format(
                                  new Date(notification.offerExpiresAt),
                                  "MMM dd, yyyy HH:mm"
                                )}
                                {isOfferExpired && " (Expired)"}
                              </span>
                            </p>
                          )}
                          {notification.offerStatus === "Rejected" &&
                            notification.rejectionReason && (
                              <p className="text-red-600 italic">
                                Reason: {notification.rejectionReason}
                              </p>
                            )}

                          {canActOnOffer && (
                            <div className="offer-actions mt-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOfferAction(notification, "accept");
                                }}
                                disabled={actionLoading}
                                className="action-button accept-button"
                              >
                                {actionLoading
                                  ? "Accepting..."
                                  : "Accept Offer"}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRejectClick(notification);
                                }}
                                disabled={actionLoading}
                                className="action-button reject-button"
                              >
                                {actionLoading
                                  ? "Rejecting..."
                                  : "Reject Offer"}
                              </button>
                            </div>
                          )}
                          {!canActOnOffer &&
                            notification.offerStatus !== "expired" &&
                            notification.offerStatus !== "pending" && (
                              <p className="mt-2 text-sm text-gray-600">
                                Offer is{" "}
                                {notification.offerStatus.toLowerCase()}.
                              </p>
                            )}
                          {isOfferExpired && (
                            <p className="mt-2 text-sm text-red-600 font-bold">
                              This offer has expired.
                            </p>
                          )}
                          {notification.link && (
                            <Link
                              href={notification.link}
                              className="view-details-link mt-2 inline-block"
                            >
                              View Full Offer Details &rarr;
                            </Link>
                          )}
                        </div>
                      )}

                      {!isOfferNotification && notification.link && (
                        <Link
                          href={notification.link}
                          className="view-details-link mt-2 inline-block"
                        >
                          View Details &rarr;
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-gray-500">No new notifications.</p>
            )}
          </div>
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
