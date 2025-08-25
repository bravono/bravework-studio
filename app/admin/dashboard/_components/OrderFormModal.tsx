// app/admin/dashboard/_components/OrderFormModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Order } from "../../../types/app";
import {
  Tag,
  DollarSign,
  Calendar,
  Edit,
  Send,
  User,
  FileText,
} from "lucide-react";
import Modal from "@/app/components/Modal";


interface OrderFormModalProps {
  order?: Order | null; // Null for create, Order object for edit
  onClose: () => void;
  onSave: () => void;
}

export default function OrderFormModal({
  order,
  onClose,
  onSave,
}: OrderFormModalProps) {
  const [formData, setFormData] = useState<Partial<Order>>({
    service: order?.service || "",
    statusName: order?.statusName || "pending",
    amount: order?.amount || 0,
    amountPaid: order?.amountPaid || 0,
    clientId: order?.clientId || "",
    description: order?.description || "",
    dateStarted: order?.dateStarted ? order.dateStarted.split("T")[0] : "", // Format for date input
    dateCompleted: order?.dateCompleted
      ? order.dateCompleted.split("T")[0]
      : "",
    isPortfolio: order?.isPortfolio || false,
    trackingId: order?.trackingId || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (order) {
      setFormData({
        service: order.service,
        statusName: order.statusName,
        amount: order.amount,
        amountPaid: order.amountPaid,
        clientId: order.clientId,
        description: order.description,
        dateStarted: order.dateStarted ? order.dateStarted.split("T")[0] : "",
        dateCompleted: order.dateCompleted
          ? order.dateCompleted.split("T")[0]
          : "",
        isPortfolio: order.isPortfolio,
        trackingId: order.trackingId,
      });
    }
  }, [order]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const method = order ? "PATCH" : "POST";
      const url = order ? `/api/admin/orders/${order.id}` : "/api/admin/orders"; // NEW API ROUTES

      const payload = {
        ...formData,
        // Convert kobo back to cents if storing in kobo on backend
        amount: formData.amount ? Math.round(formData.amount * 100) : 0,
        amountPaid: formData.amountPaid
          ? Math.round(formData.amountPaid * 100)
          : 0,
        // Ensure dates are sent in correct format if needed
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok)
        throw new Error(`Failed to ${order ? "update" : "create"} order.`);

      toast.success(`Order ${order ? "updated" : "created"} successfully!`);
      onSave();
      onClose();
    } catch (err: any) {
      console.error("Error saving order:", err);
      setError(err.message || "Failed to save order.");
      toast.error("Error saving order: " + (err.message || "Unknown error."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={order ? "Edit Order" : "Create New Order"}
    >
      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        <div>
          <label
            htmlFor="service"
            className="flex items-center text-sm font-medium text-gray-700 mb-1"
          >
            <Tag className="h-4 w-4 mr-2" /> Service
          </label>
          <input
            type="text"
            id="service"
            name="service"
            value={formData.service || ""}
            onChange={handleChange}
            required
            className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="clientId"
            className="flex items-center text-sm font-medium text-gray-700 mb-1"
          >
            <User className="h-4 w-4 mr-2" /> Client ID
          </label>
          <input
            type="text"
            id="clientId"
            name="clientId"
            value={formData.clientId || ""}
            onChange={handleChange}
            required
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
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            rows={4}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          ></textarea>
        </div>
        <div>
          <label
            htmlFor="amount"
            className="flex items-center text-sm font-medium text-gray-700 mb-1"
          >
            <DollarSign className="h-4 w-4 mr-2" /> Amount
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount || 0}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="amountPaid"
            className="flex items-center text-sm font-medium text-gray-700 mb-1"
          >
            <DollarSign className="h-4 w-4 mr-2" /> Amount Paid
          </label>
          <input
            type="number"
            id="amountPaid"
            name="amountPaid"
            value={formData.amountPaid || 0}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="statusName"
            className="flex items-center text-sm font-medium text-gray-700 mb-1"
          >
            <Edit className="h-4 w-4 mr-2" /> Status
          </label>
          <select
            id="statusName"
            name="statusName"
            value={formData.statusName || ""}
            onChange={handleChange}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="dateStarted"
            className="flex items-center text-sm font-medium text-gray-700 mb-1"
          >
            <Calendar className="h-4 w-4 mr-2" /> Date Started
          </label>
          <input
            type="date"
            id="dateStarted"
            name="dateStarted"
            value={formData.dateStarted || ""}
            onChange={handleChange}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="dateCompleted"
            className="flex items-center text-sm font-medium text-gray-700 mb-1"
          >
            <Calendar className="h-4 w-4 mr-2" /> Date Completed
          </label>
          <input
            type="date"
            id="dateCompleted"
            name="dateCompleted"
            value={formData.dateCompleted || ""}
            onChange={handleChange}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPortfolio"
            name="isPortfolio"
            checked={formData.isPortfolio || false}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label
            htmlFor="isPortfolio"
            className="ml-2 block text-sm text-gray-900"
          >
            Mark as Portfolio
          </label>
        </div>
        <div>
          <label
            htmlFor="trackingId"
            className="flex items-center text-sm font-medium text-gray-700 mb-1"
          >
            <Send className="h-4 w-4 mr-2" /> Tracking ID
          </label>
          <input
            type="text"
            id="trackingId"
            name="trackingId"
            value={formData.trackingId || ""}
            onChange={handleChange}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
            ) : order ? (
              "Update Order"
            ) : (
              "Create Order"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
