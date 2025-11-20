
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  MapPin,
  Monitor,
  Wifi,
  Battery,
  User,
  Calendar,
  Clock,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useSession } from "next-auth/react";

export default function RentalDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [rental, setRental] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState(1);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchRentalDetails();
    }
  }, [params.id]);

  const fetchRentalDetails = async () => {
    try {
      const res = await fetch(`/api/rentals/${params.id}`);
      if (!res.ok) throw new Error("Failed to fetch rental details");
      const data = await res.json();
      setRental(data);
    } catch (error) {
      console.error("Error fetching rental details:", error);
      toast.error("Failed to load rental details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookNow = async () => {
    if (!session) {
      toast.info("Please log in to book a rental");
      router.push("/auth/login");
      return;
    }

    if (!bookingDate || !startTime) {
      toast.error("Please select a date and time");
      return;
    }

    setIsBooking(true);
    try {
      // Construct start and end ISO strings
      const startDateTime = new Date(`${bookingDate}T${startTime}`);
      const endDateTime = new Date(startDateTime.getTime() + duration * 60 * 60 * 1000);

      const totalAmount = Number(rental.hourly_rate) * duration;

      const res = await fetch("/api/rentals/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rentalId: rental.rental_id,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          totalAmount,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to book rental");
      }

      const data = await res.json();
      toast.success("Booking request sent successfully!");
      // Redirect to payment or booking confirmation
      // router.push(`/rentals/booking/${data.bookingId}`);
    } catch (error: any) {
      console.error("Error booking rental:", error);
      toast.error(error.message || "Failed to book rental");
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!rental) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-gray-500">Rental not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="flex justify-between items-start">
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 mb-4">
                    {rental.device_type}
                  </span>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {rental.device_name}
                  </h1>
                  <div className="flex items-center text-gray-500">
                    <MapPin className="h-5 w-5 mr-2" />
                    {rental.location_address}, {rental.location_city}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-green-600">
                    ₦{Number(rental.hourly_rate).toLocaleString()}
                  </p>
                  <p className="text-gray-500">per hour</p>
                </div>
              </div>
            </div>

            {/* Description & Specs */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                About this Device
              </h2>
              <p className="text-gray-600 mb-6 whitespace-pre-line">
                {rental.description}
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Specifications
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Monitor className="h-6 w-6 text-gray-400 mt-1" />
                  <p className="text-gray-700">{rental.specs}</p>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Amenities
              </h3>
              <div className="flex gap-4">
                {rental.has_internet && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
                    <Wifi className="h-5 w-5" />
                    <span className="font-medium">Internet Access</span>
                  </div>
                )}
                {rental.has_backup_power && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg">
                    <Battery className="h-5 w-5" />
                    <span className="font-medium">Backup Power</span>
                  </div>
                )}
              </div>
            </div>

            {/* Owner Info */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Meet the Owner
              </h2>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {rental.first_name} {rental.last_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Member since {new Date(rental.created_at).getFullYear()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Book this Device
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 p-2 border"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 p-2 border"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (Hours)
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 p-2 border"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
                      <option key={h} value={h}>
                        {h} Hour{h > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">
                      ₦{Number(rental.hourly_rate).toLocaleString()} x {duration}{" "}
                      hr{duration > 1 ? "s" : ""}
                    </span>
                    <span className="font-medium">
                      ₦{(Number(rental.hourly_rate) * duration).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 mt-2">
                    <span>Total</span>
                    <span>
                      ₦{(Number(rental.hourly_rate) * duration).toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleBookNow}
                  disabled={isBooking}
                  className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isBooking ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Request to Book"
                  )}
                </button>

                <p className="text-xs text-center text-gray-500 mt-4">
                  You won't be charged yet. The owner needs to accept your
                  request.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
