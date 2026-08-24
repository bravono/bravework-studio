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
  initialOrderId,
}: CustomOfferModalProps) => {
  const initialSelectedOrderId = offer?.orderId || (initialOrderId ? String(initialOrderId) : "");
  const initialOrderObj = orders.find((o) => String(o.id) === String(initialSelectedOrderId));

  const [formData, setFormData] = useState({
    order_id: initialSelectedOrderId,
    offer_amount_in_kobo: offer?.offerAmount ? offer.offerAmount / 100 : 0,
    description: offer?.description || "",
    expires_at: offer?.expiresAt
      ? format(new Date(offer.expiresAt), "yyyy-MM-dd")
      : "",
    user_id: offer?.userId || initialOrderObj?.clientId || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  useEffect(() => {
    if (offer) {
      setFormData({
        order_id: String(offer.orderId),
        offer_amount_in_kobo: offer.offerAmount ? offer.offerAmount / 100 : 0,
        description: offer.description,
        expires_at: offer.expiresAt
          ? format(new Date(offer.expiresAt), "yyyy-MM-dd")
          : "",
        user_id: String(offer.userId),
      });
    } else if (initialOrderId) {
      const orderObj = orders.find((o) => String(o.id) === String(initialOrderId));
      setFormData({
        order_id: String(initialOrderId),
        offer_amount_in_kobo: 0,
        description: "",
        expires_at: "",
        user_id: orderObj?.clientId ? String(orderObj.clientId) : "",
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
  }, [offer, initialOrderId, orders]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === "order_id") {
      const matchedOrder = orders.find((o) => String(o.id) === String(value));
      setFormData((prev) => ({
        ...prev,
        order_id: value,
        user_id: matchedOrder?.clientId ? String(matchedOrder.clientId) : prev.user_id,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Convert dollar input to kobo/cents for backend storage
    const submissionData = {
      ...formData,
      offer_amount_in_kobo: Math.round(Number(formData.offer_amount_in_kobo) * 100),
    };
    await onSave(submissionData);
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
            <span className="text-gray-700 font-medium">Order</span>
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
                  {order.serviceName || order.description || `Order #${order.id}`} (ID: #{order.id})
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-gray-700 font-medium">Offer Amount in USD ($)</span>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 font-bold">
                $
              </span>
              <input
                type="number"
                name="offer_amount_in_kobo"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.offer_amount_in_kobo || ""}
                onChange={handleChange}
                required
                className="pl-8 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2"
              />
            </div>
          </label>
          <label className="block">
            <span className="text-gray-700 font-medium">Description & Scope</span>
            <textarea
              name="description"
              placeholder="Describe deliverables, milestones, and scope of work..."
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2"
            />
          </label>
          <label className="block">
            <span className="text-gray-700 font-medium">Expires At</span>
            <input
              type="date"
              name="expires_at"
              value={formData.expires_at}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2"
            />
          </label>
          <div className="flex justify-end space-x-2 pt-2">
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
              className={cn(
                "px-4 py-2 rounded-md text-white font-semibold transition-colors",
                isLoading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              )}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Custom Offer"}
            </button>
          </div>
        </form>
      </Modal>
      <ConfirmationModal
        isOpen={isConfirmationOpen}
        message={`Successfully ${offer ? "updated" : "created"} Offer`}
        onCancel={() => setIsConfirmationOpen(false)}
        onConfirm={() => setIsConfirmationOpen(false)}
      />
    </>
  );
};

export default CustomOfferModal;
