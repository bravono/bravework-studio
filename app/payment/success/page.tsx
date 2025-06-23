"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import "../../payment-status.css";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (reference) {
      const fetchOrderDetails = async () => {
        try {
          // Simulate fetching order details
          setOrderId(`BW-ORD-${reference.substring(reference.length - 6)}`);
          toast.success("Your payment was successfully processed!");
        } catch (error) {
          console.error("Error fetching order details on success page:", error);
          toast.error(
            "There was an issue loading order details. Please check your email."
          );
        }
      };
      fetchOrderDetails();
    } else {
      toast.info("Payment successful. Thank you!");
    }
  }, [reference, router]);

  return (
    <div className="payment-status-container">
      <div className="payment-status-card">
        <svg
          className="payment-status-icon payment-status-success"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <h1 className="payment-status-title">Thank You!</h1>
        <p className="payment-status-message">
          Your payment was successful and your order has been placed.
        </p>

        {orderId && (
          <div className="payment-status-message">
            <p className="payment-status-message">Order ID: {orderId}</p>
            <p className="payment-status-message">
              You will receive an email confirmation shortly.
            </p>
          </div>
        )}

        <p className="payment-status-message">
          We appreciate your business! If you have any questions, please contact
          our support team.
        </p>

        <button
          onClick={() => router.push("/")}
          className="payment-status-btn payment-status-btn-success"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}