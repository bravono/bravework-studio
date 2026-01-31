"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { PlusCircle, Edit, Trash2, Search } from "lucide-react";

import ConfirmationModal from "@/app/components/ConfirmationModal";
import CustomOfferModal from "./CustomOfferModal";
import { CustomOffer, Order } from "@/app/types/app";
import Pagination from "@/app/components/Pagination";

// Main CustomOffersTab component
export default function AdminCustomOffersSection() {
  const [offers, setOffers] = useState<CustomOffer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<CustomOffer | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const offersPerPage = 10;

  // State for delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState<string | null>(null);

  const fetchOffers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/custom-offers");
      if (!res.ok) {
        throw new Error("Failed to fetch custom offers");
      }
      const data = await res.json();
      setOffers(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/orders");
      if (!res.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await res.json();
      setOrders(data);
    } catch (error: any) {
      toast.error(error.message);
    }
  }, []);

  useEffect(() => {
    fetchOffers();
    fetchOrders();
  }, [fetchOffers, fetchOrders]);

  const handleCreateOffer = () => {
    setSelectedOffer(null);
    setIsModalOpen(true);
  };

  const handleEditOffer = (offer: CustomOffer) => {
    setSelectedOffer(offer);
    setIsModalOpen(true);
  };

  const handleDeleteOfferClick = (offerId: string) => {
    setOfferToDelete(offerId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteOfferConfirm = async () => {
    if (!offerToDelete) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/custom-offers/${offerToDelete}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete custom offer");
      }
      toast.success("Custom offer deleted successfully!");
      fetchOffers();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
      setIsDeleteModalOpen(false);
      setOfferToDelete(null);
    }
  };

  const handleSaveOffer = async (formData: any) => {
    try {
      const method = selectedOffer ? "PUT" : "POST";
      const url = selectedOffer
        ? `/api/admin/custom-offers/${selectedOffer.id}`
        : "/api/admin/custom-offers";
      const body = JSON.stringify(formData);

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save custom offer");
      }

      toast.success(
        `Custom offer ${selectedOffer ? "updated" : "created"} successfully!`,
      );
      setIsModalOpen(false);
      fetchOffers();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredOffers = useMemo(() => {
    return offers.filter(
      (offer) =>
        offer.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (offer.orderId || "").toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [offers, searchQuery]);

  const indexOfLastOffer = currentPage * offersPerPage;
  const indexOfFirstOffer = indexOfLastOffer - offersPerPage;
  const currentOffers = filteredOffers.slice(
    indexOfFirstOffer,
    indexOfLastOffer,
  );
  const totalPages = Math.ceil(filteredOffers.length / offersPerPage);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 px-2 py-1 rounded-full text-xs font-bold capitalize">
            Pending
          </span>
        );
      case "accepted":
        return (
          <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded-full text-xs font-bold capitalize">
            Accepted
          </span>
        );
      case "rejected":
        return (
          <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 px-2 py-1 rounded-full text-xs font-bold capitalize">
            Rejected
          </span>
        );
      case "expired":
        return (
          <span className="bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300 px-2 py-1 rounded-full text-xs font-bold capitalize">
            Expired
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300 px-2 py-1 rounded-full text-xs font-bold capitalize">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Custom Offers
        </h2>
        <button
          onClick={handleCreateOffer}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all font-bold text-sm"
        >
          <PlusCircle size={20} />
          Create New Offer
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by Offer ID or Order ID..."
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
                  Offer Info
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Timeline
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
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td
                      colSpan={5}
                      className="px-6 py-4 h-16 bg-gray-50/50 dark:bg-gray-800/50"
                    ></td>
                  </tr>
                ))
              ) : currentOffers.length > 0 ? (
                currentOffers.map((offer) => (
                  <tr
                    key={offer.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        #{offer.id}
                      </p>
                      <p className="text-xs text-gray-500">
                        Order: {offer.orderId || "N/A"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        ₦{(offer.offerAmount / 100).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      <p>
                        Created:{" "}
                        {format(new Date(offer.createdAt), "MMM d, yyyy")}
                      </p>
                      <p>
                        Expires:{" "}
                        {offer.expiresAt
                          ? format(new Date(offer.expiresAt), "MMM d, yyyy")
                          : "N/A"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(offer.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditOffer(offer)}
                          className="p-2 text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg hover:bg-blue-100 transition-colors"
                          title="Edit Offer"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteOfferClick(offer.id)}
                          className="p-2 text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-300 rounded-lg hover:bg-red-100 transition-colors"
                          title="Delete Offer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No custom offers found matching the criteria.
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

      {/* Modals */}
      {isModalOpen && (
        <CustomOfferModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          offer={selectedOffer}
          onSave={handleSaveOffer}
          orders={orders}
        />
      )}

      {isDeleteModalOpen && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onCancel={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteOfferConfirm}
          message={`Are you sure you want to delete offer ID: ${offerToDelete}? This action cannot be undone.`}
        />
      )}
    </div>
  );
}
