"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  MapPin,
  Wifi,
  Battery,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

import GoogleMap from "@/app/components/GoogleMap";
import { Rental } from "@/app/types/app";

export default function RentalDetailsPage() {
  const KOBO_PER_NAIRA = 100;
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [rental, setRental] = useState<Rental>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [isBooking, setIsBooking] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchRentalDetails();
  }, [id]);

  const fetchRentalDetails = async () => {
    try {
      const res = await fetch(`/api/rentals/${id}`);
      if (!res.ok) throw new Error("Failed to fetch rental");
      const data = await res.json();
      const found = data.find((r: Rental) => r.id === Number(id));
      if (found) {
        setRental(found);
      } else {
        toast.error("Rental not found");
        router.push("/rentals");
      }
    } catch (error) {
      console.error("Error fetching rental:", error);
      toast.error("Failed to load rental details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookNow = async () => {
    if (!session) {
      toast.error("Please log in to book this device");
      router.push("/auth/signin");
      return;
    }

    if (!startDate || !endDate) {
      toast.error("Please select start and end dates");
      return;
    }

    if (endDate <= startDate) {
      toast.error("End time must be after start time");
      return;
    }

    setIsBooking(true);
    try {
      const hours =
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
      const totalAmount = Math.ceil(
        hours * Number(rental.hourlyRate / KOBO_PER_NAIRA)
      );

      const res = await fetch("/api/user/rentals/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rentalId: rental.id,
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
          totalAmount: totalAmount * KOBO_PER_NAIRA,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Booking failed");
      }

      toast.success("Booking request sent successfully!");
      router.push("/user/booking/success");
    } catch (error: any) {
      console.error("Booking error:", error);
      toast.error(error.message || "Failed to book rental");
    } finally {
      setIsBooking(false);
    }
  };

  const nextImage = () => {
    if (rental?.imagesArray?.length) {
      setCurrentImageIndex((prev) => (prev + 1) % rental.imagesArray.length);
    }
  };

  const prevImage = () => {
    if (rental?.imagesArray?.length) {
      setCurrentImageIndex(
        (prev) =>
          (prev - 1 + rental.imagesArray.length) % rental.imagesArray.length
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!rental) return null;

  const isOwner = session?.user && (session.user as any).id === rental.userId;
  const images =
    rental.imagesArray && rental.imagesArray.length > 0
      ? rental.imagesArray
      : [""];

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center text-gray-600 hover:text-green-600 transition-colors"
        >
          <ChevronLeft className="h-5 w-5 mr-1" /> Back to Rentals
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image Section */}
            <div className="relative h-96 lg:h-auto bg-gray-200">
              <img
                src={images[currentImageIndex]}
                alt={rental.deviceName}
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {images.map((_: any, idx: number) => (
                      <div
                        key={idx}
                        className={`h-2 w-2 rounded-full ${
                          idx === currentImageIndex ? "bg-white" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Details Section */}
            <div className="p-8 lg:p-12 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {rental.deviceName}
                    </h1>
                    <div className="flex items-center text-gray-500">
                      <MapPin className="h-5 w-5 mr-2" />
                      {rental.locationCity}, {rental.locationAddress}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-green-600">
                      ₦
                      {Number(
                        rental.hourlyRate / KOBO_PER_NAIRA
                      ).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">per hour</p>
                  </div>
                </div>

                <div className="prose prose-green max-w-none mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-600">{rental.description}</p>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Specifications
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 text-gray-700 font-mono text-sm">
                    {rental.specs || "No specifications listed."}
                  </div>
                </div>

                <div className="flex gap-4 mb-8">
                  {rental.hasInternet && (
                    <div className="flex items-center text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-sm font-medium">
                      <Wifi className="h-4 w-4 mr-2" /> Internet Available
                    </div>
                  )}
                  {rental.hasBackupPower && (
                    <div className="flex items-center text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full text-sm font-medium">
                      <Battery className="h-4 w-4 mr-2" /> Backup Power
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Section */}
              <div className="border-t border-gray-100 pt-8">
                {isOwner ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">
                        This is your listing
                      </h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        You cannot book your own device. Manage this listing
                        from your dashboard.
                      </p>
                      <Link
                        href={`/user/dashboard/?tab=rentals`}
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                      >
                        Manage Listing
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Book this Device
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Time
                        </label>
                        <input
                          type="datetime-local"
                          value={
                            startDate
                              ? startDate.toISOString().slice(0, 16)
                              : ""
                          }
                          onChange={(e) =>
                            setStartDate(
                              e.target.value ? new Date(e.target.value) : null
                            )
                          }
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
                          min={new Date().toISOString().slice(0, 16)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Time
                        </label>
                        <input
                          type="datetime-local"
                          value={
                            endDate ? endDate.toISOString().slice(0, 16) : ""
                          }
                          onChange={(e) =>
                            setEndDate(
                              e.target.value ? new Date(e.target.value) : null
                            )
                          }
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
                          min={
                            startDate
                              ? startDate.toISOString().slice(0, 16)
                              : new Date().toISOString().slice(0, 16)
                          }
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleBookNow}
                      disabled={isBooking}
                      className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {isBooking ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Processing Request...
                        </>
                      ) : (
                        "Request to Book"
                      )}
                    </button>
                    <p className="text-xs text-center text-gray-500">
                      You won't be charged until the owner accepts your request.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-8 lg:p-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <MapPin className="h-6 w-6 mr-2 text-green-600" />
            Location
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <GoogleMap
                lat={rental.locationLat}
                lng={rental.locationLng}
                address={rental.locationAddress}
              />
            </div>
            <div className="bg-gray-50 rounded-2xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Address
              </h4>
              <p className="text-gray-600 mb-4">{rental.locationAddress}</p>
              <p className="text-gray-600 font-medium">{rental.locationCity}</p>
              <div className="mt-6">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${rental.locationLat},${rental.locationLng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
                >
                  Get Directions <ChevronRight className="h-4 w-4 ml-1" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
