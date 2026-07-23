"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { gsap } from "gsap";
import { motion } from "framer-motion";
import { Sun, Moon, Lightbulb, Compass, Loader2, GripHorizontal } from "lucide-react";
import Experience from "./Experience/Experience";

export default function VirtualOfficeHeroContent() {
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

      {/* Loading Overlay */}
      {!isReady && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black transition-opacity duration-700">
          <div className="flex flex-col items-center gap-6 max-w-sm px-6 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-green-500" />
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">
                Configuring Virtual Workspace
              </h2>
              <p className="text-sm text-gray-400 mt-2">
                Loading assets and compiling shaders...
              </p>
            </div>
            {/* Progress Bar */}
            <div className="w-48 h-1.5 bg-gray-900 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-mono text-green-500">{progress}%</span>
          </div>
        </div>
      )}

      {/* Interactive Helper Hint */}
      {isReady && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center gap-2 text-xs text-gray-300 pointer-events-none transition-opacity duration-500 hover:opacity-0">
          <Compass size={14} className="text-green-400 animate-pulse" />
          <span>Drag to look around • Hold Ctrl or Shift + Scroll to zoom</span>
        </div>
      )}

      {/* Draggable Glassmorphic Light Mode Switcher Controls */}
      {isReady && (
        <motion.div
          drag
          dragConstraints={containerRef}
          dragElastic={0.1}
          dragMomentum={false}
          whileDrag={{ scale: 1.05 }}
          className="absolute top-20 right-4 sm:top-24 sm:right-6 z-40 flex flex-col gap-2 bg-black/25 backdrop-blur-xl border border-white/10 p-2.5 rounded-2xl shadow-2xl hover:bg-black/35 hover:border-white/20 transition-colors cursor-grab active:cursor-grabbing touch-none select-none"
        >
          <div className="flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing pb-1 border-b border-white/10">
            <GripHorizontal size={14} className="text-gray-400/80 hover:text-green-400 transition-colors" />
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-green-400 text-center">
              Lighting
            </span>
          </div>
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
        </motion.div>
      )}
    </div>
  );
}
