"use client";

import React, { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import {
  CheckCircle,
  XCircle,
  RefreshCcw,
  Eye,
  Search,
  Filter,
} from "lucide-react";
import Pagination from "../../../components/Pagination";
import ConfirmationModal from "@/app/components/ConfirmationModal";
import Image from "next/image";

const ITEMS_PER_PAGE = 10;

interface RentalImage {
  file_name: string;
  file_size: number;
  file_url: string;
}

interface AdminRental {
  id: number;
  userId: number;
  deviceType: string;
  deviceName: string;
  description: string;
  specs: string;
  hourlyRate: number;
  locationCity: string;
  locationAddress: string;
  locationLat: string;
  locationLng: string;
  hasInternet: boolean;
  hasBackupPower: boolean;
  approvalStatus: "pending" | "approved" | "rejected";
  createdAt: string;
  deletedAt: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  images: RentalImage[] | null;
}

export default function AdminRentalsSection() {
  const [rentals, setRentals] = useState<AdminRental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("pending"); // pending, approved, rejected, deleted, all
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedRental, setSelectedRental] = useState<AdminRental | null>(
    null
  );
  const [actionType, setActionType] = useState<
    "approve" | "reject" | "restore" | null
  >(null);

  const fetchRentals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/rentals?filter=${filter}`);
      if (!res.ok) throw new Error("Failed to fetch rentals.");
      const data: AdminRental[] = await res.json();
      setRentals(data);
      setCurrentPage(1);
    } catch (err: any) {
      console.error("Error fetching rentals:", err);
      setError(err.message || "Failed to load rentals.");
      toast.error(err.message || "Failed to load rentals.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchRentals();
  }, [fetchRentals]);

  const handleActionClick = (
    rental: AdminRental,
    type: "approve" | "reject" | "restore"
  ) => {
    setSelectedRental(rental);
    setActionType(type);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedRental || !actionType) return;

    setLoading(true);
    setIsConfirmModalOpen(false);
    try {
      let url = "";
      let method = "POST";
      let body = null;

      if (actionType === "restore") {
        url = `/api/admin/rentals/${selectedRental.id}/restore`;
      } else {
        url = `/api/admin/rentals/${selectedRental.id}/approve`;
        body = JSON.stringify({
          status: actionType === "approve" ? "approved" : "rejected",
        });
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (!res.ok) throw new Error(`Failed to ${actionType} rental.`);
      toast.success(`Rental ${actionType}d successfully!`);
      fetchRentals();
    } catch (err: any) {
      console.error(`Error during ${actionType}:`, err);
      toast.error(err.message || `Error during ${actionType}.`);
    } finally {
      setLoading(false);
      setSelectedRental(null);
      setActionType(null);
    }
  };

  const filteredRentals = rentals.filter(
    (rental) =>
      rental.deviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rental.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rental.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rental.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRentals.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = filteredRentals.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const getStatusBadge = (rental: AdminRental) => {
    if (rental.deletedAt)
      return (
        <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-semibold">
          Deleted
        </span>
      );
    switch (rental.approvalStatus) {
      case "approved":
        return (
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-semibold">
            Rejected
          </span>
        );
      default:
        return (
          <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-semibold">
            Pending
          </span>
        );
    }
  };

  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-red-500">
        <XCircle size={48} className="mb-4" />
        <p className="text-xl font-semibold">{error}</p>
        <button
          onClick={fetchRentals}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Rental Management
        </h2>

        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          {["pending", "approved", "rejected", "deleted", "all"].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === t
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by device name, owner name or email..."
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
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                  Device
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                  Owner
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                  Rate (Hourly)
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                  Location
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">
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
              ) : currentItems.length > 0 ? (
                currentItems.map((rental) => (
                  <tr
                    key={rental.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {rental.images && rental.images.length > 0 ? (
                            <Image
                              src={rental.images[0].file_url}
                              alt={rental.deviceName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full text-gray-400">
                              <Eye size={20} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white capitalize">
                            {rental.deviceName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {rental.deviceType}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {rental.firstName} {rental.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate max-w-[150px]">
                        {rental.email}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-mono">
                      ₦{(rental.hourlyRate / 100).toLocaleString()}/hr
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {rental.locationCity}
                      </p>
                      <p className="text-xs text-gray-500 truncate max-w-[150px]">
                        {rental.locationAddress}
                      </p>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(rental)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {filter === "deleted" || rental.deletedAt ? (
                          <button
                            onClick={() => handleActionClick(rental, "restore")}
                            title="Restore"
                            className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                          >
                            <RefreshCcw size={18} />
                          </button>
                        ) : (
                          <>
                            {rental.approvalStatus !== "approved" && (
                              <button
                                onClick={() =>
                                  handleActionClick(rental, "approve")
                                }
                                title="Approve"
                                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-all"
                              >
                                <CheckCircle size={18} />
                              </button>
                            )}
                            {rental.approvalStatus !== "rejected" && (
                              <button
                                onClick={() =>
                                  handleActionClick(rental, "reject")
                                }
                                title="Reject"
                                className="p-2 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg transition-all"
                              >
                                <XCircle size={18} />
                              </button>
                            )}
                          </>
                        )}
                        <button className="p-2 text-gray-400 hover:text-indigo-500 transition-colors">
                          <Eye size={18} />
                        </button>
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
                    No rentals found matching the criteria.
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
          message={`Are you sure you want to ${actionType} this rental (${selectedRental?.deviceName})?`}
          onConfirm={handleConfirmAction}
          onCancel={() => {
            setIsConfirmModalOpen(false);
            setSelectedRental(null);
            setActionType(null);
          }}
        />
      )}
    </div>
  );
}
