// app/dashboard/notifications/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

import { toast } from "react-toastify";
import { format } from "date-fns";

import {
  Bell,
  CheckCircle,
  Clock,
  ExternalLink,
  Wallet,
  XCircle,
} from "lucide-react";
import { Notification } from "../../../types/app";
import RejectReasonModal from "../_components/RejectReasonModal";
import { getCurrencySymbol } from "@/lib/utils/getCurrencySymbol";
import { convertCurrency } from "@/lib/utils/convertCurrency";

// Custom Hooks
import useExchangeRates from "@/hooks/useExchangeRates";
import useSelectedCurrency from "@/hooks/useSelectedCurrency";

export default function NotificationsPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const KOBO_PER_NAIRA = 100;
  const DOLLAR_PER_NAIRA = 0.00065;

  const { selectedCurrency, updateSelectedCurrency } = useSelectedCurrency();
  const { exchangeRates } = useExchangeRates();

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
      router.push("/auth/login?error=unauthenticated");
    }
  }, [sessionStatus, fetchNotifications, router]);

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
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (err: any) {
      console.error("Error marking notification as read:", err);
    }
  }, []);

  const handleOfferAction = useCallback(
    async (
      notification: Notification,
      action: "accept" | "reject",
      reason?: string
    ) => {
      if (!notification.offerId) return;

      const currentOfferStatus = notification.offerStatus?.toLowerCase();
      const isExpired =
        notification.offerExpiresAt &&
        new Date(notification.offerExpiresAt) < new Date() &&
        notification.offerStatus !== "accepted" &&
        notification.offerStatus !== "rejected";

      if (currentOfferStatus !== "pending") {
        toast.error(
          `This offer is already ${currentOfferStatus || "not available"}.`
        );
        return;
      }
      if (isExpired) {
        toast.error("This offer has expired.");
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notification.id
              ? { ...notif, offerStatus: "expired" }
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

        const formDataToSend = new FormData();
        formDataToSend.append("message", notification.message || "");
        formDataToSend.append("link", notification.link || "");
        formDataToSend.append(
          "offerAmount",
          notification.offerAmount?.toString() || ""
        );
        formDataToSend.append("offerStatus", `${action}ed`);
        formDataToSend.append(
          "offerDescription",
          notification.offerDescription || ""
        );
        formDataToSend.append(
          "rejectionReason",
          notification.rejectionReason ?? ""
        );

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

        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notification.id
              ? {
                  ...notif,
                  offerStatus: result.newStatus.toLowerCase(),
                  rejectionReason: result.rejectionReason,
                }
              : notif
          )
        );

        if (result.redirectTo) {
          window.location.href = result.redirectTo;
        }

        markNotificationAsRead(notification.id);
      } catch (err: any) {
        console.error(`Error ${action}ing offer:`, err.message);
        toast.error(
          `Error ${action}ing offer: ` + (err.message || "Unknown error.")
        );
      } finally {
        setActionLoading(false);
      }
    },
    [markNotificationAsRead]
  );

  const handleRejectClick = (notification: Notification) => {
    setSelectedOfferForRejection(notification);
    setIsRejectReasonModalOpen(true);
  };

  const handleConfirmReject = (reason: string) => {
    if (selectedOfferForRejection) {
      setIsRejectReasonModalOpen(false);
      handleOfferAction(selectedOfferForRejection, "reject", reason);
    }
  };

  if (sessionStatus === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-8">
        <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-xl">
          <Bell className="h-16 w-16 text-blue-500 animate-pulse" />
          <p className="mt-4 text-xl font-semibold text-gray-700">
            Loading notifications...
          </p>
        </div>
      </div>
    );
  }

  if (sessionStatus === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
              <Bell className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">
                Notifications
              </h1>
              <p className="text-gray-500 mt-1">
                Your latest updates and offers.
              </p>
            </div>
          </div>
          <Link
            href="/user/dashboard?tab=overview"
            className="mt-4 sm:mt-0 px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors duration-200 flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>

        <div className="space-y-6">
          {notifications.length > 0 ? (
            notifications.map((notification) => {
              const isOfferNotification = notification.link?.startsWith(
                "/user/dashboard/notifications/"
              );
              const isOfferExpired =
                notification.offerExpiresAt &&
                new Date(notification.offerExpiresAt) < new Date();
              const canActOnOffer =
                isOfferNotification &&
                notification.offerStatus === "pending" &&
                !isOfferExpired;

              const statusColors = {
                pending: "bg-yellow-100 text-yellow-800",
                accepted: "bg-green-100 text-green-800",
                rejected: "bg-red-100 text-red-800",
                expired: "bg-gray-200 text-gray-600",
              };

              const offerStatusKey = isOfferExpired
                ? "expired"
                : notification.offerStatus?.toLowerCase() || "unknown";

              return (
                <div
                  key={notification.id}
                  className={`bg-white border rounded-xl shadow-sm p-6 cursor-pointer transition-transform duration-300 ease-in-out hover:shadow-lg
                  ${
                    notification.isRead
                      ? "bg-gray-50 border-gray-100 text-gray-600 opacity-80"
                      : "bg-white border-blue-200 text-gray-800 font-medium scale-105"
                  }`}
                  onClick={() =>
                    !notification.isRead &&
                    markNotificationAsRead(notification.id)
                  }
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-full ${
                          notification.isRead
                            ? "bg-gray-100 text-gray-500"
                            : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        <Bell className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {notification.title}
                      </h3>
                    </div>
                    <span className="text-sm text-gray-500">
                      {format(
                        new Date(notification.createdAt),
                        "MMM dd, yyyy HH:mm"
                      )}
                    </span>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {notification.message}
                  </p>

                  {isOfferNotification && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm mt-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="flex items-center gap-2 text-gray-600">
                          <Wallet className="w-4 h-4 text-gray-500" />
                          <strong>Amount:</strong>{" "}
                          <span className="text-gray-900 font-bold">
                            {getCurrencySymbol(selectedCurrency)}
                            {convertCurrency(
                              (notification.offerAmount / KOBO_PER_NAIRA) *
                                DOLLAR_PER_NAIRA,
                              exchangeRates?.[selectedCurrency],
                              getCurrencySymbol(selectedCurrency)
                            ).toLocaleString()}
                          </span>
                        </p>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            statusColors[offerStatusKey] ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {offerStatusKey.charAt(0).toUpperCase() +
                            offerStatusKey.slice(1)}
                        </span>
                      </div>
                      {notification.offerExpiresAt && (
                        <p
                          className={`flex items-center gap-2 ${
                            isOfferExpired ? "text-red-600" : "text-orange-500"
                          }`}
                        >
                          <Clock className="w-4 h-4" />
                          <strong>Expires:</strong>{" "}
                          <span className="font-bold">
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
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                            <h4 className="text-red-700 font-semibold mb-1">
                              Reason for Rejection:
                            </h4>
                            <p className="text-red-600 italic">
                              {notification.rejectionReason}
                            </p>
                          </div>
                        )}
                      {canActOnOffer ? (
                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 mt-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOfferAction(notification, "accept");
                            }}
                            disabled={actionLoading}
                            className="flex-1 px-5 py-2 rounded-lg font-semibold transition-all duration-200 ease-in-out text-center bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-5 h-5" />
                            {actionLoading ? "Accepting..." : "Accept Offer"}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRejectClick(notification);
                            }}
                            disabled={actionLoading}
                            className="flex-1 px-5 py-2 rounded-lg font-semibold transition-all duration-200 ease-in-out text-center bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            <XCircle className="w-5 h-5" />
                            {actionLoading ? "Rejecting..." : "Reject Offer"}
                          </button>
                        </div>
                      ) : null}
                      {notification.link && (
                        <Link
                          href={{
                            pathname: "/user/dashboard",
                            query: { tab: "custom-offers" },
                          }}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm mt-3 flex items-center gap-1"
                        >
                          View Full Offer Details{" "}
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  )}

                  {!isOfferNotification && notification.link && (
                    <Link
                      href={notification.link}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm mt-3 flex items-center gap-1"
                    >
                      View Details <ExternalLink className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-lg">
              <Bell className="w-20 h-20 text-gray-300" />
              <p className="mt-4 text-xl font-semibold text-gray-500">
                No new notifications.
              </p>
              <p className="text-gray-400 mt-2">
                We'll let you know when something new comes up.
              </p>
            </div>
          )}
        </div>
      </div>

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
