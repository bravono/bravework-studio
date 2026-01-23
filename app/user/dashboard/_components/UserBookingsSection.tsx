import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  CheckCircle,
  User,
  Monitor,
  RotateCcw,
} from "lucide-react";
import { toast } from "react-toastify";

import { Booking } from "@/app/types/app";
import Loader from "@/app/components/Loader";
import { KOBO_PER_NAIRA } from "@/lib/constants";
import ReasonModal from "@/app/components/ReasonModal";
import Modal from "@/app/components/Modal";

export default function UserBookingsSection() {
  const [activeTab, setActiveTab] = useState<"rentals" | "my-bookings">(
    "my-bookings",
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
    durationHours: "1",
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
    reason?: string,
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
        "Are you sure you want to release funds to the owner? This cannot be undone. We will ask you to leave a review after this.",
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
            durationHours: rescheduleForm.durationHours,
          }),
        },
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

  const handleRentAgain = (rentalId: number) => {
    window.location.href = `/academy/rentals/inventory/${rentalId}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium uppercase tracking-wider">
            Accepted
          </span>
        );
      case "pending":
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium uppercase tracking-wider">
            Pending
          </span>
        );
      case "declined":
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium uppercase tracking-wider">
            Declined
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium uppercase tracking-wider">
            Cancelled
          </span>
        );
      case "completed":
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium uppercase tracking-wider">
            Completed
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium uppercase tracking-wider">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 mt-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab("my-bookings")}
              className={`flex-1 py-5 text-center font-bold text-sm sm:text-base transition-all ${
                activeTab === "my-bookings"
                  ? "text-green-700 bg-green-50/50 shadow-[inset_0_-2px_0_0_rgba(21,128,61,1)]"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              }`}
            >
              My Bookings
            </button>
            <button
              onClick={() => setActiveTab("rentals")}
              className={`flex-1 py-5 text-center font-bold text-sm sm:text-base transition-all ${
                activeTab === "rentals"
                  ? "text-green-700 bg-green-50/50 shadow-[inset_0_-2px_0_0_rgba(21,128,61,1)]"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              }`}
            >
              Rental Requests
            </button>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="py-20 flex justify-center">
                <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <Calendar className="mx-auto h-16 w-16 text-gray-200 mb-4" />
                <h3 className="text-xl font-bold text-gray-900">
                  No bookings found
                </h3>
                <p className="mt-2 text-gray-500 max-w-xs mx-auto">
                  {activeTab === "my-bookings"
                    ? "You haven't booked any devices yet. Explore our catalog to find what you need."
                    : "No one has requested to book your devices yet. Make sure your listings are attractive!"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div className="flex items-start gap-5">
                          <div className="h-14 w-14 bg-green-50 rounded-2xl flex items-center justify-center flex-shrink-0 border border-green-100">
                            <Monitor className="h-7 w-7 text-green-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="text-xl font-bold text-gray-900">
                                {booking.deviceName}
                              </h4>
                              {getStatusBadge(booking.status)}
                              {activeTab === "rentals" &&
                                new Date(booking.endTime) < new Date() &&
                                booking.paymentStatus === "paid" &&
                                !booking.escrowReleased && (
                                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-wider border border-amber-100">
                                    <Clock size={10} /> Waiting for renter to
                                    release fund
                                  </span>
                                )}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <User size={14} className="text-gray-400" />
                                <span className="font-medium">
                                  {activeTab === "my-bookings"
                                    ? `Owner: ${booking.ownerName || "Unknown"}`
                                    : `Renter: ${
                                        booking.renterName || "Unknown"
                                      }`}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Clock size={14} className="text-gray-400" />
                                <span className="font-medium">
                                  {new Date(booking.startTime).toLocaleString()}{" "}
                                  - {new Date(booking.endTime).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end justify-between self-stretch">
                          <span className="text-2xl font-black text-green-700">
                            ₦
                            {Number(
                              booking.amount / KOBO_PER_NAIRA,
                            ).toLocaleString()}
                          </span>
                          {booking.escrowReleased && (
                            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100 flex items-center gap-1 mt-2">
                              <CheckCircle size={12} /> ESCROW RELEASED
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-6 pt-5 border-t border-gray-50 flex flex-wrap gap-3 justify-end items-center">
                        {activeTab === "rentals" &&
                          booking.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleStatusUpdate(booking.id, "accepted")
                                }
                                disabled={processingId === booking.id}
                                className="px-6 py-2 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 disabled:opacity-50 transition-all shadow-lg shadow-green-600/20 active:scale-95"
                              >
                                Accept Request
                              </button>
                              <button
                                onClick={() => {
                                  setReasonModal({
                                    isOpen: true,
                                    bookingId: booking.id,
                                    status: "declined",
                                    title: "Decline Booking Request",
                                    confirmText: "Decline",
                                  });
                                }}
                                disabled={processingId === booking.id}
                                className="px-6 py-2 bg-white text-red-600 border border-red-100 text-sm font-bold rounded-xl hover:bg-red-50 disabled:opacity-50 transition-all active:scale-95"
                              >
                                Decline
                              </button>
                            </>
                          )}

                        {activeTab === "my-bookings" && (
                          <>
                            {booking.status === "pending" && (
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
                                      durationHours: "1",
                                    });
                                  }}
                                  disabled={processingId === booking.id}
                                  className="px-5 py-2 bg-green-50 text-green-700 border border-green-100 text-sm font-bold rounded-xl hover:bg-green-100 disabled:opacity-50 transition-all active:scale-95"
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
                                  className="px-5 py-2 bg-white text-gray-500 border border-gray-100 text-sm font-bold rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all active:scale-95"
                                >
                                  Cancel Request
                                </button>
                              </>
                            )}

                            {booking.status === "accepted" &&
                              !booking.escrowReleased && (
                                <div className="flex flex-wrap gap-3">
                                  <button
                                    onClick={() => {
                                      setRescheduleModal({
                                        isOpen: true,
                                        booking,
                                      });
                                      setRescheduleForm({
                                        startTime: new Date(booking.startTime)
                                          .toISOString()
                                          .slice(0, 16),
                                        durationHours: "1",
                                      });
                                    }}
                                    className="px-5 py-2 text-sm font-bold text-blue-700 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 transition-all active:scale-95"
                                  >
                                    Reschedule
                                  </button>

                                  {booking.paymentStatus === "paid" && (
                                    <>
                                      <button
                                        onClick={() =>
                                          handleReleaseFunds(booking.id)
                                        }
                                        disabled={processingId === booking.id}
                                        className="px-6 py-2 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 disabled:opacity-50 transition-all shadow-lg shadow-green-600/20 active:scale-95"
                                      >
                                        Release Funds
                                      </button>
                                      <button
                                        onClick={() => {
                                          setReasonModal({
                                            isOpen: true,
                                            bookingId: booking.id,
                                            status: "dispute",
                                            title: "File a Dispute",
                                            confirmText: "Submit Dispute",
                                          });
                                        }}
                                        disabled={processingId === booking.id}
                                        className="px-6 py-2 bg-red-white text-red-600 border border-red-200 text-sm font-bold rounded-xl hover:bg-red-50 disabled:opacity-50 transition-all active:scale-95"
                                      >
                                        Dispute
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}

                            {booking.escrowReleased && (
                              <button
                                onClick={() =>
                                  handleRentAgain(booking.rentalId)
                                }
                                className="px-6 py-2 bg-green-50 text-green-700 border border-green-200 text-sm font-bold rounded-xl hover:bg-green-100 transition-all flex items-center gap-2 active:scale-95"
                              >
                                <RotateCcw size={16} />
                                Rent Again
                              </button>
                            )}
                          </>
                        )}
                      </div>

                      {/* Reasons */}
                      {booking.rejectionReason && (
                        <div className="mt-4 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">
                          <span className="font-bold flex items-center gap-1 mb-1 lowercase">
                            <RotateCcw size={14} /> declined reason
                          </span>
                          <p className="italic">{booking.rejectionReason}</p>
                        </div>
                      )}
                      {booking.cancellationReason && (
                        <div className="mt-4 p-4 bg-gray-50 text-gray-600 text-sm rounded-xl border border-gray-100">
                          <span className="font-bold flex items-center gap-1 mb-1 lowercase">
                            <RotateCcw size={14} /> cancellation reason
                          </span>
                          <p className="italic">{booking.cancellationReason}</p>
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
            if (reasonModal.status === "dispute") {
              // Handle dispute submission
              setProcessingId(reasonModal.bookingId);
              fetch(`/api/user/bookings/${reasonModal.bookingId}/dispute`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason }),
              })
                .then(async (res) => {
                  const data = await res.json();
                  if (!res.ok)
                    throw new Error(data.error || "Failed to submit dispute");
                  toast.success(
                    "Dispute submitted. We will verify your claim with the owner.",
                  );
                  setReasonModal((prev) => ({ ...prev, isOpen: false }));
                  fetchBookings();
                })
                .catch((err) => {
                  toast.error(err.message);
                })
                .finally(() => {
                  setProcessingId(null);
                });
            } else {
              handleStatusUpdate(
                reasonModal.bookingId,
                reasonModal.status,
                reason,
              );
              setReasonModal((prev) => ({ ...prev, isOpen: false }));
            }
          }
        }}
        isLoading={processingId === reasonModal.bookingId}
      />

      <Modal
        isOpen={rescheduleModal.isOpen}
        onClose={() => setRescheduleModal({ isOpen: false, booking: null })}
        title="Reschedule Booking"
      >
        <form onSubmit={handleReschedule} className="space-y-6 p-1">
          <p className="text-sm text-gray-500 mb-4">
            Specify the new start time and how long you'll need the device.
            We'll automatically calculate the end time.
          </p>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              New Start Time
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
              className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-3 border transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex justify-between">
              Duration (Hours)
              <span className="text-green-600 font-black">
                {rescheduleForm.durationHours}h
              </span>
            </label>
            <input
              type="number"
              min="1"
              max="168"
              value={rescheduleForm.durationHours}
              onChange={(e) =>
                setRescheduleForm((prev) => ({
                  ...prev,
                  durationHours: e.target.value,
                }))
              }
              className="block w-full rounded-xl border-gray-200 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-3 border transition-all"
              required
            />
            <p className="mt-2 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
              Max duration: 168 hours (1 week)
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
            <button
              type="button"
              onClick={() =>
                setRescheduleModal({ isOpen: false, booking: null })
              }
              className="px-6 py-2.5 text-sm font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={processingId !== null}
              className="px-8 py-2.5 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl shadow-lg shadow-green-600/20 disabled:opacity-50 transition-all active:scale-95"
            >
              {processingId !== null ? "Saving..." : "Update Schedule"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        title={confirmModal.title}
      >
        <div className="space-y-6 p-1">
          <div className="flex items-center gap-4 text-amber-600 bg-amber-50 p-4 rounded-xl border border-amber-100">
            <div className="p-2 bg-amber-600 text-white rounded-full">
              <RotateCcw size={20} />
            </div>
            <p className="text-sm font-medium leading-relaxed">
              {confirmModal.message}
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
            <button
              onClick={() =>
                setConfirmModal((prev) => ({ ...prev, isOpen: false }))
              }
              className="px-6 py-2.5 text-sm font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={confirmModal.onConfirm}
              className="px-8 py-2.5 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl shadow-lg shadow-green-600/20 transition-all active:scale-95"
            >
              Confirm Release
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
