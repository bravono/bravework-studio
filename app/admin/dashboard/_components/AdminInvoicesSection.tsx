"use client";

import React, { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { toast } from "react-toastify"; // Using toast for notifications
import { Invoice } from "@/app/types/app";

// A simple loading spinner component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="w-10 h-10 border-4 border-t-4 border-blue-500 border-opacity-25 rounded-full animate-spin"></div>
    <span className="ml-3 text-gray-500">Loading...</span>
  </div>
);

// A custom confirmation modal component
const ConfirmationModal = ({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-50">
      <div className="p-6 bg-white rounded-lg shadow-xl max-w-sm w-full">
        <p className="mb-4 text-center">{message}</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default function AdminInvoicesSection() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    message: string;
    action: () => void;
  } | null>(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/invoices"); // NEW API ROUTE (GET all invoices)
      if (!res.ok) throw new Error("Failed to fetch invoices.");
      const data: Invoice[] = await res.json();
      setInvoices(data);
    } catch (err: any) {
      console.error("Error fetching invoices:", err);
      setError(err.message || "Failed to load invoices.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleMarkInvoiceAsPaid = async (invoiceId: string) => {
    // Show a custom confirmation modal instead of a native confirm() dialog
    setConfirmModal({
      message: `Are you sure you want to mark invoice ${invoiceId} as Paid?`,
      action: async () => {
        setLoading(true);
        setConfirmModal(null); // Close the modal
        try {
          const res = await fetch(`/api/admin/invoices/${invoiceId}/status`, {
            // NEW API ROUTE (PATCH)
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "Paid" }),
          });
          if (!res.ok) throw new Error("Failed to mark invoice as paid.");

          // Use react-toastify for non-blocking notifications
          toast.success("Invoice marked as paid successfully!");
          fetchInvoices();
        } catch (err: any) {
          console.error("Error marking invoice as paid:", err);
          toast.error(
            "Error marking invoice as paid: " +
              (err.message || "Unknown error.")
          );
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const statusColors = {
    Paid: "bg-green-100 text-green-800",
    Pending: "bg-yellow-100 text-yellow-800",
    Overdue: "bg-red-100 text-red-800",
    Cancelled: "bg-gray-100 text-gray-800",
  };

  if (loading) return <LoadingSpinner />;
  if (error)
    return (
      <div className="p-4 text-center text-red-500 bg-red-100 rounded-lg">
        Error: {error}
      </div>
    );

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Invoices & Payments
      </h2>
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          All Invoices
        </h3>
        {invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full leading-normal table-auto">
              <thead>
                <tr className="text-left text-gray-600 bg-gray-100">
                  <th className="px-5 py-3 border-b-2 border-gray-200">ID</th>
                  <th className="px-5 py-3 border-b-2 border-gray-200">
                    Order ID
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200">
                    Client
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200">
                    Issue Date
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200">
                    Due Date
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200">
                    Amount
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200">Paid</th>
                  <th className="px-5 py-3 border-b-2 border-gray-200">
                    Status
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                      {invoice.id}
                    </td>
                    <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                      {invoice.orderId || "N/A"}
                    </td>
                    <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                      {invoice.clientName || "N/A"}
                    </td>
                    <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                      {format(new Date(invoice.issueDate), "MMM dd, yyyy")}
                    </td>
                    <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                      {format(new Date(invoice.dueDate), "MMM dd, yyyy")}
                    </td>
                    <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                      ${invoice.amount.toLocaleString()}
                    </td>
                    <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                      ${invoice.amountPaid.toLocaleString()}
                    </td>
                    <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          statusColors[invoice.status]
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                      <div className="flex items-center space-x-2">
                        {invoice.status !== "Paid" && (
                          <button
                            onClick={() => handleMarkInvoiceAsPaid(invoice.id)}
                            className="px-3 py-1 text-sm text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors duration-200"
                          >
                            Mark Paid
                          </button>
                        )}
                        {invoice.paymentLink && (
                          <a
                            href={invoice.paymentLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 text-sm text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors duration-200"
                          >
                            View Link
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-4 text-center text-gray-500">No invoices found.</p>
        )}
      </div>
      {confirmModal && (
        <ConfirmationModal
          message={confirmModal.message}
          onConfirm={confirmModal.action}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </div>
  );
}
