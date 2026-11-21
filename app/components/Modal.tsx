"use client";

import React from "react";
import { XCircle } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  isConfirm?: boolean;
  confirmText?: string;
  cancelText?: string;
  title: string;
  message?: string;
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-lg",
  className = "",
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] max-h-[100vh] overflow-y-auto flex items-center justify-center bg-gray-900 bg-opacity-50 p-2 sm:p-4 transition-opacity duration-300">
      {/* The modal content is the main container for the modal's body.
          We stop propagation here so clicks inside the modal don't close it. */}
      <div
        className={`relative w-full ${maxWidth} rounded-2xl bg-white p-4 sm:p-6 shadow-2xl transform transition-transform duration-300 ease-out scale-95 animate-scale-up max-h-[94vh] sm:max-h-[90vh] overflow-y-auto ${className}`.trim()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b pb-3 sm:pb-4 mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">{title}</h2>
          {/* Close button with Lucide-React icon and hover effects */}
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-gray-400 rounded-full hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <XCircle size={22} className="sm:w-6 sm:h-6" />
          </button>
        </div>
        {/* Modal Body */}
        <div className="modal-body text-gray-700">{children}</div>
      </div>
    </div>
  );
}
