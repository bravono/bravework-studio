"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Lightbulb, Compass, Loader2, GripHorizontal, Layers, EyeOff } from "lucide-react";
import Experience from "./Experience/Experience";

interface VirtualOfficeHeroContentProps {
  carouselVisible: boolean;
  onCarouselToggle: () => void;
}

export default function VirtualOfficeHeroContent({ carouselVisible, onCarouselToggle }: VirtualOfficeHeroContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [activeMode, setActiveMode] = useState<"day" | "night" | "neutral">("night");

  const { data: session } = useSession();
  const isAdmin = session?.user?.roles?.includes("admin");

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize the Three.js Experience
    const exp: any = new Experience({
      targetElement: containerRef.current,
      isAdmin: isAdmin,
      onProgress: (p: number) => {
        setProgress(Math.round(p * 100));
      },
      onReady: () => {
        setIsReady(true);
        // Start a gentle entrance camera animation on load
        const camera = exp.camera;
        const navigation = exp.navigation;
        if (navigation && navigation.view && navigation.view.spherical) {
          // Camera starts far and pans in
          navigation.view.spherical.value.radius = 45;
          gsap.to(navigation.view.spherical.value, {
            radius: 22,
            duration: 2.5,
            ease: "power2.out",
          });
        }
      },
    });

    return () => {
      exp.destroy();
    };
  }, []);

  const handleModeChange = (mode: "day" | "night" | "neutral") => {
    setActiveMode(mode);
    const exp: any = Experience.instance;
    if (!exp || !exp.world || !exp.world.baked) return;

    const material = exp.world.baked.model.material;
    if (!material || !material.uniforms) return;

    // Smoothly animate shader mix factors using GSAP
    if (mode === "day") {
      gsap.to(material.uniforms.uNightMix, { value: 0, duration: 1.2, ease: "power2.inOut" });
      gsap.to(material.uniforms.uNeutralMix, { value: 0, duration: 1.2, ease: "power2.inOut" });
    } else if (mode === "night") {
      gsap.to(material.uniforms.uNightMix, { value: 1, duration: 1.2, ease: "power2.inOut" });
      gsap.to(material.uniforms.uNeutralMix, { value: 0, duration: 1.2, ease: "power2.inOut" });
    } else if (mode === "neutral") {
      gsap.to(material.uniforms.uNightMix, { value: 0, duration: 1.2, ease: "power2.inOut" });
      gsap.to(material.uniforms.uNeutralMix, { value: 1, duration: 1.2, ease: "power2.inOut" });
    }
  };

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-black select-none">
      {/* 3D Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* Bottom-left loading progress badge — only while office is loading */}
      <AnimatePresence>
        {!isReady && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.4 }}
            className="absolute bottom-6 left-6 z-50 flex flex-col gap-2 bg-black/50 backdrop-blur-xl border border-white/10 px-4 py-3 rounded-2xl shadow-2xl pointer-events-none"
          >
            <div className="flex items-center gap-2">
              <Loader2 size={13} className="animate-spin text-green-400 shrink-0" />
              <span className="text-[11px] font-semibold text-gray-300 tracking-wide whitespace-nowrap">
                Loading Virtual Office
              </span>
              <span className="text-[11px] font-mono text-green-400 ml-1">{progress}%</span>
            </div>
            {/* Thin progress bar */}
            <div className="w-full h-[3px] bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-green-500 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Helper Hint — shown after load, disappears on hover */}
      {/* Wrapper uses flex justify-center so Framer Motion's y-transform
          doesn't conflict with Tailwind's -translate-x-1/2 on the same element */}
      <AnimatePresence>
        {isReady && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute bottom-6 left-0 right-0 z-40 flex justify-center pointer-events-none"
          >
            <div className="bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center gap-2 text-xs text-gray-300 whitespace-nowrap transition-opacity duration-500 hover:opacity-0">
              <Compass size={14} className="text-green-400 animate-pulse shrink-0" />
              <span>Drag to look around • Hold Ctrl or Shift + Scroll to zoom</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Draggable Glassmorphic Light Mode Switcher Controls */}
      <AnimatePresence>
        {isReady && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 20 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            drag
            dragConstraints={containerRef}
            dragElastic={0.1}
            dragMomentum={false}
            whileDrag={{ scale: 1.05 }}
            className="absolute top-20 right-4 sm:top-24 sm:right-6 z-40 flex flex-col gap-2 bg-black/25 backdrop-blur-xl border border-white/10 p-2.5 rounded-2xl shadow-2xl hover:bg-black/35 hover:border-white/20 transition-colors cursor-grab active:cursor-grabbing touch-none select-none"
          >
            {/* Header */}
            <div className="flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing pb-1.5 border-b border-white/10">
              <GripHorizontal size={14} className="text-gray-400/80 hover:text-green-400 transition-colors" />
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-green-400 text-center">
                Controls
              </span>
            </div>

            {/* Lighting buttons */}
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => handleModeChange("day")}
                className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-300 hover:scale-[1.05] ${
                  activeMode === "day"
                    ? "bg-green-500/25 border-green-400/60 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.25)]"
                    : "bg-white/5 border-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
                title="Day Mode"
              >
                <Sun size={16} />
              </button>
              <button
                onClick={() => handleModeChange("night")}
                className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-300 hover:scale-[1.05] ${
                  activeMode === "night"
                    ? "bg-green-500/25 border-green-400/60 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.25)]"
                    : "bg-white/5 border-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
                title="Night Mode"
              >
                <Moon size={16} />
              </button>
              <button
                onClick={() => handleModeChange("neutral")}
                className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-300 hover:scale-[1.05] ${
                  activeMode === "neutral"
                    ? "bg-green-500/25 border-green-400/60 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.25)]"
                    : "bg-white/5 border-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
                title="Neutral Mode"
              >
                <Lightbulb size={16} />
              </button>
            </div>

            {/* Divider */}
            <div className="border-t border-white/10 pt-1.5">
              {/* Carousel Toggle Switch */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCarouselToggle();
                }}
                title={carouselVisible ? "Hide Carousel" : "Show Carousel"}
                className={`w-full flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all duration-300 ${
                  carouselVisible
                    ? "bg-white/5 border-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
                    : "bg-green-500/25 border-green-400/60 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.25)]"
                }`}
              >
                {carouselVisible ? <Layers size={15} /> : <EyeOff size={15} />}
                {/* Mini toggle pill */}
                <div className={`relative w-8 h-4 rounded-full border transition-colors duration-300 ${
                  carouselVisible ? "bg-green-500/80 border-green-400/60" : "bg-white/10 border-white/10"
                }`}>
                  <span className={`absolute top-0.5 w-3 h-3 rounded-full transition-all duration-300 ${
                    carouselVisible
                      ? "left-[18px] bg-white shadow-sm"
                      : "left-0.5 bg-gray-400"
                  }`} />
                </div>
                <span className="text-[8px] uppercase tracking-wider font-bold leading-none">
                  {carouselVisible ? "Overlay" : "Hidden"}
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
