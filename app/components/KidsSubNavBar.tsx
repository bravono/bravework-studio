"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Info, PlayCircle, Map, Target, Users } from "lucide-react";

const kidsLinks = [
  { label: "Home", href: "/kids", icon: PlayCircle, color: "bg-pink-500" },
  { label: "About", href: "/kids/about", icon: Info, color: "bg-blue-500" },
  {
    label: "Episodes",
    href: "/kids/episodes",
    icon: Map,
    color: "bg-green-500",
  },
  {
    label: "Roadmap",
    href: "/kids/roadmap",
    icon: Target,
    color: "bg-purple-500",
  },
  {
    label: "Join Us",
    href: "/kids/opportunities",
    icon: Users,
    color: "bg-orange-500",
  },
];

export default function KidsSubNavBar() {
  const pathname = usePathname();

  return (
    <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 py-3 sticky top-20 z-40 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 font-bold text-xs sm:text-sm">
          {kidsLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`relative flex items-center gap-1.5 px-4 py-2 rounded-full transition-all duration-300 ${
                  isActive
                    ? "text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="kidsNavItem"
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
