"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { Eye, Trash2, XCircle, CheckCircle, Clock, Search } from "lucide-react";
import { Notification, Order } from "@/app/types/app";
import ConfirmationModal from "@/app/components/ConfirmationModal";
import Pagination from "@/app/components/Pagination";

const NotificationDetailModal = ({ notification, onClose }) => {
  if (!notification) return null;

  const statusColors = {
    accepted:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    pending:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="text-green-500" size={20} />;
      case "rejected":
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <Clock className="text-yellow-500" size={20} />;
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-lg w-full mx-auto transform transition-all duration-300 scale-95 md:scale-100 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            Notification Details
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <XCircle size={24} />
          </button>
        </div>
        <div className="space-y-4 text-gray-700 dark:text-gray-300">
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl space-y-4">
            <p className="flex justify-between items-center">
              <span className="font-semibold text-gray-500 text-xs uppercase">
                ID
              </span>
              <span className="font-mono text-xs text-gray-900 dark:text-white">
                #{notification.id}
              </span>
            </p>
            <p>
              <span className="font-semibold text-gray-500 text-xs uppercase block mb-1">
                Message
              </span>
              <span className="text-gray-900 dark:text-white font-medium">
                {notification.message}
              </span>
            </p>
            <p className="flex justify-between items-center">
              <span className="font-semibold text-gray-500 text-xs uppercase">
                Offer Amount
              </span>
              <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
                ₦
                {(notification.offerAmount / 100).toLocaleString() ||
                  notification.budget}
              </span>
            </p>
            <p className="flex justify-between items-center">
              <span className="font-semibold text-gray-500 text-xs uppercase">
                Client
              </span>
              <span className="text-gray-900 dark:text-white font-medium">
                {notification.clientName || notification.userId || "N/A"}
              </span>
            </p>
            <p className="flex justify-between items-center">
              <span className="font-semibold text-gray-500 text-xs uppercase">
                Status
              </span>
              <span
                className={`px-3 py-1 inline-flex items-center space-x-1 text-xs leading-5 font-bold rounded-full ${
                  statusColors[notification.offerStatus]
                }`}
              >
                {getStatusIcon(notification.offerStatus)}
                <span className="ml-1 capitalize">
                  {notification.offerStatus}
                </span>
              </span>
            </p>
            <p className="flex justify-between items-center">
              <span className="font-semibold text-gray-500 text-xs uppercase">
                Date
              </span>
              <span className="text-gray-900 dark:text-white">
                {format(new Date(notification.createdAt), "MMM d, yyyy HH:mm")}
              </span>
            </p>
          </div>
        </div>
        <div className="mt-8">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-bold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default function AdminNotificationSection() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const notificationsPerPage = 10;

  // Modal state for confirmations
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] =
    useState<Notification | null>(null);

  const kobo = 100;

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/notifications");
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch notifications");
      }
      const data = await res.json();
      setNotifications(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/orders");
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch orders");
      }
      const data = await res.json();
      setOrders(data);
    } catch (error: any) {
      toast.error(error.message);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchOrders();
  }, [fetchNotifications, fetchOrders]);

  const handleDeleteClick = (notification: Notification) => {
    setNotificationToDelete(notification);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!notificationToDelete) return;

    setIsLoading(true);
    setIsConfirmModalOpen(false);
    try {
      const res = await fetch(
        `/api/admin/notifications/${notificationToDelete.id}`,
        {
          method: "DELETE",
        },
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete notification");
      }
      toast.success("Notification deleted successfully!");
      fetchNotifications();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
      setNotificationToDelete(null);
    }
  };

  const handleViewNotification = (notification: Notification) => {
    setSelectedNotification(notification);
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter(
      (n) =>
        n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(n.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(n.userId || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
    );
  }, [notifications, searchQuery]);

  const indexOfLastNotification = currentPage * notificationsPerPage;
  const indexOfFirstNotification =
    indexOfLastNotification - notificationsPerPage;
  const currentNotifications = filteredNotifications.slice(
    indexOfFirstNotification,
    indexOfLastNotification,
  );
  const totalPages = Math.ceil(
    filteredNotifications.length / notificationsPerPage,
  );

  const statusColors = {
    accepted:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    pending:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Notifications
        </h2>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Notification Info
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td
                      colSpan={5}
                      className="px-6 py-4 h-16 bg-gray-50/50 dark:bg-gray-800/50"
                    ></td>
                  </tr>
                ))
              ) : currentNotifications.length > 0 ? (
                currentNotifications.map((notification) => (
                  <tr
                    key={notification.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-xs text-gray-500 mb-1">
                        ID: #{notification.id}
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                        {notification.message}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        ₦{(notification.offerAmount / kobo).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        From: {notification.userId || "N/A"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-bold rounded-full capitalize ${
                          statusColors[notification.offerStatus]
                        }`}
                      >
                        {notification.offerStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {format(new Date(notification.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewNotification(notification)}
                          className="p-2 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-lg hover:bg-indigo-100 transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(notification)}
                          className="p-2 text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-300 rounded-lg hover:bg-red-100 transition-colors"
                          title="Delete Notification"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No notifications found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {selectedNotification && (
        <NotificationDetailModal
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
        />
      )}

      {isConfirmModalOpen && (
        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          message={`Are you sure you want to delete this notification? This action cannot be undone.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setIsConfirmModalOpen(false);
            setNotificationToDelete(null);
          }}
        />
      )}
    </div>
  );
}
