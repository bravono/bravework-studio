"use client";

import React from "react";
import { Outfit, Inter } from "next/font/google";
import { Briefcase, Award, GraduationCap, Wrench, Smile } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});
const inter = Inter({
  subsets: ["latin"],
  weight: "400",
});

interface StatItemProps {
  end: number;
  label: string;
  icon: React.ComponentType<any>;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}

function StatCard({ end, label, icon: Icon, colorClass, bgClass, borderClass }: StatItemProps) {
  const { count, ref } = useCountUp(end, 2500);

  return (
    <div
      ref={ref}
      className={`p-6 bg-gray-900/40 backdrop-blur-xl rounded-[2rem] border ${borderClass} text-center flex flex-col items-center justify-center transition-all duration-300 hover:scale-[1.03] hover:bg-gray-900/60 h-full`}
    >
      <div className={`w-12 h-12 rounded-2xl ${bgClass} ${colorClass} flex items-center justify-center mb-4`}>
        <Icon size={24} />
      </div>
      <h3 className={`text-3xl sm:text-4xl font-black text-white mb-1 ${outfit.className}`}>
        {count}+
      </h3>
      <p className={`text-gray-400 text-xs font-bold uppercase tracking-wider ${inter.className}`}>
        {label}
      </p>
    </div>
  );
}

export default function StatsSection() {
  const stats = [
    {
      end: 8,
      label: "Years Exp.",
      icon: Briefcase,
      colorClass: "text-blue-500",
      bgClass: "bg-blue-500/10",
      borderClass: "border-blue-500/10 hover:border-blue-500/30",
    },
    {
      end: 100,
      label: "Projects",
      icon: Award,
      colorClass: "text-green-500",
      bgClass: "bg-green-500/10",
      borderClass: "border-green-500/10 hover:border-green-500/30",
    },
    {
      end: 500,
      label: "Students",
      icon: GraduationCap,
      colorClass: "text-purple-500",
      bgClass: "bg-purple-500/10",
      borderClass: "border-purple-500/10 hover:border-purple-500/30",
    },
    {
      end: 15,
      label: "Tech Tools",
      icon: Wrench,
      colorClass: "text-orange-500",
      bgClass: "bg-orange-500/10",
      borderClass: "border-orange-500/10 hover:border-orange-500/30",
    },
    {
      end: 50,
      label: "Happy Clients",
      icon: Smile,
      colorClass: "text-yellow-500",
      bgClass: "bg-yellow-500/10",
      borderClass: "border-yellow-500/10 hover:border-yellow-500/30",
    },
  ];

  return (
    <section className="py-16 bg-black border-y border-gray-900 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={index === 4 ? "col-span-2 md:col-span-1" : "col-span-1"}
            >
              <StatCard {...stat} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
