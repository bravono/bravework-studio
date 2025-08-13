"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { XCircle, ArrowLeft, LifeBuoy } from "lucide-react";

function PaymentFailureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("code");
  const errorMessage = searchParams.get("message");
  const [displayMessage, setDisplayMessage] = useState<string | null>(null);

  useEffect(() => {
    console.error("Payment Failure Page Loaded.", { errorCode, errorMessage });

    let message = "";
    if (errorMessage) {
      message = `Payment failed: ${decodeURIComponent(
        errorMessage
      )}. Please try again or contact support.`;
    } else if (errorCode === "cancelled") {
      message =
        "Payment was cancelled. You can try again or select another method.";
    } else {
      message =
        "Unfortunately, your payment could not be processed. Please try again.";
    }
    setDisplayMessage(message);
    toast.error(message);
  }, [errorCode, errorMessage]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-gray-100 p-4">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8 sm:p-10 text-center">
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="p-4 bg-red-100 text-red-600 rounded-full">
            <XCircle className="w-16 h-16" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900">
            Payment Failed
          </h1>
          <p className="text-lg text-gray-700 max-w-md mx-auto">
            {displayMessage}
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-left">
            <h2 className="text-lg font-semibold text-red-800 flex items-center gap-2">
              <span className="p-1 bg-red-200 rounded-full">
                <LifeBuoy className="w-5 h-5 text-red-700" />
              </span>
              What went wrong?
            </h2>
            <p className="mt-3 text-red-700 text-base">
              {errorCode && `Error Code: ${errorCode}. `}
              Common reasons include insufficient funds, incorrect card details,
              or bank issues.
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-6">
          If the problem persists, please check your payment details and try
          again.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => router.push("/payment")}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-base bg-red-600 text-white hover:bg-red-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="w-5 h-5" />
            Retry Payment
          </button>
          <button
            onClick={() => router.push("/contact")}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-base text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            <LifeBuoy className="w-5 h-5" />
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
