"use client";

import React from "react";
import { MailCheck } from "lucide-react";

export default function VerificationEmailPage() {
  // Try to open the user's default email client
  const handleOpenEmail = () => {
    window.location.href = "mailto:";
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg text-center">
        <div className="flex flex-col items-center mb-6">
          <MailCheck className="h-16 w-16 text-green-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Verify Your Email
          </h1>
          <p className="text-sm text-gray-500">
            We’ve sent a verification link to your email address. Please check your inbox and click the link to activate your account.
          </p>
        </div>
        
        <button
          onClick={handleOpenEmail}
          className="w-full py-3 px-6 rounded-lg font-bold text-white bg-green-600 hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
        >
          Open Email App
        </button>

        <div className="mt-4 text-sm text-gray-500">
          Didn’t get the email? Check your spam folder or{" "}
          <a
            href="/auth/resend_verification"
            className="text-green-600 hover:underline font-medium"
          >
            resend verification
          </a>
          .
        </div>
      </div>
    </div>
  );
}
