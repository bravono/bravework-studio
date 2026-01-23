"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Monitor,
  Battery,
  Wifi,
  Filter,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";
import { motion } from "framer-motion";
import AcademySubNavBar from "../../../components/AcademySubNavBar";
import LocationPicker from "@/app/components/LocationPicker";
import { Rental } from "../../../types/app";
import { KOBO_PER_NAIRA } from "@/lib/constants";

export default function AcademyInventoryPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: "",
    deviceType: "",
  });
  const [demandRecorded, setDemandRecorded] = useState(false);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);

  useEffect(() => {
    fetchRentals();
  }, [filters]);

  const fetchRentals = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.city) queryParams.append("city", filters.city);
      if (filters.deviceType)
        queryParams.append("deviceType", filters.deviceType);

      const res = await fetch(`/api/rentals?${queryParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch rentals");
      const data = await res.json();
      setRentals(data);
    } catch (error) {
      console.error("Error fetching rentals:", error);
      toast.error("Failed to load rentals");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const recordDemand = async (lat: number, lng: number) => {
    try {
      const res = await fetch("/api/user/rentals/nearby", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lng }),
      });

      if (!res.ok) throw new Error("Failed to record demand");
      setDemandRecorded(true);
      toast.success(
        "We've recorded your interest! We'll notify you when rentals become available nearby."
      );
    } catch (error) {
      console.error("Error recording demand:", error);
      toast.error("Failed to record your location");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AcademySubNavBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div className="flex-grow">
            <Link
              href="/academy/rentals"
              className="inline-flex items-center text-sm font-bold text-green-600 mb-6 hover:gap-2 transition-all"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Rentals Overview
            </Link>
            <h1 className="text-4xl font-black text-gray-900 mb-4">
              Available Hardware
            </h1>
            <p className="text-gray-600 max-w-2xl text-lg">
              Browse our curated fleet of high-performance devices. Optimized
              for Bravework Academy curriculum and professional digital
              production.
            </p>
          </div>
          <div className="shrink-0">
            <Link href="/user/dashboard?tab=rentals">
              <button className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-bold rounded-2xl shadow-xl shadow-green-600/20 hover:bg-green-700 transition-all gap-2">
                <Monitor size={20} />
                List Your Hardware
              </button>
            </Link>
          </div>
        </div>

        {/* Search Filters */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Filter size={20} className="text-green-600" />
            <span className="font-bold text-gray-900 uppercase tracking-wider text-sm">
              Filter Gear
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                Location
              </label>
              <div className="relative">
                <MapPin
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  name="city"
                  value={filters.city}
                  onChange={handleFilterChange}
                  placeholder="e.g. Lagos, Abuja"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 transition-all font-medium"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                Device Category
              </label>
              <div className="relative">
                <Monitor
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <select
                  name="deviceType"
                  value={filters.deviceType}
                  onChange={handleFilterChange}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 appearance-none transition-all font-medium"
                >
                  <option value="">All Equipment</option>
                  <option value="PC">Rendering PC</option>
                  <option value="iPad">Graphic Tablet / iPad</option>
                </select>
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchRentals}
                className="w-full py-3.5 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Search size={18} />
                Update Results
              </button>
            </div>
          </div>
        </div>

        {/* Rentals List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="text-gray-500 font-medium">Scanning inventory...</p>
          </div>
        ) : rentals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rentals.map((rental) => (
              <motion.div
                key={rental.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                <div className="p-8 flex-grow">
                  <div className="flex justify-between items-start mb-6">
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black bg-green-50 text-green-700 uppercase tracking-widest border border-green-100">
                      {rental.deviceType}
                    </span>
                    <div className="text-right">
                      <span className="block text-2xl font-black text-gray-900">
                        ₦
                        {Number(
                          rental.hourlyRate / KOBO_PER_NAIRA
                        ).toLocaleString()}
                      </span>
                      <span className="text-xs font-bold text-gray-400 uppercase">
                        Per Hour
                      </span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-green-600 transition-colors">
                    {rental.deviceName}
                  </h3>
                  <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">
                    {rental.description}
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center text-sm font-bold text-gray-600 bg-gray-50 p-3 rounded-xl">
                      <MapPin className="h-4 w-4 mr-2 text-green-500" />
                      {rental.locationCity}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {rental.hasInternet && (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                          <Wifi className="h-3 w-3 mr-1.5" /> Fast WiFi
                        </span>
                      )}
                      {rental.hasBackupPower && (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
                          <Battery className="h-3 w-3 mr-1.5" /> 24/7 Power
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-6 flex items-center justify-between border-t border-gray-100">
                  <Link
                    href={`/academy/rentals/inventory/${rental.id}`}
                    className="w-full"
                  >
                    <button className="w-full bg-white text-gray-900 font-bold py-3.5 rounded-xl border border-gray-200 hover:bg-green-600 hover:text-white hover:border-green-600 transition-all flex items-center justify-center gap-2 group-hover:shadow-lg">
                      Book This Device
                      <ChevronRight size={18} />
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-gray-200">
            <Monitor className="mx-auto h-16 w-16 text-gray-300 mb-6" />
            <h3 className="text-2xl font-black text-gray-900 mb-2">
              No hardware found
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              We couldn't find any devices matching your current filters. Try
              expanding your search or contact our support team.
            </p>

            {!demandRecorded && (
              <div className="mt-8">
                <button
                  onClick={() => setIsLocationPickerOpen(true)}
                  className="px-8 py-4 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 transition-all shadow-xl shadow-green-600/20"
                >
                  Can't find rental near me
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <LocationPicker
        isOpen={isLocationPickerOpen}
        onClose={() => setIsLocationPickerOpen(false)}
        onConfirm={recordDemand}
      />
    </div>
  );
}
