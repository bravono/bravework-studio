"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle, Home, Monitor } from "lucide-react";

export default function BookingSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
          Booking Request Sent!
        </h2>
        <p className="text-gray-600 mb-8">
          Your booking request has been successfully sent to the owner. You will
          be notified via email once they accept or decline your request.
        </p>
        <div className="space-y-4">
          <Link href="/user/dashboard?tab=bookings">
            <button className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 shadow-sm transition-colors">
              <Monitor className="mr-2 h-5 w-5" />
              View My Bookings
            </button>
          </Link>
          <Link href="/rentals">
            <button className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors">
              <Home className="mr-2 h-5 w-5" />
              Back to Rentals
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
