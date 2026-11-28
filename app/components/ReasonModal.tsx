"use client";

import React, { useState } from "react";
import Modal from "./Modal";

interface ReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title: string;
  placeholder?: string;
  confirmText?: string;
  isLoading?: boolean;
}

export default function ReasonModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  placeholder = "Enter reason here...",
  confirmText = "Confirm",
  isLoading = false,
}: ReasonModalProps) {
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onConfirm(reason);
      setReason("");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={placeholder}
            required
            rows={4}
            className="w-full rounded-xl border-gray-200 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-3 border resize-none"
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !reason.trim()}
            className="px-6 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-lg shadow-green-200 disabled:opacity-50 disabled:shadow-none transition-all"
          >
            {isLoading ? "Processing..." : confirmText}
          </button>
        </div>
      </form>
    </Modal>
  );
}
