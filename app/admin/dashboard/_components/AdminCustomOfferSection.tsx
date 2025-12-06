"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import {
  PlusCircle,
  Edit,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

import Loader from "@/app/components/Loader";
import ConfirmationModal from "@/app/components/ConfirmationModal";
import CustomOfferModal from "./CustomOfferModal";
import { CustomOffer, Order } from "@/app/types/app";
import { cn } from "@/lib/utils/cn";

// Main CustomOffersTab component
export default function AdminCustomOffersSection() {
  const [offers, setOffers] = useState<CustomOffer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<CustomOffer | null>(null);

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
      console.log("Custom Offer", data);

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

  // Pagination logic
  const indexOfLastOffer = currentPage * offersPerPage;
  const indexOfFirstOffer = indexOfLastOffer - offersPerPage;
  const currentOffers = useMemo(
    () => offers.slice(indexOfFirstOffer, indexOfLastOffer),
    [offers, indexOfFirstOffer, indexOfLastOffer]
  );
  const totalPages = Math.ceil(offers.length / offersPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

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
        `Custom offer ${selectedOffer ? "updated" : "created"} successfully!`
      );
      setIsModalOpen(false);
      fetchOffers();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (isLoading) {
    return <Loader user={"admin"} />;
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 bg-gray-100 rounded-xl shadow-lg">
      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          Custom Offers Management
        </h2>
        <button
          onClick={handleCreateOffer}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors font-semibold"
        >
          <PlusCircle size={20} className="mr-2" />
          Create New Offer
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-inner">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Offer ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expires
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentOffers.length > 0 ? (
              currentOffers.map((offer) => (
                <tr
                  key={offer.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {offer.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {offer.orderId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₦{(offer.offerAmount / 100).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={cn(
                        "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                        offer.status === "pending" &&
                          "bg-yellow-100 text-yellow-800",
                        offer.status === "accepted" &&
                          "bg-green-100 text-green-800",
                        offer.status === "rejected" &&
                          "bg-red-100 text-red-800",
                        offer.status === "expired" &&
                          "bg-gray-100 text-gray-800"
                      )}
                    >
                      {offer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(offer.createdAt), "MMM d, yyyy")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {offer.expiresAt
                      ? format(new Date(offer.expiresAt), "MMM d, yyyy")
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditOffer(offer)}
                      className="text-blue-600 hover:text-blue-900 transition-colors mr-3"
                      title="Edit Offer"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteOfferClick(offer.id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                      title="Delete Offer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  No custom offers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index + 1)}
              className={cn(
                "px-4 py-2 rounded-md font-semibold transition-colors",
                currentPage === index + 1
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              )}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Modals */}
      <CustomOfferModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        offer={selectedOffer}
        onSave={handleSaveOffer}
        orders={orders}
      />
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteOfferConfirm}
        message={`Are you sure you want to delete offer ID: ${offerToDelete}? This action cannot be undone.`}
      />
    </div>
  );
}
