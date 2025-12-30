import React, { useState, useEffect } from "react";
import { Calendar, Clock, CheckCircle, User, Monitor } from "lucide-react";
import { toast } from "react-toastify";

import { Booking } from "@/app/types/app";
import Loader from "@/app/components/Loader";
import { KOBO_PER_NAIRA } from "@/lib/constants";
import ReasonModal from "@/app/components/ReasonModal";
import Modal from "@/app/components/Modal";

export default function UserBookingsSection() {
  const [activeTab, setActiveTab] = useState<"rentals" | "my-bookings">(
    "my-bookings"
  );
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [reasonModal, setReasonModal] = useState<{
    isOpen: boolean;
    bookingId: number | null;
    status: string;
    title: string;
    confirmText: string;
  }>({
    isOpen: false,
    bookingId: null,
    status: "",
    title: "",
    confirmText: "",
  });
  const [rescheduleModal, setRescheduleModal] = useState<{
    isOpen: boolean;
    booking: Booking | null;
  }>({
    isOpen: false,
    booking: null,
  });
  const [rescheduleForm, setRescheduleForm] = useState({
    startTime: "",
    endTime: "",
  });
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    bookingId: number | null;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    bookingId: null,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const role = activeTab === "rentals" ? "owner" : "renter";
      const res = await fetch(`/api/user/bookings?role=${role}`);
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const data = await res.json();
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (
    bookingId: number,
    status: string,
    reason?: string
  ) => {
    setProcessingId(bookingId);
    try {
      const res = await fetch(`/api/user/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reason }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update booking");
      }

      toast.success(`Booking ${status} successfully`);
      fetchBookings(); // Refresh list
    } catch (error: any) {
      console.error("Error updating booking:", error);
      toast.error(error.message || "Failed to update booking");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReleaseFunds = async (bookingId: number) => {
    setConfirmModal({
      isOpen: true,
      bookingId,
      title: "Release Funds",
      message:
        "Are you sure you want to release funds to the owner? This cannot be undone.",
      onConfirm: async () => {
        setProcessingId(bookingId);
        try {
          const res = await fetch(`/api/user/bookings/${bookingId}/release`, {
            method: "POST",
          });

          if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || "Failed to release funds");
          }

          toast.success("Funds released successfully");
          fetchBookings();
        } catch (error: any) {
          console.error("Error releasing funds:", error);
          toast.error(error.message || "Failed to release funds");
        } finally {
          setProcessingId(null);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleModal.booking) return;

    setProcessingId(rescheduleModal.booking.id);
    try {
      const res = await fetch(
        `/api/user/bookings/${rescheduleModal.booking.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            startTime: rescheduleForm.startTime,
            endTime: rescheduleForm.endTime,
          }),
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to reschedule booking");
      }

      toast.success("Booking rescheduled successfully");
      setRescheduleModal({ isOpen: false, booking: null });
      fetchBookings();
    } catch (error: any) {
      console.error("Error rescheduling:", error);
      toast.error(error.message || "Failed to reschedule");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            Accepted
          </span>
        );
      case "pending":
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            Pending
          </span>
        );
      case "declined":
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            Declined
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            Cancelled
          </span>
        );
      case "completed":
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            Completed
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4 mt-10 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("my-bookings")}
              className={`flex-1 py-4 text-center font-medium text-sm sm:text-base transition-colors ${
                activeTab === "my-bookings"
                  ? "border-b-2 border-green-600 text-green-600 bg-green-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              My Bookings (Renter)
            </button>
            <button
              onClick={() => setActiveTab("rentals")}
              className={`flex-1 py-4 text-center font-medium text-sm sm:text-base transition-colors ${
                activeTab === "rentals"
                  ? "border-b-2 border-green-600 text-green-600 bg-green-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              Rental Requests (Owner)
            </button>
          </div>

          <div className="p-6">
            {isLoading ? (
              <Loader user={"user"} />
            ) : bookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No bookings found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {activeTab === "my-bookings"
                    ? "You haven't booked any devices yet."
                    : "No one has booked your devices yet."}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Monitor className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-gray-900">
                              {booking.deviceName}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                              <User className="h-4 w-4" />
                              <span>
                                {activeTab === "my-bookings"
                                  ? `Owner: ${booking.ownerName || "Unknown"}`
                                  : `Renter: ${
                                      booking.renterName || "Unknown"
                                    }`}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                              <Clock className="h-4 w-4" />
                              <span>
                                {new Date(booking.startTime).toLocaleString()} -{" "}
                                {new Date(booking.endTime).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(booking.status)}
                          <span className="text-lg font-bold text-green-600">
                            ₦
                            {Number(
                              booking.amount / KOBO_PER_NAIRA
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap gap-3 justify-end">
                        {activeTab === "rentals" &&
                          booking.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleStatusUpdate(booking.id, "accepted")
                                }
                                disabled={processingId === booking.id}
                                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => {
                                  setReasonModal({
                                    isOpen: true,
                                    bookingId: booking.id,
                                    status: "declined",
                                    title: "Decline Booking Request",
                                    confirmText: "Decline Request",
                                  });
                                }}
                                disabled={processingId === booking.id}
                                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50"
                              >
                                Decline
                              </button>
                            </>
                          )}

                        {activeTab === "my-bookings" &&
                          booking.status === "pending" && (
                            <>
                              <button
                                onClick={() => {
                                  setRescheduleModal({
                                    isOpen: true,
                                    booking: booking,
                                  });
                                  setRescheduleForm({
                                    startTime: new Date(booking.startTime)
                                      .toISOString()
                                      .slice(0, 16),
                                    endTime: new Date(booking.endTime)
                                      .toISOString()
                                      .slice(0, 16),
                                  });
                                }}
                                disabled={processingId === booking.id}
                                className="px-4 py-2 bg-green-100 text-green-700 text-sm font-medium rounded-md hover:bg-green-200 disabled:opacity-50"
                              >
                                Reschedule
                              </button>
                              <button
                                onClick={() => {
                                  setReasonModal({
                                    isOpen: true,
                                    bookingId: booking.id,
                                    status: "cancelled",
                                    title: "Cancel Booking Request",
                                    confirmText: "Cancel Request",
                                  });
                                }}
                                disabled={processingId === booking.id}
                                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 disabled:opacity-50"
                              >
                                Cancel Request
                              </button>
                            </>
                          )}

                        {activeTab === "my-bookings" &&
                          booking.status === "accepted" &&
                          !booking.escrowReleased && (
                            <button
                              onClick={() => handleReleaseFunds(booking.id)}
                              disabled={processingId === booking.id}
                              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                              Release Funds
                            </button>
                          )}

                        {booking.escrowReleased && (
                          <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" /> Funds Released
                          </span>
                        )}
                      </div>

                      {/* Reasons */}
                      {booking.rejectionReason && (
                        <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-md">
                          <strong>Declined Reason:</strong>{" "}
                          {booking.rejectionReason}
                        </div>
                      )}
                      {booking.cancellationReason && (
                        <div className="mt-4 p-3 bg-gray-50 text-gray-700 text-sm rounded-md">
                          <strong>Cancellation Reason:</strong>{" "}
                          {booking.cancellationReason}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ReasonModal
        isOpen={reasonModal.isOpen}
        onClose={() => setReasonModal((prev) => ({ ...prev, isOpen: false }))}
        title={reasonModal.title}
        confirmText={reasonModal.confirmText}
        onConfirm={(reason) => {
          if (reasonModal.bookingId) {
            handleStatusUpdate(
              reasonModal.bookingId,
              reasonModal.status,
              reason
            );
            setReasonModal((prev) => ({ ...prev, isOpen: false }));
          }
        }}
        isLoading={processingId === reasonModal.bookingId}
      />

      <Modal
        isOpen={rescheduleModal.isOpen}
        onClose={() => setRescheduleModal({ isOpen: false, booking: null })}
        title="Reschedule Booking"
      >
        <form onSubmit={handleReschedule} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <input
              type="datetime-local"
              value={rescheduleForm.startTime}
              onChange={(e) =>
                setRescheduleForm((prev) => ({
                  ...prev,
                  startTime: e.target.value,
                }))
              }
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time
            </label>
            <input
              type="datetime-local"
              value={rescheduleForm.endTime}
              onChange={(e) =>
                setRescheduleForm((prev) => ({
                  ...prev,
                  endTime: e.target.value,
                }))
              }
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() =>
                setRescheduleModal({ isOpen: false, booking: null })
              }
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processingId !== null}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md disabled:opacity-50"
            >
              {processingId !== null ? "Updating..." : "Update Schedule"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        title={confirmModal.title}
      >
        <div className="space-y-4">
          <p className="text-gray-600">{confirmModal.message}</p>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() =>
                setConfirmModal((prev) => ({ ...prev, isOpen: false }))
              }
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={confirmModal.onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
