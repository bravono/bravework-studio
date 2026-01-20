"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X, GraduationCap, Gamepad2 } from "lucide-react";

export default function FloatingCTAs() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeBanner, setActiveBanner] = useState<"kids" | "academy" | null>(
    null
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      setActiveBanner(Math.random() > 0.5 ? "kids" : "academy");
    }, 10000); // Show after 10 seconds

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible || !activeBanner) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[100] max-w-[300px]">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, x: -50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.9 }}
            className={`relative p-5 rounded-2xl shadow-2xl border backdrop-blur-xl ${
              activeBanner === "kids"
                ? "bg-purple-900/90 border-purple-500/30"
                : "bg-blue-900/90 border-blue-500/30"
            }`}
          >
            <button
              onClick={() => setIsVisible(false)}
              className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex items-start gap-4">
              <div
                className={`p-3 rounded-xl ${
                  activeBanner === "kids" ? "bg-purple-500" : "bg-blue-500"
                } text-white`}
              >
                {activeBanner === "kids" ? (
                  <Gamepad2 size={24} />
                ) : (
                  <GraduationCap size={24} />
                )}
              </div>

              <div>
                <h4 className="text-white font-bold mb-1">
                  {activeBanner === "kids" ? "For Kids?" : "Upskill Now"}
                </h4>
                <p className="text-gray-300 text-sm mb-3">
                  {activeBanner === "kids"
                    ? "Check our 3D Animation courses for children!"
                    : "Join Bravework Academy and master high-demand tech skills."}
                </p>
                <Link
                  href={activeBanner === "kids" ? "/kids" : "/academy"}
                  className={`inline-block px-4 py-2 rounded-lg text-xs font-bold text-white transition-all active:scale-95 ${
                    activeBanner === "kids"
                      ? "bg-purple-600 hover:bg-purple-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {activeBanner === "kids"
                    ? "Discover Bravework Kids"
                    : "Explore Academy"}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
