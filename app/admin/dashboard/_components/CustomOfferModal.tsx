// app/admin/dashboard/_components/CustomOfferModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/app/components/Modal";
import ConfirmationModal from "@/app/components/ConfirmationModal";
import { CustomOfferModalProps } from "@/app/types/app"; // Adjust the import path as necessary
import { cn } from "@/lib/utils/cn";
import { format } from "date-fns";

const CustomOfferModal = ({
  isOpen,
  onClose,
  offer,
  onSave,
  orders,
}: CustomOfferModalProps) => {
  const [formData, setFormData] = useState({
    order_id: offer?.orderId || "",
    offer_amount_in_kobo: offer?.offerAmount || 0,
    description: offer?.description || "",
    expires_at: offer?.expiresAt
      ? format(new Date(offer.expiresAt), "yyyy-MM-dd")
      : "",
    user_id: offer?.userId || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  useEffect(() => {
    if (offer) {
      setFormData({
        order_id: offer.orderId,
        offer_amount_in_kobo: offer.offerAmount,
        description: offer.description,
        expires_at: offer.expiresAt
          ? format(new Date(offer.expiresAt), "yyyy-MM-dd")
          : "",
        user_id: offer.userId,
      });
    } else {
      setFormData({
        order_id: "",
        offer_amount_in_kobo: 0,
        description: "",
        expires_at: "",
        user_id: "",
      });
    }
  }, [offer]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await onSave(formData);
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal
        isOpen={true}
        onClose={onClose}
        title={offer ? "Edit Custom Offer" : "Create New Custom Offer"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-gray-700">Order</span>
            <select
              name="order_id"
              value={formData.order_id}
              onChange={handleChange}
              disabled={!!offer}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 disabled:bg-gray-100 p-2"
            >
              <option value="">Select an Order</option>
              {orders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.description} (ID: {order.id})
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-gray-700">Offer Amount (in kobo)</span>
            <input
              type="number"
              name="offer_amount_in_kobo"
              value={formData.offer_amount_in_kobo}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2"
            />
          </label>
          <label className="block">
            <span className="text-gray-700">Description</span>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2"
            />
          </label>
          <label className="block">
            <span className="text-gray-700">Expires At</span>
            <input
              type="date"
              name="expires_at"
              value={formData.expires_at}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2"
            />
          </label>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={() => setIsConfirmationOpen(true)}
              className={cn(
                "px-4 py-2 rounded-md text-white font-semibold transition-colors",
                isLoading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              )}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </Modal>
      <ConfirmationModal
        isOpen={isConfirmationOpen} // Only show on success
        message={`Successfully ${offer ? "updated" : "created"} Offer`}
        onCancel={() => setIsConfirmationOpen(false)}
        onConfirm={() => setIsConfirmationOpen(false)}
      />
    </>
  );
};

export default CustomOfferModal;
