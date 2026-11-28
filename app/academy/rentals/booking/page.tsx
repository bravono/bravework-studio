"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  CreditCard,
  ArrowLeft,
  Info,
  Loader2,
  Zap,
  Wifi,
  Monitor,
} from "lucide-react";
import Link from "next/link";
import AcademySubNavBar from "../../../components/AcademySubNavBar";

export default function AcademyBookingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AcademySubNavBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <Link
            href="/academy/rentals"
            className="inline-flex items-center text-sm font-bold text-green-600 mb-6 hover:gap-2 transition-all"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Rentals Overview
          </Link>
          <h1 className="text-4xl font-black text-gray-900 mb-4">
            Book Your Session
          </h1>
          <p className="text-gray-600 max-w-2xl text-lg">
            Schedule your equipment on-site session below. All bookings are
            subject to our standard damage and usage policies.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <Info size={20} className="text-blue-500" />
                How it works
              </h3>
              <ul className="space-y-6">
                {[
                  {
                    icon: Calendar,
                    title: "Select Time",
                    desc: "Pick a date and time that fits your study schedule.",
                    color: "text-blue-600",
                    bg: "bg-blue-50",
                  },
                  {
                    icon: CreditCard,
                    title: "Payment",
                    desc: "Pay Securely (Escrow Protected)",
                    color: "text-green-600",
                    bg: "bg-green-50",
                  },
                  {
                    icon: MapPin,
                    title: "On-Site",
                    desc: "Currently in Katsina. Partner with us to expand nationwide.",
                    color: "text-amber-600",
                    bg: "bg-amber-50",
                  },
                ].map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <div
                      className={`shrink-0 w-10 h-10 ${step.bg} ${step.color} rounded-xl flex items-center justify-center`}
                    >
                      <step.icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">
                        {step.title}
                      </h4>
                      <p className="text-gray-500 text-xs leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-black rounded-[2rem] p-8 text-white shadow-xl shadow-green-900/10">
              <ShieldCheck className="text-green-500 mb-4" size={32} />
              <h3 className="text-lg font-bold mb-2">Safe & Reliable</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                All devices are sanitized and benchmarked before every rental.
                Our 24/7 support is included with your booking.
              </p>
              <Link href="/academy/rentals/faq">
                <button className="text-green-500 font-bold text-sm hover:underline flex items-center gap-2">
                  Read Rental Policy <Clock size={14} />
                </button>
              </Link>
            </div>
          </div>

          {/* Hubs Directory */}
          <div className="lg:col-span-2 space-y-8">
            <HubsList />
          </div>
        </div>
      </div>
    </div>
  );
}

function HubsList() {
  const [hubs, setHubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHubs() {
      try {
        const res = await fetch("/api/rentals?rentalType=hub&isPartner=true");
        if (!res.ok) throw new Error("Failed to fetch hubs");
        const data = await res.json();
        setHubs(data);
      } catch (err) {
        console.error("Error fetching hubs:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHubs();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-[2rem] border border-gray-100 italic text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-green-600" />
        Finding hubs near you...
      </div>
    );
  }

  if (hubs.length === 0) {
    return (
      <div className="text-center p-12 bg-white rounded-[2rem] border-2 border-dashed border-gray-100">
        <MapPin className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          No Partner Hubs found
        </h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          We are currently expanding! Check back soon or reach out to us to refer
          a hub in your city.
        </p>
      </div>
    );
  }

  // Group by city for better organization
  const hubsByCity = hubs.reduce((acc: any, hub) => {
    const city = hub.locationCity || "Other Locations";
    if (!acc[city]) acc[city] = [];
    acc[city].push(hub);
    return acc;
  }, {});

  return (
    <div className="space-y-12">
      {Object.entries(hubsByCity).map(([city, cityHubs]: [string, any]) => (
        <div key={city}>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-black text-gray-900">{city}</h2>
            <div className="h-[2px] flex-grow bg-gray-100"></div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {cityHubs.map((hub: any) => (
              <div
                key={hub.id}
                className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {hub.deviceName}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-green-600 uppercase tracking-widest">
                        ₦500/hr
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span className="text-xs font-medium text-gray-500">
                        Official Partner
                      </span>
                    </div>
                  </div>
                  <div className="bg-blue-50 text-blue-600 p-2 rounded-xl">
                    <Monitor size={20} />
                  </div>
                </div>

                <div className="space-y-4 flex-grow">
                  <div className="flex gap-2">
                    <div className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-black uppercase rounded-lg border border-green-100 flex items-center gap-1">
                      <Zap size={12} />
                      Mentorship Included
                    </div>
                    {hub.hasInternet && (
                      <div className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase rounded-lg border border-blue-100 flex items-center gap-1">
                        <Wifi size={12} />
                        Fiber Internet
                      </div>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed italic">
                    {hub.description ||
                      "Premium hub location for professional work."}
                  </p>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400">
                    <MapPin size={14} />
                    <span className="text-xs font-medium truncate max-w-[150px]">
                      {hub.locationAddress || "Office Location"}
                    </span>
                  </div>
                  <Link
                    href={`/academy/rentals/inventory/${hub.id}`}
                    className="px-4 py-2 bg-gray-900 text-white font-bold text-sm rounded-xl hover:bg-black transition-all"
                  >
                    View & Book
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
