"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { CheckCircle, ShoppingBag, LayoutDashboard } from "lucide-react";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [course, setCourse] = useState<any>(null);
  const [rental, setRental] = useState<any>(null);
  const type = searchParams.get("type");
  const productId = searchParams.get("id");

  useEffect(() => {
    if (reference) {
      const fetchOrderDetails = async () => {
        try {
          // Simulate fetching order details
          setOrderId(`BW-ORD-${reference.substring(reference.length - 6)}`);
          toast.success("Your payment was successfully processed!");

          // If it's a course, fetch actual course details for GTM
          if (type === "course" && productId) {
            const res = await fetch(`/api/courses/${productId}`);
            if (res.ok) {
              const data = await res.json();
              setCourse(data[0]);
            }
          }

          // If it's a rental, fetch actual rental details for GTM
          if (type === "rental" && productId) {
            const res = await fetch(`/api/user/bookings/${productId}`);
            if (res.ok) {
              const data = await res.json();
              // Map booking data to the format expected by the GTM logic
              setRental({
                deviceName: data.deviceName,
                rentalType: data.deviceType,
                id: data.id,
                hourlyRate: data.amount / 100, // converting kobo to NGN for GTM
              });
            }
          }
        } catch (error) {
          console.error("Error fetching order details on success page:", error);
          toast.error(
            "There was an issue loading order details. Please check your email.",
          );
        }
      };
      fetchOrderDetails();
    } else {
      toast.info("Payment successful. Thank you!");
    }
  }, [reference, type, productId]);

  useEffect(() => {
    window.dataLayer = window.dataLayer || [];

    if (type === "course" && course) {
      window.dataLayer.push({
        event: "academy_enroll_complete",
        course_name: course.title,
        course_category: course.category,
        course_level: course.level,
        price: course.price,
        currency: "NGN",
        course_id: course.id,
        course_slug: course.slug || "",
        transaction_id: "ENR-" + (reference || Date.now()), // unique ID
        value: course.price, // for revenue
        page: window.location.pathname,
      });
    }
    
    if (!rental) return; // replace "rental" with your actual rental data variable
    
    window.dataLayer.push({
      event: "purchase",
      item_name: rental.deviceName,
      item_category: rental.rentalType,
      item_id: rental.id,
      price: rental.hourlyRate,
      currency: "NGN",
      transaction_id: "REN-" + (reference || Date.now()), // unique ID
      value: rental.price, // for revenue
      page: window.location.pathname,
    });
  }, [course, type, reference, rental]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-gray-100 p-4">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8 sm:p-10 text-center">
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="p-4 bg-green-100 text-green-600 rounded-full">
            <CheckCircle className="w-16 h-16" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900">Thank You!</h1>
          <p className="text-lg text-gray-700 max-w-md mx-auto">
            Your payment was successful and your order has been placed.
          </p>
        </div>

        {orderId && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="bg-gray-50 rounded-xl p-6 text-left space-y-2">
              <p className="font-semibold text-gray-800 text-lg">
                Order ID:
                <span className="ml-2 font-bold text-green-600">{orderId}</span>
              </p>
              <p className="text-sm text-gray-500">
                You will receive an email confirmation shortly with all the
                details.
              </p>
            </div>
          </div>
        )}

        <p className="text-sm text-gray-500 mt-6">
          We appreciate your business! If you have any questions, please contact
          our support team.
        </p>

        <div className="mt-8">
          <button
            onClick={() => router.push("/")}
            className="flex mb-2 items-center justify-center gap-2 w-full px-6 py-3 rounded-xl font-bold text-base bg-green-600 text-white hover:bg-green-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <ShoppingBag className="w-5 h-5" />
            Continue Shopping
          </button>
          <button
            onClick={() => {
              window.location.href = "/user/dashboard"; // Full page reload
            }}
            className="flex mb-2 items-center justify-center gap-2 w-full px-6 py-3 rounded-xl font-bold text-base bg-green-600 text-white hover:bg-green-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <LayoutDashboard className="w-5 h-5" />
            View Dashboard
          </button>
        </div>
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
