"use client";

import React, { useState, useEffect, useRef } from "react";
import Modal from "./Modal";
import { MapPin, Search, Navigation } from "lucide-react";

interface LocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (lat: number, lng: number, address?: string) => void;
  initialLat?: number;
  initialLng?: number;
}

export default function LocationPicker({
  isOpen,
  onClose,
  onConfirm,
  initialLat = 6.5244, // Default to Lagos
  initialLng = 3.3792,
}: LocationPickerProps) {
  const [coords, setCoords] = useState({ lat: initialLat, lng: initialLng });
  const [address, setAddress] = useState("");
  const mapRef = useRef<HTMLDivElement>(null);

  // Since we don't have a public API key for JS picking easily accessible,
  // we'll provide a high-fidelity manual coordinate picker with a preview.
  // In a production app, this would use the Google Maps JS API with a key.

  const handleConfirm = () => {
    onConfirm(coords.lat, coords.lng, address);
    onClose();
  };

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pick Precise Location">
      <div className="space-y-4">
        <p className="text-sm text-gray-500">
          Enter coordinates or use your current location for the most precise
          results.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Latitude
            </label>
            <input
              type="number"
              step="any"
              value={coords.lat}
              onChange={(e) =>
                setCoords((prev) => ({
                  ...prev,
                  lat: parseFloat(e.target.value),
                }))
              }
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Longitude
            </label>
            <input
              type="number"
              step="any"
              value={coords.lng}
              onChange={(e) =>
                setCoords((prev) => ({
                  ...prev,
                  lng: parseFloat(e.target.value),
                }))
              }
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Optional: Note for this location (e.g. "Third Floor", "Red Gate")
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Help users find you..."
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
          />
        </div>

        <button
          onClick={useCurrentLocation}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors text-sm font-medium"
        >
          <Navigation className="h-4 w-4" />
          Use My Current Location
        </button>

        <div className="rounded-xl overflow-hidden border border-gray-200 h-48 bg-gray-50 relative">
          <iframe
            width="100%"
            height="100%"
            style={{ border: 0 }}
            src={`https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed`}
          />
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-medium text-gray-500 border border-gray-200">
            Preview
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-lg shadow-green-200 transition-all font-bold"
          >
            Confirm Location
          </button>
        </div>
      </div>
    </Modal>
  );
}
