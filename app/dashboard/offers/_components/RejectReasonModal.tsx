// app/dashboard/offers/_components/RejectReasonModal.tsx
'use client';

import React, { useState } from 'react';
import Modal from '../../../admin/dashboard/_components/Modal'; 

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
    <Modal isOpen={true} onClose={onClose} title="Reason for Rejection">
      <form onSubmit={handleSubmit} className="modal-form">
        <div className="form-group">
          <label htmlFor="rejectionReason">Please tell us why you are rejecting this offer:</label>
          <textarea
            id="rejectionReason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={5}
            placeholder="e.g., Budget too high, timeline too short, service not what I need..."
            required
            className="form-textarea"
          ></textarea>
        </div>
        <div className="modal-actions">
          <button type="button" onClick={onClose} className="cancel-button" disabled={isLoading}>
            Cancel
          </button>
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Submit Rejection'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
