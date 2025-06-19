"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import "../../payment-status.css";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference"); // Get reference from URL if passed
  const [orderId, setOrderId] = useState<string | null>(null); // State for actual order ID if verified

  useEffect(() => {
    if (reference) {
      // Optional: Fetch more order details from your backend using the reference
      // This ensures the order is genuinely confirmed before displaying details.
      const fetchOrderDetails = async () => {
        try {
          // This is a mock verification / fetch; in a real app,
          // you'd rely on your webhook for actual fulfillment and might
          // fetch customer-facing order details from your database here.
          console.log(
            `Thank You Page: Attempting to fetch details for reference: ${reference}`
          );
          // Example: const res = await fetch(`/api/order-details?ref=${reference}`);
          // const data = await res.json();
          // if (data.order && data.order.status === 'paid') {
          //   setOrderId(data.order.id);
          //   toast.success('Your payment was successfully confirmed!');
          // } else {
          //   toast.error('Payment confirmation pending or failed. Please check your email.');
          // }

          // For demonstration, just set a mock order ID
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
      // If no reference in URL, perhaps redirect to home or general orders page
      // or show a generic success message
      toast.info("Payment successful. Thank you!");
      // Example: router.replace('/'); // Redirect if direct access or missing info
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
