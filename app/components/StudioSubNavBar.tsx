"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Info, Sparkles, Briefcase, FileText, Mail, Home } from "lucide-react";

const studioLinks = [
  { label: "Studio Home", href: "/studio", icon: Home, color: "bg-green-600" },
  {
    label: "Services",
    href: "/studio/services",
    icon: Sparkles,
    color: "bg-emerald-600",
  },
  {
    label: "Portfolio",
    href: "/studio/portfolio",
    icon: Briefcase,
    color: "bg-teal-600",
  },
  {
    label: "Resources",
    href: "/studio/resources",
    icon: FileText,
    color: "bg-cyan-600",
  },
  {
    label: "Get a Quote",
    href: "/studio/contact",
    icon: Mail,
    color: "bg-blue-600",
  },
];

export default function StudioSubNavBar() {
  const pathname = usePathname();

  return (
    <div className="bg-gray-950/90 backdrop-blur-xl border-b border-gray-800 py-3 sticky top-20 z-40 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 font-bold text-xs sm:text-sm">
          {studioLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`relative flex items-center gap-1.5 px-5 py-2.5 rounded-full transition-all duration-300 ${
                  isActive
                    ? "text-white shadow-lg shadow-green-900/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="studioNavItem"
                    className={`absolute inset-0 ${link.color} rounded-full -z-10`}
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <link.icon
                  className={`w-4 h-4 ${
                    isActive
                      ? "text-white"
                      : "text-gray-500 group-hover:text-gray-300"
                  }`}
                />
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
