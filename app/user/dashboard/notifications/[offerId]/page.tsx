"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeInfo,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Ban,
  DollarSign,
  Calendar,
  Layers,
  FileText,
} from "lucide-react";

import { CustomOffer } from "../../../../types/app";
import RejectReasonModal from "../../_components/RejectReasonModal";
import ConfirmationModal from "@/app/components/ConfirmationModal";
import { convertCurrency } from "@/lib/utils/convertCurrency";
import { getCurrencySymbol } from "@/lib/utils/getCurrencySymbol";
import { cn } from "@/lib/utils/cn";
import Loader from "@/app/components/Loader";

// Custom Hooks
import useSelectedCurrency from "@/hooks/useSelectedCurrency";
import useExchangeRates from "@/hooks/useExchangeRates";

// Status badge component for consistent styling
const StatusBadge = ({ status }: { status: string }) => {
  let colorClass = "bg-gray-200 text-gray-800";
  let statusText = status.toLowerCase();

  if (statusText === "pending") {
    colorClass = "bg-yellow-100 text-yellow-800";
  } else if (statusText === "accepted") {
    colorClass = "bg-green-100 text-green-800";
  } else if (statusText === "rejected" || statusText === "expired") {
    colorClass = "bg-red-100 text-red-800";
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase ${colorClass}`}
    >
      {statusText}
    </span>
  );
};

export default function CustomerOfferDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const offerId = params.offerId as string;
  const { data: session, status: sessionStatus } = useSession();
  const KOBO_PER_NAIRA = 100;

  const { exchangeRates, ratesLoading, ratesError } = useExchangeRates();

  const [offer, setOffer] = useState<CustomOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [isRejectReasonModalOpen, setIsRejectReasonModalOpen] = useState(false);
  const [isAcceptConfirmationModalOpen, setIsAcceptConfirmationModalOpen] =
    useState(false);
  const { selectedCurrency, updateSelectedCurrency } = useSelectedCurrency();

  const fetchOfferDetails = useCallback(async () => {
    if (sessionStatus !== "authenticated" || !offerId) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/user/custom-offers/${offerId}`);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch offer details.");
      }
      const data: CustomOffer = await res.json();
      setOffer(data);
    } catch (err: any) {
      console.error("Error fetching offer details:", err);
      setError(err.message || "An error occurred while loading offer details.");
      toast.error(
        err.message || "An error occurred while loading offer details."
      );
    } finally {
      setLoading(false);
    }
  }, [offerId, sessionStatus]);

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      fetchOfferDetails();
    } else if (sessionStatus === "unauthenticated") {
      router.push("/auth/login?error=unauthenticated");
    }
  }, [sessionStatus, fetchOfferDetails, router]);

  // Function to handle the actual API call for offer action
  const handleOfferAction = useCallback(
    async (action: "accept" | "reject", reason?: string) => {
      if (!offer || offer.status !== "pending") {
        toast.info(
          `This offer is already ${
            offer?.status?.toLowerCase() || "not available"
          }.`
        );
        return;
      }
      const isExpired =
        offer.expiresAt && new Date(offer.expiresAt) < new Date();
      if (isExpired) {
        toast.info("This offer has expired.");
        setOffer((prev) => (prev ? { ...prev, status: "expired" } : null));
        return;
      }

      setActionLoading(true);
      try {
        const res = await fetch(
          `/api/user/custom-offers/${offerId}/${action}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rejectionReason: reason }),
          }
        );

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || `Failed to ${action} offer.`);
        }

        const result = await res.json();
        toast.success(`Offer ${action}ed successfully!`);
        setOffer((prev) =>
          prev
            ? { ...prev, status: result.newStatus, rejectionReason: reason }
            : null
        );

        if (result.redirectTo) {
          window.location.href = result.redirectTo;
        }
      } catch (err: any) {
        console.error(`Error ${action}ing offer:`, err);
        toast.error(
          `Error ${action}ing offer: ` + (err.message || "Unknown error.")
        );
      } finally {
        setActionLoading(false);
      }
    },
    [offer, offerId]
  );

  const handleRejectClick = () => {
    setIsRejectReasonModalOpen(true);
  };

  const handleAcceptClick = () => {
    setIsAcceptConfirmationModalOpen(true);
  };

  const handleConfirmAccept = () => {
    setIsAcceptConfirmationModalOpen(false);
    handleOfferAction("accept");
  };

  const handleConfirmReject = (reason: string) => {
    setIsRejectReasonModalOpen(false);
    handleOfferAction("reject", reason);
  };

  if (sessionStatus === "loading" || loading) {
    return <Loader user={'user'}/>;
  }

  if (sessionStatus === "unauthenticated") {
    return null;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        Error: {error}
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        Offer not found.
      </div>
    );
  }

  const isExpired = offer.expiresAt && new Date(offer.expiresAt) < new Date();
  const canAct = offer.status === "pending" && !isExpired;

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <BadgeInfo className="mr-3 h-8 w-8 text-green-600" />
            Custom Offer Details
          </h1>
          <Link
            href="/user/dashboard/notifications"
            className="inline-flex items-center text-green-600 hover:text-green-800 transition-colors font-medium"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Notifications
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
            <div className="flex items-center">
              <FileText className="h-6 w-6 text-green-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">
                Offer for Order ID: {offer.orderId}
              </h2>
            </div>
            <StatusBadge status={offer.status} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 m-10">
            {["NGN", "USD", "GBP", "EUR"].map((currency) => (
              <button
                key={currency}
                onClick={() => updateSelectedCurrency(currency as any)}
                className={cn(
                  "py-3 px-2 rounded-xl text-sm font-semibold transition-all duration-200",
                  selectedCurrency === currency
                    ? "bg-blue-600 text-white shadow-lg ring-4 ring-blue-300 dark:ring-blue-500/50"
                    : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                )}
              >
                {currency}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
            <p className="flex items-center">
              <DollarSign className="h-4 w-4 text-gray-500 mr-2" />
              <strong className="text-gray-700">Offer Amount:</strong>
              <span className="ml-2">
                {exchangeRates?.[selectedCurrency] &&
                  convertCurrency(
                    offer.orderBudget,
                    exchangeRates?.[selectedCurrency],
                    getCurrencySymbol(selectedCurrency)
                  )}
              </span>
            </p>
            <p className="flex items-center">
              <Calendar className="h-4 w-4 text-gray-500 mr-2" />
              <strong className="text-gray-700">Created At:</strong>
              <span className="ml-2">
                {format(new Date(offer.createdAt), "MMM dd, yyyy HH:mm")}
              </span>
            </p>
            {offer.expiresAt && (
              <p className="flex items-center">
                <Clock className="h-4 w-4 text-gray-500 mr-2" />
                <strong className="text-gray-700">Expires At:</strong>
                <span
                  className={`ml-2 font-semibold ${
                    isExpired ? "text-red-500" : "text-yellow-600"
                  }`}
                >
                  {format(new Date(offer.expiresAt), "MMM dd, yyyy HH:mm")}
                  {isExpired && " (expired)"}
                </span>
              </p>
            )}
            <div className="col-span-1 md:col-span-2">
              <strong className="text-gray-700">Description:</strong>
              <p className="mt-1 text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
                {offer.description}
              </p>
            </div>
          </div>
          {offer.status === "rejected" && offer.rejectionReason && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-red-700 font-semibold flex items-center mb-2">
                <Ban className="h-5 w-5 text-red-500 mr-2" />
                Reason for Rejection:
              </h3>
              <p className="text-red-600 italic pl-7">
                {offer.rejectionReason}
              </p>
            </div>
          )}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-4">
              <Layers className="h-5 w-5 text-gray-500 mr-2" />
              Associated Order Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <p>
                <strong className="text-gray-700">Service Type:</strong>
                <span className="ml-2">{offer.categoryName || "N/A"}</span>
              </p>
              <p>
                <strong className="text-gray-700">Original Budget:</strong>
                <span className="ml-2">
                  {exchangeRates?.[selectedCurrency] &&
                    convertCurrency(
                      offer.orderBudget,
                      exchangeRates[selectedCurrency],
                      getCurrencySymbol(selectedCurrency)
                    )}
                </span>
              </p>
              <div className="col-span-1 md:col-span-2">
                <strong className="text-gray-700">Order Description:</strong>
                <p className="mt-1 text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  {offer.orderDescription || "N/A"}
                </p>
              </div>
            </div>
          </div>
          {canAct && (
            <div className="flex flex-col sm:flex-row justify-center mt-8 space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={handleAcceptClick}
                disabled={actionLoading}
                className="w-full sm:w-auto inline-flex items-center justify-center py-3 px-6 rounded-lg font-bold text-white bg-green-600 hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="h-5 w-5 mr-2" />
                {actionLoading ? "Accepting..." : "Accept Offer"}
              </button>
              <button
                onClick={handleRejectClick}
                disabled={actionLoading}
                className="w-full sm:w-auto inline-flex items-center justify-center py-3 px-6 rounded-lg font-bold text-white bg-red-600 hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle className="h-5 w-5 mr-2" />
                {actionLoading ? "Rejecting..." : "Reject Offer"}
              </button>
            </div>
          )}
          {!canAct && offer.status !== "expired" && (
            <p className="mt-8 text-center text-gray-600 italic">
              This offer cannot be modified as its status is{" "}
              <span className="font-semibold">
                {offer.status.toLowerCase()}
              </span>
              .
            </p>
          )}
          {isExpired && (
            <p className="mt-8 text-center text-red-600 font-bold italic">
              This offer has expired and can no longer be accepted or rejected.
            </p>
          )}
        </div>
      </div>

      {isRejectReasonModalOpen && (
        <RejectReasonModal
          onClose={() => setIsRejectReasonModalOpen(false)}
          onConfirm={handleConfirmReject}
          isLoading={actionLoading}
        />
      )}

      {isAcceptConfirmationModalOpen && (
        <ConfirmationModal
          isOpen={isAcceptConfirmationModalOpen}
          onCancel={() => setIsAcceptConfirmationModalOpen(false)}
          onConfirm={handleConfirmAccept}
          isLoading={actionLoading}
          message="Are you sure you want to accept this offer?"
        />
      )}
    </div>
  );
}
