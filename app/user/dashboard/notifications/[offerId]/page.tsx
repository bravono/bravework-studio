"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import Link from "next/link";
import { CustomOffer } from "../../../../types/app";

import RejectReasonModal from "../../offers/_components/RejectReasonModal";
import "../../../../css/dashboard.css";

export default function CustomerOfferDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const offerId = params.offerId as string;
  const { data: session, status: sessionStatus } = useSession();
  const kobo = 100; // 1 NGN = 100 Kobo

  const [offer, setOffer] = useState<CustomOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [isRejectReasonModalOpen, setIsRejectReasonModalOpen] = useState(false); // NEW: State for modal

  const fetchOfferDetails = useCallback(async () => {
    if (sessionStatus !== "authenticated" || !offerId) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/user/custom-offers/${offerId}`, {
      }); // Call your new API route

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch offer details.");
      }
      const data: CustomOffer = await res.json();
      setOffer(data);
    } catch (err: any) {
      console.error("Error fetching offer details:", err);
      setError(err.message || "An error occurred while loading offer details.");
    } finally {
      setLoading(false);
    }
  }, [offerId, sessionStatus]);

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      fetchOfferDetails();
    } else if (sessionStatus === "unauthenticated") {
      router.push("/auth/login?error=unauthenticated"); // Redirect if not logged in
    }
  }, [sessionStatus, fetchOfferDetails, router]);

  // NEW: Function to handle the actual API call for offer action
  const performOfferAction = useCallback(
    async (action: "accept" | "reject", reason?: string) => {
      if (!offer || offer.status !== "pending") {
        alert(
          `This offer is already ${
            offer?.status?.toLowerCase() || "not available"
          }.`
        );
        return;
      }
      if (offer.expiresAt && new Date(offer.expiresAt) < new Date()) {
        alert("This offer has expired.");
        setOffer((prev) => (prev ? { ...prev, status: "expired" } : null)); // Update UI immediately
        return;
      }

      if (!confirm(`Are you sure you want to ${action} this offer?`)) return;

      setActionLoading(true);
      try {
        const res = await fetch(
          `/api/user/custom-offers/${offerId}/${action}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rejectionReason: reason }), // NEW: Pass rejection reason
          }
        );

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || `Failed to ${action} offer.`);
        }

        const result = await res.json();
        alert(`Offer ${action}ed successfully!`);
        setOffer((prev) =>
          prev
            ? { ...prev, status: result.newStatus, rejectionReason: reason }
            : null
        ); // Update local state
        router.push("/user/dashboard/notifications/"); // Go back to offers list or dashboard
      } catch (err: any) {
        console.error(`Error ${action}ing offer:`, err);
        alert(`Error ${action}ing offer: ` + (err.message || "Unknown error."));
      } finally {
        setActionLoading(false);
      }
    },
    [offer, offerId, router]
  );

  // NEW: Wrapper function for reject button click
  const handleRejectClick = () => {
    setIsRejectReasonModalOpen(true);
  };

  // NEW: Callback from RejectReasonModal
  const handleConfirmReject = (reason: string) => {
    setIsRejectReasonModalOpen(false);
    performOfferAction("reject", reason); // Call the main action function with reason
  };

  if (sessionStatus === "loading" || loading) {
    return <div className="loading-state">Loading offer details...</div>;
  }

  if (sessionStatus === "unauthenticated") {
    return null; // Redirect handled by useEffect
  }

  if (error) {
    return <div className="error-state">Error: {error}</div>;
  }

  if (!offer) {
    return <div className="error-state">Offer not found.</div>;
  }

  const isExpired = offer.expiresAt && new Date(offer.expiresAt) < new Date();
  const canAct = offer.status === "pending" && !isExpired;

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Custom Offer Details</h1>
          <Link href="/user/dashboard/notifications" className="profile-link">
            <span>&larr; Back to Notifications</span>
          </Link>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card offer-details">
            <h2>Offer for Order ID: {offer.orderId}</h2>
            <p>
              <strong>Status:</strong>{" "}
              <span className={`status-badge ${offer.status.toLowerCase()}`}>
                {offer.status}
              </span>
            </p>
            <p>
              <strong>Offer Amount:</strong> ₦
              {(offer.offerAmount / kobo).toLocaleString()}
            </p>
            <p>
              <strong>Description:</strong> {offer.description}
            </p>
            <p>
              <strong>Created At:</strong>{" "}
              {format(new Date(offer.createdAt), "MMM dd, yyyy HH:mm")}
            </p>

            {offer.expiresAt && (
              <p>
                <strong>Expires At:</strong>{" "}
                <span
                  style={{
                    color: isExpired ? "#ef4444" : "#f59e0b",
                    fontWeight: "bold",
                  }}
                >
                  {format(new Date(offer.expiresAt), "MMM dd, yyyy HH:mm")}
                  {isExpired && " (expired)"}
                </span>
              </p>
            )}

            {/* Display rejection reason if available and offer is rejected */}
            {offer.status === "rejected" && offer.rejectionReason && (
              <div className="rejection-reason mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="text-red-700 font-semibold mb-2">
                  Reason for Rejection:
                </h3>
                <p className="text-red-600 italic">{offer.rejectionReason}</p>
              </div>
            )}

            <h3 className="mt-4">Associated Order Details:</h3>
            <p>
              <strong>Service Type:</strong> {offer.categoryName || "N/A"}
            </p>
            <p>
              <strong>Order Description:</strong>{" "}
              {offer.orderDescription || "N/A"}
            </p>
            <p>
              <strong>Original Budget:</strong>{" "}
              {offer.orderBudget
                ? `₦${offer.orderBudget.toLocaleString()}`
                : "N/A"}
            </p>

            {canAct && (
              <div className="offer-actions mt-4">
                <button
                  onClick={(e) => {e.stopPropagation(); performOfferAction("accept")}} // Direct call for accept
                  disabled={actionLoading}
                  className="bg-green 600 mr-2"
                >
                  {actionLoading ? "Accepting..." : "Accept Offer"}
                </button>
                <button
                  onClick={(e) => {e.stopPropagation(); handleRejectClick("reject")}} // Opens the modal for reject
                  disabled={actionLoading}
                  className="bg-red-600"
                >
                  {actionLoading ? "Rejecting..." : "Reject Offer"}
                </button>
              </div>
            )}
            {!canAct && offer.status !== "expired" && (
              <p className="mt-4 text-center text-gray-600">
                This offer cannot be modified as its status is{" "}
                {offer.status.toLowerCase()}.
              </p>
            )}
            {isExpired && (
              <p className="mt-4 text-center text-red-600 font-bold">
                This offer has expired and can no longer be accepted or
                rejected.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* NEW: Reject Reason Modal */}
      {isRejectReasonModalOpen && (
        <RejectReasonModal
          onClose={() => setIsRejectReasonModalOpen(false)}
          onConfirm={handleConfirmReject}
          isLoading={actionLoading}
        />
      )}
    </div>
  );
}
