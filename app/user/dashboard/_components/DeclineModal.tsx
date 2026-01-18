"use client";

import React, { useState } from "react";
import Modal from "../../../components/Modal";
import { XCircle, Send, X, Calendar } from "lucide-react";

interface DeclineModalProps {
  onClose: () => void;
  onConfirm: (reason: string, proposedStartTime?: string) => void;
  isLoading: boolean;
}

export default function DeclineModal({
  onClose,
  onConfirm,
  isLoading,
}: DeclineModalProps) {
  const [reason, setReason] = useState("");
  const [proposedStartTime, setProposedStartTime] = useState("");
  const [showCounterOffer, setShowCounterOffer] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert("Please provide a reason for declining.");
      return;
    }
    onConfirm(reason.trim(), proposedStartTime || undefined);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-2 bg-red-100 text-red-600 rounded-full">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Decline Booking Request
            </h2>
            <p className="text-sm text-gray-500">
              Tell the renter why you're declining and optionally suggest
              another time.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label
              htmlFor="declineReason"
              className="text-sm font-medium text-gray-700 mb-2"
            >
              Reason for declining:
            </label>
            <textarea
              id="declineReason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="e.g., The device is currently undergoing maintenance."
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm p-3 border"
            ></textarea>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowCounterOffer(!showCounterOffer)}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              {showCounterOffer
                ? "Remove suggested time"
                : "Suggest alternative start time?"}
            </button>

            {showCounterOffer && (
              <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-100 animate-in fade-in slide-in-from-top-2 duration-200">
                <label
                  htmlFor="proposedStartTime"
                  className="block text-sm font-medium text-blue-800 mb-2"
                >
                  When will the device be available?
                </label>
                <input
                  type="datetime-local"
                  id="proposedStartTime"
                  value={proposedStartTime}
                  onChange={(e) => setProposedStartTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="block w-full rounded-md border-blue-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                />
                <p className="mt-2 text-xs text-blue-600">
                  The original duration will be used to calculate the end time.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md"
            >
              <Send className="w-4 h-4" />
              {isLoading ? "Declining..." : "Confirm Decline"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
