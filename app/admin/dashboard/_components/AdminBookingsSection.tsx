"use client";

import React, { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  MessageSquare,
  Clock,
} from "lucide-react";
import Pagination from "../../../components/Pagination";
import ConfirmationModal from "@/app/components/ConfirmationModal";

const ITEMS_PER_PAGE = 10;

interface AdminBooking {
  id: number;
  rental_id: number;
  renter_id: number;
  start_time: string;
  end_time: string;
  total_amount_kobo: number;
  escrow_released: boolean;
  status: string;
  payment_status_id: number;
  dispute_reason: string | null;
  dispute_date: string | null;
  device_name: string;
  owner_id: number;
  renter_email: string;
  renter_first_name: string;
  renter_last_name: string;
  owner_email: string;
  owner_first_name: string;
  owner_last_name: string;
}

export default function AdminBookingsSection() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all"); // all, overdue, complaints
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(
    null
  );

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // NOTE: Query param remains 'complaints' in API for now unless we rename the literal value too.
      // API currently uses filter === "complaints" to check dispute_reason IS NOT NULL.
      // We can keep the UI filter name as "disputes" but pass "complaints" OR update API too.
      // Just updated API to accept "complaints" param but check dispute_reason.
      // Let's pass "complaints" for now to match API or I should have updated API param too.
      // I only updated the API *logic* to query dispute_reason.
      // wait, I only updated API check: `else if (filter === "complaints")`.
      // So I should send "complaints" or update API to "disputes" too.
      // Let's stick with "complaints" internally for the filter param if simpler,
      // OR better, update the filter here to "disputes" and API to "disputes".
      // Let's update API to accept "disputes"? No I already finished editing API logic.
      // Actually taking a look at my previous API edit...
      // `else if (filter === "complaints") { conditions.push('rb.dispute_reason IS NOT NULL'); }`
      // So I must stick to "complaints" as filter value unless I edit API again.
      // To show "Disputes" in UI, I can just change the label in the map.
      const res = await fetch(
        `/api/admin/bookings?filter=${
          filter === "disputes" ? "complaints" : filter
        }`
      );
      if (!res.ok) throw new Error("Failed to fetch bookings.");
      const data: AdminBooking[] = await res.json();
      setBookings(data);
      setCurrentPage(1);
    } catch (err: any) {
      console.error("Error fetching bookings:", err);
      setError(err.message || "Failed to load bookings.");
      toast.error(err.message || "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleReleaseFunds = (booking: AdminBooking) => {
    setSelectedBooking(booking);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmRelease = async () => {
    if (!selectedBooking) return;

    setLoading(true);
    setIsConfirmModalOpen(false);
    try {
      const res = await fetch(
        `/api/user/bookings/${selectedBooking.id}/release`,
        {
          method: "POST",
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to release funds.");
      }

      toast.success("Funds released successfully!");
      fetchBookings();
    } catch (err: any) {
      console.error("Error releasing funds:", err);
      toast.error(err.message || "Error releasing funds.");
    } finally {
      setLoading(false);
      setSelectedBooking(null);
    }
  };

  const filteredBookings = bookings.filter(
    (booking) =>
      booking.device_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.renter_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.owner_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = filteredBookings.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const isOverdue = (booking: AdminBooking) => {
    if (booking.escrow_released) return false;
    const end = new Date(booking.end_time).getTime();
    const now = new Date().getTime();
    return now > end + 48 * 60 * 60 * 1000;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Booking Management
        </h2>

        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          {["all", "overdue", "disputes"].map((t) => (
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
            placeholder="Search by device, or email..."
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
                  Booking Info
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                  Parties
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                  Timing
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
                      colSpan={5}
                      className="px-6 py-4 h-16 bg-gray-50/50 dark:bg-gray-800/50"
                    ></td>
                  </tr>
                ))
              ) : currentItems.length > 0 ? (
                currentItems.map((booking) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {booking.device_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          ID: #{booking.id}
                        </p>
                        {booking.dispute_reason && (
                          <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100 max-w-[200px]">
                            <p className="font-bold flex items-center gap-1">
                              <MessageSquare size={10} /> Dispute:
                            </p>
                            {booking.dispute_reason}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">
                          <span className="font-bold text-gray-700 dark:text-gray-300">
                            Renter:
                          </span>{" "}
                          {booking.renter_email}
                        </p>
                        <p className="text-xs text-gray-500">
                          <span className="font-bold text-gray-700 dark:text-gray-300">
                            Owner:
                          </span>{" "}
                          {booking.owner_email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      <p>
                        Start: {format(new Date(booking.start_time), "PP p")}
                      </p>
                      <p>End: {format(new Date(booking.end_time), "PP p")}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2 items-start">
                        {booking.escrow_released ? (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                            <CheckCircle size={12} /> Released
                          </span>
                        ) : (
                          <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-semibold">
                            Pending Release
                          </span>
                        )}
                        {isOverdue(booking) && (
                          <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <Clock size={12} /> Overdue
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!booking.escrow_released && isOverdue(booking) && (
                        <button
                          onClick={() => handleReleaseFunds(booking)}
                          className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 shadow-sm transition-all"
                        >
                          Release Funds
                        </button>
                      )}
                      {!booking.escrow_released && !isOverdue(booking) && (
                        <span className="text-xs text-gray-400 italic">
                          release in &#62;48h post-end
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No bookings found matching the criteria.
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

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        message={`Are you sure you want to release funds for booking #${selectedBooking?.id}? This action is irreversible.`}
        onConfirm={handleConfirmRelease}
        onCancel={() => {
          setIsConfirmModalOpen(false);
          setSelectedBooking(null);
        }}
      />
    </div>
  );
}
