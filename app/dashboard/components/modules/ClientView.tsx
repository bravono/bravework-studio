"use client";

import React from "react";
import UserOrdersSection from "@/app/user/dashboard/_components/UserOrdersSection";
import UserInvoicesSection from "@/app/user/dashboard/_components/UserInvoicesSection";
import UserCustomOffersSection from "@/app/user/dashboard/_components/UserCustomOfferSection";

export default function ClientView({ user }: { user: any }) {
  // Reusing the existing sections nicely
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* We can wrap these in specific containers if needed, but the sections usually come with their own styling */}

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-gray-800 px-1">Your Projects</h2>
        <UserOrdersSection />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-800 px-1">Invoices</h2>
          <UserInvoicesSection />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-800 px-1">
            Custom Offers
          </h2>
          <UserCustomOffersSection />
        </div>
      </div>
    </div>
  );
}
