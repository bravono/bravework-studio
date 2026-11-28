"use client";

import React from "react";
import { X, Calendar, DollarSign, User, FileText, Send, Tag, CheckSquare, Clock } from "lucide-react";
import Modal from "@/app/components/Modal";
import { Order } from "@/app/types/app";
import { format } from "date-fns";

interface OrderPreviewModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
}

export default function OrderPreviewModal({
  order,
  isOpen,
  onClose,
  onEdit,
}: OrderPreviewModalProps) {
  if (!isOpen || !order) return null;

  const kobo = 100;
  const formattedDate = order.date
    ? format(new Date(order.date), "PPP")
    : "N/A";
  const formattedStartDate = order.dateStarted
    ? format(new Date(order.dateStarted), "PPP")
    : "N/A";
  const formattedEndDate = order.dateCompleted
    ? format(new Date(order.dateCompleted), "PPP")
    : "N/A";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 px-3 py-1 rounded-full text-xs font-bold">
            Paid
          </span>
        );
      case "pending":
        return (
          <span className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 px-3 py-1 rounded-full text-xs font-bold">
            Pending
          </span>
        );
      case "partially_paid":
        return (
          <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold">
            Partial
          </span>
        );
      case "expired":
        return (
          <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 px-3 py-1 rounded-full text-xs font-bold">
            Expired
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-bold">
            {status}
          </span>
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Order Details Preview">
      <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
        {/* Header Title and Status */}
        <div className="flex justify-between items-start border-b border-gray-100 pb-4">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Service
            </span>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white capitalize">
              {order.serviceName || order.service || "Unnamed Service"}
            </h3>
            <p className="text-xs text-gray-500 mt-1">Order ID: #{order.id}</p>
          </div>
          <div>{getStatusBadge(order.status || "pending")}</div>
        </div>

        {/* Pricing/Financial Specs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 text-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Total Budget
            </span>
            <p className="text-xl font-black text-gray-900 dark:text-white">
              ₦{(order.amount / kobo).toLocaleString()}
            </p>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800 text-center">
            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block mb-1">
              Amount Paid
            </span>
            <p className="text-xl font-black text-indigo-650 dark:text-indigo-400">
              ₦{(order.amountPaid / kobo).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Specs Table / Details Grid */}
        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 space-y-3">
          <h4 className="text-xs font-bold text-gray-450 uppercase tracking-wider">
            Order Metadata
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User size={16} className="text-indigo-500" />
                <span className="text-gray-700 dark:text-gray-300 truncate">
                  Client ID: {order.clientId || "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-indigo-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  Created: {formattedDate}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-indigo-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  Started: {formattedStartDate}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-indigo-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  Completed: {formattedEndDate}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Send size={16} className="text-indigo-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  Tracking ID: {order.trackingId || "None"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckSquare size={16} className={order.isPortfolio ? "text-green-500" : "text-gray-400"} />
                <span className="text-gray-700 dark:text-gray-300">
                  Showcase in Portfolio: {order.isPortfolio ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Project Description
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-gray-900/30 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
            {order.description || "No description provided."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all"
            >
              Edit Order
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-all"
          >
            Close Details
          </button>
        </div>
      </div>
    </Modal>
  );
}
