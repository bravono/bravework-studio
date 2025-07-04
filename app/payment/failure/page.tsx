"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import "../../css/payment-status.css";

function PaymentFailureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("code");
  const errorMessage = searchParams.get("message");
  const [displayMessage, setDisplayMessage] = useState<string | null>(null);

  useEffect(() => {
    console.error("Payment Failure Page Loaded.", { errorCode, errorMessage });

    if (errorMessage) {
      setDisplayMessage(
        `Payment failed: ${decodeURIComponent(
          errorMessage
        )}. Please try again or contact support.`
      );
    } else if (errorCode === "cancelled") {
      setDisplayMessage(
        "Payment was cancelled. You can try again or select another method."
      );
    } else {
      setDisplayMessage(
        "Unfortunately, your payment could not be processed. Please try again."
      );
    }

    toast.error(displayMessage || "Payment failed. Please try again.");
  }, [errorCode, errorMessage, displayMessage]);

  return (
    <div className="payment-status-container">
      <div className="payment-status-card">
        <svg
          className="payment-status-icon payment-status-failure"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <h1 className="payment-status-title">Payment Failed</h1>
        <p className="payment-status-message">{displayMessage}</p>

        <div className="payment-status-info payment-status-info-failure">
          <p className="payment-status-message">What went wrong?</p>
          <p className="payment-status-message">
            {errorCode && `Error Code: ${errorCode}. `}
            Common reasons include insufficient funds, incorrect card details,
            or bank issues.
          </p>
        </div>

        <p className="payment-status-message">
          Please check your payment details and try again. If the problem
          persists, please contact our support team for assistance.
        </p>

        <div className="payment-status-actions">
          <button
            onClick={() => router.push("/payment")}
            className="payment-status-btn payment-status-btn-failure"
          >
            Retry Payment
          </button>
          <button
            onClick={() => router.push("/contact")}
            className="payment-status-btn payment-status-btn-secondary"
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailurePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentFailureContent />
    </Suspense>
  );
}
