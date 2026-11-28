"use client";

import React from "react";
import { motion } from "framer-motion";

export default function WhatsAppButton() {
  const whatsappNumber = "2349023224596";
  const message =
    "Hello Bravework Studio, I would like to inquiry about your services.";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-2">
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative group flex items-center gap-3"
        initial={{ scale: 0, rotate: -20, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.5,
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Tooltip-like label */}
        <span className="bg-white/95 backdrop-blur-sm border border-gray-100 text-gray-800 px-4 py-2 rounded-2xl text-xs font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0 hidden md:block">
          Chat with us on <span className="text-[#25D366]">WhatsApp</span>
        </span>

        {/* WhatsApp Icon Circle */}
        <div className="relative">
          {/* Animated rings for premium feel */}
          <span className="absolute -inset-1 rounded-full bg-[#25D366]/20 animate-pulse"></span>
          <span className="absolute -inset-2 rounded-full bg-[#25D366]/10 animate-ping [animation-duration:3s]"></span>

          <div className="relative bg-[#25D366] text-white w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-2 border-white/20 flex items-center justify-center transition-all duration-500 group-hover:bg-[#128C7E] group-hover:shadow-[0_0_25px_rgba(37,211,102,0.4)]">
            <i className="fa-brands fa-whatsapp text-3xl sm:text-4xl"></i>
          </div>
        </div>
      </motion.a>
    </div>
  );
}
