"use client";

import React from "react";
import dynamic from "next/dynamic";

// Dynamically import the virtual office canvas content to avoid SSR errors
const VirtualOfficeHeroContent = dynamic(
  () => import("./VirtualOfficeHeroContent"),
  {
    ssr: false,
    // No full-screen loading overlay — the carousel remains visible while loading.
    // A small bottom-left progress badge inside VirtualOfficeHeroContent handles feedback.
    loading: () => null,
  }
);

interface VirtualOfficeHeroProps {
  carouselVisible: boolean;
  onCarouselToggle: () => void;
}

export default function VirtualOfficeHero({
  carouselVisible,
  onCarouselToggle,
}: VirtualOfficeHeroProps) {
  return (
    <VirtualOfficeHeroContent
      carouselVisible={carouselVisible}
      onCarouselToggle={onCarouselToggle}
    />
  );
}
