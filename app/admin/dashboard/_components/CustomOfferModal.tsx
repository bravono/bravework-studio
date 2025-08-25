// app/admin/dashboard/_components/CustomOfferModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Order, CustomOffer } from "../../../types/app"; // Adjust the import path as necessary
import { DollarSign, Clock, FileText, Calendar } from "lucide-react";
import Modal from "@/app/components/Modal";


interface CustomOfferModalProps {
  order: Order; // The order for which to create the offer
  onClose: () => void;
  onSave: () => void; // Callback to re-fetch data after save
  existingOffer?: CustomOffer; // Optional: if editing an existing offer
}

// Helper function to format date for datetime-local input
function formatDateForInput(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const yyyy = date.getFullYear();
  const MM = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
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
  const [projectDuration, setProjectDuration] = useState<number>(
    existingOffer?.projectDuration || 0
  );
  const [description, setDescription] = useState<string>(
    existingOffer?.description || ""
  );
  const [expiresAt, setExpireAt] = useState<string>(
    existingOffer?.expiresAt
      ? formatDateForInput(new Date(existingOffer.expiresAt))
      : formatDateForInput(new Date())
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const method = existingOffer ? "PATCH" : "POST";
      const url = existingOffer
        ? `/api/admin/custom-offers/${existingOffer.id}`
        : "/api/admin/custom-offers";
      const body = {
        orderId: order.id,
        userId: order.clientId, // User associated with the order
        offerAmount,
        description,
        expiresAt,
        projectDuration,
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
      onClose(); // Close the modal
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

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={existingOffer ? "Edit Custom Offer" : "Create Custom Offer"}
    >
      {
        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          <div>
            <label
              htmlFor="offerAmount"
              className="flex items-center text-sm font-medium text-gray-700 mb-1"
            >
              <DollarSign className="h-4 w-4 mr-2" /> Offer Amount
            </label>
            <input
              type="number"
              id="offerAmount"
              value={offerAmount}
              onChange={(e) => setOfferAmount(parseFloat(e.target.value))}
              required
              min="0"
              step="0.01"
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="projectDuration"
              className="flex items-center text-sm font-medium text-gray-700 mb-1"
            >
              <Clock className="h-4 w-4 mr-2" /> Project Duration Days
            </label>
            <input
              type="number"
              id="projectDuration"
              value={projectDuration}
              onChange={(e) => setProjectDuration(parseFloat(e.target.value))}
              required
              min="1"
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className="flex items-center text-sm font-medium text-gray-700 mb-1"
            >
              <FileText className="h-4 w-4 mr-2" /> Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            ></textarea>
          </div>
          <div>
            <label
              htmlFor="expiration"
              className="flex items-center text-sm font-medium text-gray-700 mb-1"
            >
              <Calendar className="h-4 w-4 mr-2" /> Expiration Date
            </label>
            <input
              type="datetime-local"
              id="expiration"
              value={expiresAt}
              onChange={(e) => setExpireAt(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
              min={formatDateForInput(tomorrow)}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-t-2 border-white border-opacity-25 rounded-full animate-spin"></div>
              ) : existingOffer ? (
                "Update Offer"
              ) : (
                "Create Offer"
              )}
            </button>
          </div>
        </form>
      }
    </Modal>
  );
}

// Modal for creating/updating offers
// export default function CustomOfferModal({
//   isOpen,
//   onClose,
//   offer,
//   onSave,
//   orders,
// }: {
//   isOpen: boolean;
//   onClose: () => void;
//   offer: CustomOffer | null;
//   onSave: (data: any) => void;
//   orders: Order[];
// }){
//   const [formData, setFormData] = useState({
//     order_id: offer?.orderId || "",
//     offer_amount_in_kobo: offer?.offerAmount || 0,
//     description: offer?.description || "",
//     expires_at: offer?.expiresAt
//       ? format(new Date(offer.expiresAt), "yyyy-MM-dd")
//       : "",
//     user_id: offer?.userId || "",
//   });
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     if (offer) {
//       setFormData({
//         order_id: offer.orderId,
//         offer_amount_in_kobo: offer.offerAmount,
//         description: offer.description,
//         expires_at: offer.expiresAt
//           ? format(new Date(offer.expiresAt), "yyyy-MM-dd")
//           : "",
//         user_id: offer.userId,
//       });
//     } else {
//       setFormData({
//         order_id: "",
//         offer_amount_in_kobo: 0,
//         description: "",
//         expires_at: "",
//         user_id: "",
//       });
//     }
//   }, [offer]);
