"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamically import the virtual office canvas content to avoid SSR errors
const VirtualOfficeHeroContent = dynamic(
  () => import("./VirtualOfficeHeroContent"),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black">
        <Loader2 className="h-10 w-10 animate-spin text-green-500" />
        <h2 className="text-xl font-bold text-white tracking-wide mt-4">
          Loading Virtual Office...
        </h2>
      </div>
    ),
  }
);

export default function VirtualOfficeHero() {
  return <VirtualOfficeHeroContent />;
}
