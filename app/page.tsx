"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { Outfit, Inter } from "next/font/google";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import TestimonialCarousel from "./components/TestimonialCarousel";
import { services } from "./services/localDataService";
import { ArrowRight, Gamepad2, GraduationCap } from "lucide-react";
import HeroCarousel from "./components/HeroCarousel";
import VirtualOfficeHero from "../components/VirtualOfficeHero";
import EcosystemSection from "./components/EcosystemSection";
import FloatingCTAs from "./components/FloatingCTAs";
import Link from "next/link";
import ArrowButton from "./components/ArrowButton";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});
const inter = Inter({
  subsets: ["latin"],
  weight: "400",
});

// Array of taglines to cycle through
const taglines = [
  "blazing-fast web apps with Next.js, React, Node.js, and modern databases",
  "stunning 3D product visualizations that sell your vision",
  "authentic African-accent voice-overs that give your brand a bold identity",
  "game-ready 3D assets and props that bring virtual worlds to life",
  "sleek Mobile App MVPs that launch your idea fast and smart",
  "lifelike 3D human characters with expert modeling and texturing",
  "fast, engaging 3D explainer videos that captivate and convert",
];

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [currentTaglineIndex, setCurrentTaglineIndex] = useState(0);
  const [showRedirectPrompt, setShowRedirectPrompt] = useState(false);
  const [carouselVisible, setCarouselVisible] = useState(true);

  // Prompt logged-in student users to redirect to dashboard
  useEffect(() => {
    if (session?.user.roles.includes("student")) {
      const hasVisited = sessionStorage.getItem("visit");
      if (!hasVisited) {
        setShowRedirectPrompt(true);
      }
    }
  }, [session]);

  // Effect to cycle through the taglines every 5 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTaglineIndex((prevIndex) => (prevIndex + 1) % taglines.length);
    }, 5000); // Change tagline every 5 seconds

    // Cleanup the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <main>
      {/* Hero Section */}
      <section className="relative w-full h-screen overflow-hidden bg-black">
        <VirtualOfficeHero
          carouselVisible={carouselVisible}
          onCarouselToggle={() => setCarouselVisible((v) => !v)}
        />
        <HeroCarousel visible={carouselVisible} />
      </section>

      {/* Ecosystem Section */}
      <EcosystemSection />

      {/* Services Section */}
      <section
        id="services"
        className="py-24 bg-gray-950 border-y border-gray-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className={`text-4xl sm:text-6xl font-black mb-4 text-white drop-shadow-lg ${outfit.className}`}
            >
              Our Services
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Comprehensive digital solutions ranging from enterprise software
              to creative edutainment.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-gray-900/50 backdrop-blur-xl rounded-3xl p-8 text-center transform transition duration-500 hover:scale-[1.02] hover:bg-gray-900 border border-gray-800 group relative overflow-hidden"
              >
                {service.kidFriendly && (
                  <div className="absolute top-4 right-4 animate-pulse">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <Gamepad2 size={12} />
                      KID-FRIENDLY
                    </span>
                  </div>
                )}

                <div className="mb-4 inline-block p-4 rounded-full text-6xl">
                  {/* Assuming service.icon is a React component or string */}
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-green-400 transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-400 text-lg mb-6 leading-relaxed">
                  {service.description}
                </p>
                <div className="flex flex-col items-center gap-4">
                  <a
                    href={
                      service.title === "Training Services"
                        ? "/academy"
                        : `/order?service=${encodeURIComponent(service.title)}`
                    }
                    className="inline-flex items-center text-green-600 font-semibold hover:text-green-500 transition-colors duration-200 group"
                  >
                    Order Service
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </a>

                  {service.kidFriendly &&
                    service.title === "3D Modeling & Animation" && (
                      <Link
                        href="/kids"
                        className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 border-b border-purple-400/30 pb-0.5"
                      >
                        View Kid-Friendly Version
                      </Link>
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialCarousel />

      <ArrowButton
        label={"Join the Academy"}
        link={"/academy"}
        style={"my-16"}
      />

      {/* Floating CTAs */}
      <FloatingCTAs />

      {/* Redirection Modal */}
      <AnimatePresence>
        {showRedirectPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 text-center space-y-6"
            >
              <div className="mx-auto w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shadow-inner">
                <GraduationCap size={36} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-gray-900 leading-tight">
                  Welcome Back!
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed font-medium">
                  Would you like to head over to your student dashboard to continue your learning journey?
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => {
                    sessionStorage.setItem("visit", "true");
                    setShowRedirectPrompt(false);
                    router.push("/user/dashboard");
                  }}
                  className="flex-1 py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-500/20 text-sm flex items-center justify-center gap-2"
                >
                  Go to Dashboard <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => {
                    sessionStorage.setItem("visit", "true");
                    setShowRedirectPrompt(false);
                  }}
                  className="flex-1 py-3.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl transition-all border border-gray-200 text-sm"
                >
                  Stay on Home Page
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
