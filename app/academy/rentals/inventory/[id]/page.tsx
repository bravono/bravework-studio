"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin,
  Wifi,
  Battery,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import { toast } from "react-toastify";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

import { Rental } from "@/app/types/app";
import { KOBO_PER_NAIRA } from "@/lib/constants";

import GoogleMap from "@/app/components/GoogleMap";
import AcademySubNavBar from "../../../../components/AcademySubNavBar";

export default function AcademyRentalDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [rental, setRental] = useState<Rental | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [duration, setDuration] = useState<number>(1);
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
      // The API returns an array or single object based on route structure sometimes
      const found = Array.isArray(data)
        ? data.find((r: Rental) => r.id === Number(id))
        : data;

      if (found) {
        setRental(found);
      } else {
        toast.error("Rental not found");
        router.push("/academy/rentals/inventory");
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

    if (!startDate || duration <= 0) {
      toast.error("Please select a start date and valid duration");
      return;
    }

    setIsBooking(true);
    try {
      const calculatedEndDate = new Date(
        startDate.getTime() + duration * 60 * 60 * 1000
      );
      const totalAmount = Math.ceil(
        duration * Number((rental?.hourlyRate || 0) / KOBO_PER_NAIRA)
      );

      const res = await fetch("/api/user/rentals/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rentalId: rental?.id,
          startTime: startDate.toISOString(),
          endTime: calculatedEndDate.toISOString(),
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
      <div className="min-h-screen bg-gray-50">
        <AcademySubNavBar />
        <div className="flex justify-center items-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
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
    <div className="min-h-screen bg-gray-50">
      <AcademySubNavBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/academy/rentals/inventory"
          className="mb-8 inline-flex items-center text-sm font-bold text-green-600 hover:gap-2 transition-all"
        >
          <ChevronLeft className="h-5 w-5 mr-1" /> Back to Inventory
        </Link>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image Section */}
            <div className="relative h-96 lg:h-full min-h-[500px] bg-gray-100 p-4">
              <div className="relative h-full w-full rounded-[2rem] overflow-hidden group">
                <img
                  src={images[currentImageIndex]}
                  alt={rental.deviceName}
                  className="w-full h-full object-cover"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur text-gray-900 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur text-gray-900 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                      {images.map((_: any, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`h-2 transition-all rounded-full ${
                            idx === currentImageIndex
                              ? "w-8 bg-green-600"
                              : "w-2 bg-white/50"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Details Section */}
            <div className="p-8 lg:p-16 flex flex-col">
              <div className="mb-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="inline-block px-4 py-1.5 bg-green-50 text-green-700 text-xs font-black uppercase tracking-widest rounded-full mb-4">
                      {rental.deviceType}
                    </span>
                    <h1 className="text-4xl font-black text-gray-900 leading-tight">
                      {rental.deviceName}
                    </h1>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-black text-green-600">
                      ₦
                      {Number(
                        rental.hourlyRate / KOBO_PER_NAIRA
                      ).toLocaleString()}
                    </p>
                    <p className="text-xs font-bold text-gray-400 uppercase mt-1">
                      per hour
                    </p>
                  </div>
                </div>

                <div className="flex items-center text-gray-600 bg-gray-50 p-4 rounded-2xl mb-10">
                  <MapPin className="h-5 w-5 mr-3 text-green-600" />
                  <span className="font-medium text-sm">
                    {rental.locationCity}, {rental.locationAddress}
                  </span>
                </div>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
                      About this Device
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {rental.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
                      Technical Specs
                    </h3>
                    <div className="bg-gray-50 rounded-2xl p-6 text-gray-700 font-mono text-xs border border-gray-100">
                      {rental.specs || "Standard configuration."}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    {rental.hasInternet && (
                      <div className="flex items-center text-blue-700 bg-blue-50/50 px-4 py-2 rounded-xl text-xs font-black border border-blue-100">
                        <Wifi className="h-4 w-4 mr-2" /> FAST WIFI
                      </div>
                    )}
                    {rental.hasBackupPower && (
                      <div className="flex items-center text-amber-700 bg-amber-50/50 px-4 py-2 rounded-xl text-xs font-black border border-amber-100">
                        <Battery className="h-4 w-4 mr-2" /> 24/7 POWER
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Booking Section */}
              <div className="mt-auto pt-10 border-t border-gray-100">
                {isOwner ? (
                  <div className="bg-amber-50 rounded-3xl p-8 border border-amber-100">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                        <AlertCircle size={24} />
                      </div>
                      <div>
                        <h4 className="font-black text-gray-900 mb-2">
                          Owner Dashboard
                        </h4>
                        <p className="text-sm text-gray-600 mb-6">
                          This is your listing! You can't rent your own gear,
                          but you can manage availability and requests from your
                          portal.
                        </p>
                        <Link
                          href={`/user/dashboard/?tab=rentals`}
                          className="px-6 py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition-all text-sm inline-block shadow-lg shadow-amber-600/20"
                        >
                          Manage Listing
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="flex items-center gap-3">
                      <Zap className="text-green-600" size={20} />
                      <h3 className="text-xl font-black text-gray-900">
                        Reserve this Device
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
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
                          className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 font-medium"
                          min={new Date().toISOString().slice(0, 16)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                          Duration (Hours)
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={duration}
                          onChange={(e) =>
                            setDuration(
                              Math.max(1, parseInt(e.target.value) || 1)
                            )
                          }
                          className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 font-medium"
                        />
                      </div>
                    </div>

                    <div className="bg-gray-900 rounded-3xl p-8 text-white">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-gray-400 font-bold">
                          Total Estimate
                        </span>
                        <span className="text-3xl font-black text-green-500">
                          ₦
                          {Number(
                            duration * (rental.hourlyRate / KOBO_PER_NAIRA)
                          ).toLocaleString()}
                        </span>
                      </div>
                      <button
                        onClick={handleBookNow}
                        disabled={isBooking}
                        className="w-full py-5 bg-green-600 text-white font-black rounded-2xl hover:bg-green-500 transition-all shadow-xl shadow-green-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                      >
                        {isBooking ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Processing...
                          </>
                        ) : (
                          "Confirm Booking Request"
                        )}
                      </button>
                      <p className="text-[10px] text-center text-gray-400 mt-4 uppercase tracking-[0.2em] font-bold">
                        Payment holds applied upon owner acceptance
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="mt-12 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 lg:p-16">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-3xl font-black text-gray-900 flex items-center">
              <MapPin className="h-8 w-8 mr-4 text-green-600" />
              Service Location
            </h3>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${rental.locationLat},${rental.locationLng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-gray-50 text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-all text-sm border border-gray-200 flex items-center gap-2"
            >
              Get Directions <ChevronRight size={16} />
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 rounded-[2rem] overflow-hidden border border-gray-100 shadow-inner h-[400px]">
              <GoogleMap
                lat={rental.locationLat}
                lng={rental.locationLng}
                address={rental.locationAddress}
              />
            </div>
            <div className="flex flex-col justify-center space-y-8">
              <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
                  Full Address
                </h4>
                <p className="text-gray-900 font-black text-lg mb-2">
                  {rental.locationCity}
                </p>
                <p className="text-gray-600 leading-relaxed">
                  {rental.locationAddress}
                </p>
              </div>
              <div className="p-8 bg-green-50 rounded-[2rem] border border-green-100">
                <h4 className="font-bold text-green-800 mb-2">Safety Tip</h4>
                <p className="text-sm text-green-700 leading-relaxed">
                  Always inspect the hardware thoroughly during pickup. Verify
                  all peripherals and connectivity before confirming receipt.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
