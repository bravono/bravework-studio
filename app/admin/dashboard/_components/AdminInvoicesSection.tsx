"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { Search, ExternalLink, CheckCircle } from "lucide-react";
import { Invoice } from "@/app/types/app";
import Pagination from "@/app/components/Pagination";
import ConfirmationModal from "@/app/components/ConfirmationModal";

const ITEMS_PER_PAGE = 10;

export default function AdminInvoicesSection() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/invoices");
      if (!res.ok) throw new Error("Failed to fetch invoices.");
      const data: Invoice[] = await res.json();
      setInvoices(data);
    } catch (err: any) {
      console.error("Error fetching invoices:", err);
      setError(err.message || "Failed to load invoices.");
      toast.error(err.message || "Failed to load invoices.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleMarkInvoiceAsPaid = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmPaid = async () => {
    if (!selectedInvoice) return;

    setLoading(true);
    setIsConfirmModalOpen(false);
    try {
      const res = await fetch(
        `/api/admin/invoices/${selectedInvoice.id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Paid" }),
        },
      );
      if (!res.ok) throw new Error("Failed to mark invoice as paid.");

      toast.success("Invoice marked as paid successfully!");
      fetchInvoices();
    } catch (err: any) {
      console.error("Error marking invoice as paid:", err);
      toast.error(err.message || "Error marking invoice as paid.");
    } finally {
      setLoading(false);
      setSelectedInvoice(null);
    }
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter(
      (invoice) =>
        invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (invoice.clientName || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (invoice.orderId || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
    );
  }, [invoices, searchQuery]);

  const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentInvoices = filteredInvoices.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return (
          <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded-full text-xs font-bold">
            Paid
          </span>
        );
      case "Pending":
        return (
          <span className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 px-2 py-1 rounded-full text-xs font-bold">
            Pending
          </span>
        );
      case "Overdue":
        return (
          <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 px-2 py-1 rounded-full text-xs font-bold">
            Overdue
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300 px-2 py-1 rounded-full text-xs font-bold">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Invoices & Payments
        </h2>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by Invoice ID, Client, or Order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Invoice Info
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Client / Order
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td
                      colSpan={6}
                      className="px-6 py-4 h-16 bg-gray-50/50 dark:bg-gray-800/50"
                    ></td>
                  </tr>
                ))
              ) : currentInvoices.length > 0 ? (
                currentInvoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          #{invoice.id}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {invoice.clientName || "N/A"}
                      </p>
                      <p className="text-xs text-gray-500">
                        Order: {invoice.orderId || "N/A"}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      <p>
                        Issued:{" "}
                        {format(new Date(invoice.issueDate), "MMM dd, yyyy")}
                      </p>
                      <p>
                        Due: {format(new Date(invoice.dueDate), "MMM dd, yyyy")}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                      ₦{invoice.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(invoice.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {invoice.status !== "Paid" && (
                          <button
                            onClick={() => handleMarkInvoiceAsPaid(invoice)}
                            className="p-2 text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-300 rounded-lg hover:bg-green-100 transition-colors"
                            title="Mark as Paid"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        {invoice.paymentLink && (
                          <a
                            href={invoice.paymentLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg hover:bg-blue-100 transition-colors"
                            title="View Payment Link"
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No invoices found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {isConfirmModalOpen && (
        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          message={`Are you sure you want to mark invoice #${selectedInvoice?.id} as Paid?`}
          onConfirm={handleConfirmPaid}
          onCancel={() => {
            setIsConfirmModalOpen(false);
            setSelectedInvoice(null);
          }}
        />
      )}
    </div>
  );
}
