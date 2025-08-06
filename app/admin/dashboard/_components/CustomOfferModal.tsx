// app/admin/dashboard/_components/CustomOfferModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import Modal from "./Modal"; // Import the generic Modal component
import { toast } from "react-toastify";

// Re-import types
interface Order {
  id: string;
  clientId: string;
  clientName?: string;
}

interface CustomOffer {
  id: string;
  orderId: string;
  userId: string;
  offerAmount: number;
  description: string;
  createdAt: string;
  status: "Pending" | "Accepted" | "Rejected" | "Expired";
}

interface CustomOfferModalProps {
  order: Order; // The order for which to create the offer
  onClose: () => void;
  onSave: () => void; // Callback to re-fetch data after save
  existingOffer?: CustomOffer; // Optional: if editing an existing offer
}

export default function CustomOfferModal({
  order,
  onClose,
  onSave,
  existingOffer,
}: CustomOfferModalProps) {
  const [offerAmount, setOfferAmount] = useState<number>(
    existingOffer?.offerAmount || 0
  );
  const [description, setDescription] = useState<string>(
    existingOffer?.description || ""
  );
  const [expiresAt, setExpireAt] = useState<string>(
    formatDateForInput(new Date())
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const method = existingOffer ? "PATCH" : "POST";
      const url = existingOffer
        ? `/api/admin/custom-offers/${existingOffer.id}`
        : "/api/admin/custom-offers"; // NEW API ROUTES
      const body = {
        orderId: order.id,
        userId: order.clientId, // User associated with the order
        offerAmount,
        description,
        expiresAt,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok)
        throw new Error(
          `Failed to ${existingOffer ? "update" : "create"} custom offer.`
        );

      toast.success(
        `Custom offer ${existingOffer ? "updated" : "created"} successfully!`
      );
      onSave(); // Trigger data re-fetch in parent
    } catch (err: any) {
      console.error("Error saving custom offer:", err);
      setError(err.message || "Failed to save custom offer.");
      toast.error(
        "Error saving custom offer: " + (err.message || "Unknown error.")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { console.log('Expired At Frontend:', expiresAt) }, [expiresAt])

  function formatDateForInput(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, "0");

    const yyyy = date.getFullYear();
    const MM = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const mm = pad(date.getMinutes());

    return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={
        existingOffer
          ? "Edit Custom Offer"
          : `Create Custom Offer for Order ${order.id}`
      }
    >
      <form onSubmit={handleSubmit} className="modal-form">
        <div className="form-group">
          <label htmlFor="offerAmount">Offer Amount Kobo (₦)</label>
          <input
            type="number"
            id="offerAmount"
            value={offerAmount}
            onChange={(e) => setOfferAmount(parseFloat(e.target.value))}
            required
            min="0"
            step="0.01"
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="form-textarea"
          ></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="expiration">Expiration Date</label>
          <input
            type="datetime-local"
            id="expiration"
            value={expiresAt}
            onChange={(e) => setExpireAt(e.target.value)}
            className="form-input"
            required
            min={formatDateForInput(new Date())}
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" disabled={loading} className="form-submit-button">
          {loading
            ? "Saving..."
            : existingOffer
            ? "Update Offer"
            : "Create Offer"}
        </button>
      </form>
    </Modal>
  );
}
