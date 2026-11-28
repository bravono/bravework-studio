"use client";

import React from "react";
import { Calendar, DollarSign, FileText, User, Tag, Clock, AlertTriangle } from "lucide-react";
import Modal from "@/app/components/Modal";
import { CustomOffer } from "@/app/types/app";
import { format } from "date-fns";

interface CustomOfferPreviewModalProps {
  offer: CustomOffer | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
}

export default function CustomOfferPreviewModal({
  offer,
  isOpen,
  onClose,
  onEdit,
}: CustomOfferPreviewModalProps) {
  if (!isOpen || !offer) return null;

  const kobo = 100;
  const formattedDate = offer.createdAt
    ? format(new Date(offer.createdAt), "PPP")
    : "N/A";
  const formattedExpiry = offer.expiresAt
    ? format(new Date(offer.expiresAt), "PPP")
    : "N/A";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return (
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
            Accepted
          </span>
        );
      case "pending":
        return (
          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">
            Pending
          </span>
        );
      case "rejected":
        return (
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
            Rejected
          </span>
        );
      case "expired":
        return (
          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">
            Expired
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">
            {status}
          </span>
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Custom Offer Details Preview">
      <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
        {/* Header Title and Status */}
        <div className="flex justify-between items-start border-b border-gray-100 pb-4">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Custom Offer
            </span>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white capitalize">
              For Order #{offer.orderId}
            </h3>
            <p className="text-xs text-gray-500 mt-1">Offer ID: #{offer.id}</p>
          </div>
          <div>{getStatusBadge(offer.status || "pending")}</div>
        </div>

        {/* Pricing/Financial Specs */}
        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-850 text-center">
          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block mb-1">
            Offer Amount
          </span>
          <p className="text-2xl font-black text-indigo-750 dark:text-indigo-400">
            ${(offer.offerAmount / kobo).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* Specifications Table / Details Grid */}
        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 space-y-3">
          <h4 className="text-xs font-bold text-gray-450 uppercase tracking-wider">
            Offer Info & Config
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User size={16} className="text-indigo-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  Client ID: {offer.userId || "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-indigo-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  Created: {formattedDate}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-indigo-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  Expires: {formattedExpiry}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Offer Details
          </h4>
          <p className="text-sm text-gray-650 leading-relaxed bg-gray-50 dark:bg-gray-900/30 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
            {offer.description || "No description provided."}
          </p>
        </div>

        {/* Rejection Reason if any */}
        {offer.status === "rejected" && offer.rejectionReason && (
          <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-xl border border-red-100 dark:border-red-900/30 flex items-start gap-2.5">
            <AlertTriangle className="text-red-500 mt-0.5 shrink-0" size={16} />
            <div>
              <h5 className="text-xs font-bold text-red-700 dark:text-red-400 uppercase">Rejection Reason</h5>
              <p className="text-sm text-red-650 dark:text-red-300/80 mt-1 leading-relaxed">{offer.rejectionReason}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all"
            >
              Edit Offer
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
