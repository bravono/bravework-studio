"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import {
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  XCircle,
  CheckCircle,
  Clock,
  MoreHorizontal,
} from "lucide-react";
import { Notification, Order } from "@/app/types/app";
import Modal from "./Modal";

// Reusable Loading Spinner component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8 text-gray-500">
    <div className="w-8 h-8 border-4 border-t-4 border-blue-500 border-opacity-25 rounded-full animate-spin"></div>
    <span className="ml-3 font-semibold">Loading...</span>
  </div>
);

// Reusable Custom Modal component to replace alert() and confirm()
const CustomModal = ({
  title,
  message,
  isOpen,
  onClose,
  onConfirm,
  isConfirm = false,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 p-4">
      <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-auto transform transition-all duration-300 scale-95 md:scale-100">
        <h3 className="text-xl font-bold mb-4 text-gray-800">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          {isConfirm && (
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors hover:bg-gray-300"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={() => {
              if (onConfirm) onConfirm();
              onClose();
            }}
            className={`px-6 py-2 rounded-lg font-bold text-white transition-colors
              ${
                isConfirm
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
          >
            {isConfirm ? confirmText : "OK"}
          </button>
        </div>
      </div>
    </div>
  );
};

const NotificationDetailModal = ({ notification, onClose }) => {
  if (!notification) return null;

  const statusColors = {
    accepted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    pending: "bg-yellow-100 text-yellow-800",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-lg w-full mx-auto transform transition-all duration-300 scale-95 md:scale-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            Notification Details
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <XCircle size={24} />
          </button>
        </div>
        <div className="space-y-4 text-gray-700">
          <p>
            <strong>ID:</strong>{" "}
            <span className="font-mono text-sm bg-gray-100 p-1 rounded-md">
              {notification.id}
            </span>
          </p>
          <p>
            <strong>Message:</strong>{" "}
            <span className="bg-gray-100 p-1 rounded-md">
              {notification.message}
            </span>
          </p>
          <p>
            <strong>Offer Amount:</strong>{" "}
            <span className="font-bold text-green-700">
              ₦{(notification.offerAmount / 100).toLocaleString() || notification.budget}
            </span>
          </p>
          <p>
            <strong>Client Name:</strong>{" "}
            <span className="bg-gray-100 p-1 rounded-md">
              {notification.clientName || "N/A"}
            </span>
          </p>
          <p className="flex items-center space-x-2">
            <strong>Status:</strong>
            <span
              className={`px-3 py-1 inline-flex items-center space-x-1 text-xs leading-5 font-semibold rounded-full ${
                statusColors[notification.offerStatus]
              }`}
            >
              {getStatusIcon(notification.offerStatus)}
              <span>{notification.offerStatus}</span>
            </span>
          </p>
          <p>
            <strong>Date:</strong>{" "}
            <span className="bg-gray-100 p-1 rounded-md">
              {format(new Date(notification.createdAt), "MMM d, yyyy")}
            </span>
          </p>
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [notificationsPerPage] = useState(10);

  // Modal state for confirmations
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmModalContent, setConfirmModalContent] = useState({
    title: "",
    message: "",
    onConfirm: () => {},
  });

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

  const handleDeleteNotification = (notification: Notification) => {
    setConfirmModalContent({
      title: "Confirm Deletion",
      message: `Are you sure you want to delete this notification from ${notification.userId}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          const res = await fetch(
            `/api/admin/notifications/${notification.id}`,
            {
              method: "DELETE",
            }
          );
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Failed to delete notification");
          }
          toast.success("Notification deleted successfully!");
          fetchNotifications(); // Refresh the list
        } catch (error: any) {
          toast.error(error.message);
        }
      },
    });
    setIsConfirmModalOpen(true);
  };

  const handleViewNotification = (notification: Notification) => {
    setSelectedNotification(notification);
  };

  // Pagination logic
  const indexOfLastNotification = currentPage * notificationsPerPage;
  const indexOfFirstNotification =
    indexOfLastNotification - notificationsPerPage;
  const currentNotifications = useMemo(
    () =>
      notifications.slice(indexOfFirstNotification, indexOfLastNotification),
    [notifications, indexOfFirstNotification, indexOfLastNotification]
  );
  const totalPages = Math.ceil(notifications.length / notificationsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const renderPaginationButtons = () => {
    if (totalPages <= 1) return null;
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    return (
      <nav className="flex justify-center mt-6">
        <ul className="flex items-center space-x-2">
          <li>
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
          </li>
          {pageNumbers.map((number) => (
            <li key={number}>
              <button
                onClick={() => paginate(number)}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  currentPage === number
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {number}
              </button>
            </li>
          ))}
          <li>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-md text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  const statusColors = {
    accepted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    pending: "bg-yellow-100 text-yellow-800",
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 border-b-2 border-gray-200 pb-2">
          Notifications Management
        </h2>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            All Notifications
          </h3>
          {currentNotifications.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Notification ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Offer Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentNotifications.map((notification) => (
                    <tr
                      key={notification.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {notification.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {notification.message}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        ₦{(notification.offerAmount / kobo).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {notification.userId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {format(
                          new Date(notification.createdAt),
                          "MMM d, yyyy"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            statusColors[notification.offerStatus]
                          }`}
                        >
                          {notification.offerStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleViewNotification(notification)}
                            className="p-2 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                            title="View Notification"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteNotification(notification)
                            }
                            className="p-2 text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                            title="Delete Notification"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="p-4 text-center text-gray-500">
              No notifications found.
            </p>
          )}
          {renderPaginationButtons()}
        </div>
      </div>
      <Modal
        title={confirmModalContent.title}
        message={confirmModalContent.message}
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={() => {
          confirmModalContent.onConfirm();
          setIsConfirmModalOpen(false);
        }}
        isConfirm={true}
        confirmText="Delete"
        cancelText="Cancel"
        children
      />
      {selectedNotification && (
        <NotificationDetailModal
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
        />
      )}
    </div>
  );
}
