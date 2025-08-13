"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { XCircle, ArrowLeft, ArrowRight } from "lucide-react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const errorMessage =
    searchParams.get("message") || "An unknown error occurred.";

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-red-200">
        <div className="flex flex-col items-center text-center">
          <XCircle className="h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-3xl font-bold text-red-600 mb-2">
            Authentication Error
          </h1>
          <p className="text-sm text-red-800 mb-6 font-medium">
            {errorMessage}
          </p>
        </div>
        <div className="space-y-4">
          <a
            href="/auth/login"
            className="flex items-center justify-center w-full py-3 px-6 rounded-lg font-bold text-white bg-green-600 hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Go to Login
          </a>
          <a
            href="/auth/signup"
            className="flex items-center justify-center w-full py-3 px-6 rounded-lg font-bold text-gray-800 bg-gray-200 hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75"
          >
            <ArrowRight className="h-5 w-5 mr-2" />
            Go to Sign Up
          </a>
        </div>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorContent />
    </Suspense>
  );
}
