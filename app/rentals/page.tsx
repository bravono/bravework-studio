"use client";

import React, { useState, useEffect } from "react";
import { Search, MapPin, Monitor, Battery, Wifi } from "lucide-react";
import { toast } from "react-toastify";

import Link from "next/link";

import { Rental } from "../types/app";
import { KOBO_PER_NAIRA } from "@/lib/constants";


export default function RentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: "",
    deviceType: "",
  });
  const [demandRecorded, setDemandRecorded] = useState(false);

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
      console.log("Rental Page QS", data);
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

  const handleCantFindRental = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch("/api/user/rentals/nearby", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lat: latitude, lng: longitude }),
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
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Unable to retrieve your location");
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Rent High-End Devices <span className="text-green-600">Nearby</span>
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
            Find PCs and iPads for rent in your area. Secure, affordable, and
            convenient.
          </p>
          <div className="mt-8 flex justify-center">
            <Link href="/user/dashboard?tab=rentals">
              <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-lg transform transition hover:-translate-y-1">
                <Monitor className="mr-2 h-5 w-5" />
                List Your Hardware
              </button>
            </Link>
          </div>
        </div>

        {/* Search Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="city"
                value={filters.city}
                onChange={handleFilterChange}
                placeholder="Filter by City"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Monitor className="h-5 w-5 text-gray-400" />
              </div>
              <select
                name="deviceType"
                value={filters.deviceType}
                onChange={handleFilterChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="">All Devices</option>
                <option value="PC">PC</option>
                <option value="iPad">iPad</option>
              </select>
            </div>
            <button
              onClick={fetchRentals}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Search className="h-5 w-5 mr-2" />
              Search
            </button>
          </div>
        </div>

        {/* Rentals List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : rentals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rentals.map((rental) => (
              <Link href={`/rentals/${rental.id}`} key={rental.id}>
                <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
                  <div className="p-6 flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {rental.deviceType}
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        ₦
                        {Number(
                          rental.hourlyRate / KOBO_PER_NAIRA
                        ).toLocaleString()}
                        /hr
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {rental.deviceName}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                      {rental.description}
                    </p>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      {rental.locationCity}
                    </div>
                    <div className="flex gap-2 mt-4">
                      {rental.hasInternet && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700">
                          <Wifi className="h-3 w-3 mr-1" /> Internet
                        </span>
                      )}
                      {rental.hasBackupPower && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-50 text-yellow-700">
                          <Battery className="h-3 w-3 mr-1" /> Backup Power
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                    <span className="text-sm font-medium text-green-600 hover:text-green-500">
                      View Details &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <Monitor className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No rentals found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search filters or check back later.
            </p>
            <div className="mt-6">
              {!demandRecorded ? (
                <button
                  onClick={handleCantFindRental}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Can't find rental near me
                </button>
              ) : (
                <span className="text-green-600 font-medium">
                  Thanks! We'll keep you posted.
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
