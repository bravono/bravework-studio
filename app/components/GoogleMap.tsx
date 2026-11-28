"use client";

import React from "react";

interface GoogleMapProps {
  lat: string | number;
  lng: string | number;
  address?: string;
  zoom?: number;
  height?: string;
  className?: string;
}

/**
 * GoogleMap Component
 * Embeds a Google Map using an iframe with coordinates
 */
export default function GoogleMap({
  lat,
  lng,
  address = "Rental Location",
  zoom = 15,
  height = "400px",
  className = "",
}: GoogleMapProps) {
  if (!lat || !lng) {
    return (
      <div className="bg-gray-100 rounded-xl p-8 text-center border-2 border-dashed border-gray-200">
        <p className="text-gray-500">Map coordinates not available</p>
      </div>
    );
  }

  // Google Maps Embed URL using coordinates
  const mapUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;

  return (
    <div
      className={`w-full overflow-hidden rounded-2xl shadow-md border border-gray-100 ${className}`}
    >
      <iframe
        width="100%"
        height={height}
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={mapUrl}
        title={`Map showing ${address}`}
      />
    </div>
  );
}
