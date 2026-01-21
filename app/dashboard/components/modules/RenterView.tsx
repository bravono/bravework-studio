"use client";

import React from "react";
import { useRouter } from "next/navigation";
import UserRentalsSection from "@/app/user/dashboard/_components/UserRentalsSection";
import UserBookingsSection from "@/app/user/dashboard/_components/UserBookingsSection";
import { toast } from "react-toastify";

export default function RenterView({ user }: { user: any }) {
  const router = useRouter();

  // Helper for bookings section prop
  const handleInitiatePayment = (
    id: any,
    type: "invoice" | "booking" = "invoice"
  ) => {
    if (type === "booking") {
      router.push(`/user/dashboard/payment?bookingId=${id}`);
    } else {
      toast.info(`Initiating payment for ID: ${id}`);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-gray-800 px-1">
          Active Rentals & Bookings
        </h2>
        <UserBookingsSection handleInitiatePayment={handleInitiatePayment} />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-gray-800 px-1">
          My Listings (Hardware)
        </h2>
        <UserRentalsSection />
      </div>
    </div>
  );
}
