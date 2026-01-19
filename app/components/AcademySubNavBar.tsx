"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Info, BookOpen, GraduationCap, Box, Home } from "lucide-react";

const academyLinks = [
  { label: "Home", href: "/academy", icon: Home, color: "bg-blue-600" },
  {
    label: "About",
    href: "/academy/about",
    icon: Info,
    color: "bg-indigo-600",
  },
  {
    label: "Courses",
    href: "/academy/courses",
    icon: BookOpen,
    color: "bg-emerald-600",
  },
  {
    label: "Bundles",
    href: "/academy/bundles",
    icon: Box,
    color: "bg-violet-600",
  },
  {
    label: "Certifications",
    href: "/academy/certifications",
    icon: GraduationCap,
    color: "bg-amber-600",
  },
];

export default function AcademySubNavBar() {
  const pathname = usePathname();

  return (
    <div className="bg-white/90 backdrop-blur-xl border-b border-gray-100 py-3 sticky top-20 z-40 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 font-bold text-xs sm:text-sm">
          {academyLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`relative flex items-center gap-1.5 px-5 py-2.5 rounded-full transition-all duration-300 ${
                  isActive
                    ? "text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="academyNavItem"
                    className={`absolute inset-0 ${link.color} rounded-full -z-10`}
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <link.icon
                  className={`w-4 h-4 ${
                    isActive ? "text-white" : "text-gray-400"
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
