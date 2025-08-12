'use client';

import React from 'react';
import { XCircle } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  isConfirm?: boolean;
  confirmText?: string;
  cancelText?: string;
  title: string;
  message?: string;
  children: React.ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
}: ModalProps) {
  // If the modal is not open, we return null to render nothing.
  if (!isOpen) return null;

  // The modal overlay is a fixed container that covers the whole screen
  // and has a semi-transparent dark background.
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900 bg-opacity-50 p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      {/* The modal content is the main container for the modal's body.
          We stop propagation here so clicks inside the modal don't close it. */}
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl transform transition-transform duration-300 ease-out scale-95 opacity-0 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          {/* Close button with Lucide-React icon and hover effects */}
          <button
            onClick={onClose}
            className="p-2 text-gray-400 rounded-full hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <XCircle size={24} />
          </button>
        </div>
        {/* Modal Body */}
        <div className="modal-body text-gray-700">{children}</div>
      </div>
    </div>
  );
}
