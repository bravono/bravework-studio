'use client';

import React, { useState } from 'react';
import Modal from '../../../../admin/dashboard/_components/Modal';
import { XCircle, Send, X } from 'lucide-react';

interface RejectReasonModalProps {
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading: boolean;
}

export default function RejectReasonModal({ onClose, onConfirm, isLoading }: RejectReasonModalProps) {
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onConfirm(reason.trim());
    } else {
      alert('Please provide a reason for rejection.');
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-2 bg-red-100 text-red-600 rounded-full">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Reason for Rejection</h2>
            <p className="text-sm text-gray-500">Provide a reason to help the sender improve their offers.</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label htmlFor="rejectionReason" className="text-sm font-medium text-gray-700 mb-2">
              Please tell us why you are rejecting this offer:
            </label>
            <textarea
              id="rejectionReason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={5}
              placeholder="e.g., Budget is too high, timeline is too short, or the service doesn't meet my needs."
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm p-3 transition-colors duration-200"
            ></textarea>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
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
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              {isLoading ? 'Submitting...' : 'Submit Rejection'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}