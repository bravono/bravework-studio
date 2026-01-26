"use client";

import React, { useState, useEffect, useRef } from "react";
import { Outfit } from "next/font/google";
import {
  Award,
  Briefcase,
  Smile,
  Rocket,
  Laptop,
  GraduationCap,
  Box,
} from "lucide-react";
import TeamGrid from "../components/TeamGrid";
import Link from "next/link";
import { motion } from "framer-motion";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "700", "900"] });

const useCountUp = (end: number, duration: number) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let frameId: number;

    const animate = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = timestamp - startTimestamp;
      const progressRatio = Math.min(progress / duration, 1);
      const newCount = Math.floor(progressRatio * end);

      setCount(newCount);

      if (progressRatio < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          frameId = requestAnimationFrame(animate);
          if (observerRef.current) {
            observerRef.current.disconnect();
          }
        }
      });
    };

    observerRef.current = new IntersectionObserver(handleIntersect, {
      threshold: 0.5,
    });

    if (ref.current) {
      observerRef.current.observe(ref.current);
    }

    return () => {
      cancelAnimationFrame(frameId);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [end, duration]);

  return { count, ref };
};

export default function About() {
  const { count: yearsCount, ref: yearsRef } = useCountUp(8, 2000);
  const { count: projectsCount, ref: projectsRef } = useCountUp(100, 3000);
  const { count: clientsCount, ref: clientsRef } = useCountUp(50, 2500);

  const arms = [
    {
      title: "Bravework Studio",
      desc: "Professional digital solutions: Web, Mobile, and 3D experiences.",
      icon: Laptop,
      link: "/studio/about",
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Bravework Academy",
      desc: "Empowering African innovation through world-class technical education.",
      icon: GraduationCap,
      link: "/academy/about",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Bravework Kids",
      desc: "Fun, multilingual edutainment for preschoolers (ages 2–6).",
      icon: Rocket,
      link: "/kids/about",
      color: "text-pink-600",
      bg: "bg-pink-50",
    },
    {
      title: "Hardware Rentals",
      desc: "Enabling learning through affordable access to premium tech hardware.",
      icon: Box,
      link: "/academy/rentals/about",
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  return (
    <main className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1
              className={`text-5xl md:text-7xl font-black text-gray-900 mb-6 ${outfit.className}`}
            >
              The Bravework <span className="text-blue-600">Story</span>
            </h1>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto font-medium">
              We are a unified ecosystem driving the Nigerian digital economy
              through creative solutions, education, and accessibility.
            </p>
          </div>
        </div>
      </section>

      {/* Strategy Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2
                className={`text-4xl font-black text-gray-900 ${outfit.className}`}
              >
                Our Mission
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                Bravework Studio empowers the Nigerian digital economy by
                combining practical digital skills training supported by a
                foundational hardware rental service with affordable,
                subscription-based web and mobile development solutions.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                <div
                  ref={yearsRef}
                  className="p-6 bg-blue-50 rounded-2xl border border-blue-100 italic"
                >
                  <Briefcase className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="text-3xl font-black text-gray-900">
                    {yearsCount}+
                  </h3>
                  <p className="text-gray-600 text-sm">Years Exp.</p>
                </div>
                <div
                  ref={projectsRef}
                  className="p-6 bg-green-50 rounded-2xl border border-green-100 italic"
                >
                  <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h3 className="text-3xl font-black text-gray-900">
                    {projectsCount}+
                  </h3>
                  <p className="text-gray-600 text-sm">Projects</p>
                </div>
                <div
                  ref={clientsRef}
                  className="p-6 bg-yellow-50 rounded-2xl border border-yellow-100 italic"
                >
                  <Smile className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <h3 className="text-3xl font-black text-gray-900">
                    {clientsCount}+
                  </h3>
                  <p className="text-gray-600 text-sm">Happy Clients</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-100 h-96 rounded-[3rem] overflow-hidden relative shadow-inner">
              {/* Visual element or image placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                Bravework
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ecosystem Arms */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className={`text-4xl font-black text-gray-900 ${outfit.className}`}
            >
              Our Ecosystem
            </h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto font-medium">
              We operate across four specialized arms, each playing a critical
              role in our unified mission.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {arms.map((arm) => (
              <Link key={arm.title} href={arm.link} className="group">
                <div
                  className={`h-full p-8 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-2`}
                >
                  <div
                    className={`w-14 h-14 ${arm.bg} ${arm.color} rounded-2xl flex items-center justify-center mb-6`}
                  >
                    <arm.icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {arm.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6">
                    {arm.desc}
                  </p>
                  <span className="text-sm font-bold text-blue-600 flex items-center gap-1">
                    Learn more <ChevronRight size={16} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className={`text-4xl font-black text-gray-900 ${outfit.className}`}
            >
              Meet the Team
            </h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto font-medium">
              A diverse group of dreamers, creators, and engineers making it
              happen.
            </p>
          </div>
          <TeamGrid />
        </div>
      </section>
    </main>
  );
}

function ChevronRight({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
