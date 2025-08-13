"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { Nosifer, Inter } from "next/font/google";
import { useSession } from "next-auth/react";
import TestimonialCarousel from "./components/TestimonialCarousel";
import ProjectCarousel from "./components/ProjectCarousel";
import { services } from "./services/localDataService";
import { ArrowRight } from "lucide-react";

const nosifer = Nosifer({
  subsets: ["latin"],
  weight: "400",
});
const inter = Inter({
  subsets: ["latin"],
  weight: "400",
});

// Dynamically import the 3D component to avoid SSR issues
const Hero3DComponent = dynamic(() => import("../components/Hero3D"), {
  ssr: false,
});

// Array of taglines to cycle through
const taglines = [
  "Vitalizing Your Vision With 3D and Web Solutions.",
  "Crafting Digital Experiences, One Pixel at a Time.",
  "Bringing Your Ideas to Life in Three Dimensions.",
  "Innovative Web Solutions for a Modern World.",
];

export default function Home() {
  const { data: session } = useSession();
  const [currentTaglineIndex, setCurrentTaglineIndex] = useState(0);

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
        {/* 3D Hero Background */}
        <div className="absolute inset-0 z-0 opacity-40 transition-opacity duration-1000">
          <Suspense fallback={<div className="bg-gray-900 w-full h-full" />}>
            <Canvas
              camera={{
                position: [1, 4.3, 7],
                fov: 50,
              }}
            >
              <ambientLight intensity={1} color={"#b8c971"} />
              <pointLight position={[10, 10, 10]} color={"#b8c971"} />

              <OrbitControls />
              <Hero3DComponent />
            </Canvas>
          </Suspense>
        </div>

        {/* Hero Content positioned over the 3D background */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-4 select-none">
          {session?.user && (
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className={`text-lg sm:text-2xl lg:text-3xl font-semibold text-gray-200 mb-2 ${inter.className}`}
            >
              {`${session?.user?.name.split(" ")[0]}, welcome to`}
            </motion.h1>
          )}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`text-4xl sm:text-6xl lg:text-8xl font-black text-white drop-shadow-lg ${nosifer.className}`}
          >
            Bravework Studio
          </motion.h1>

          {/* Animated tagline that cycles through the array */}
          <AnimatePresence mode="wait">
            <motion.p
              key={currentTaglineIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`mt-4 text-xl sm:text-2xl lg:text-3xl text-gray-300 max-w-2xl px-4 ${inter.className}`}
            >
              {taglines[currentTaglineIndex]}
            </motion.p>
          </AnimatePresence>

          <div className="mt-12">
            <a
              href="/order"
              className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-full shadow-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 group"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </section>

      {/* Project Carousel */}
      <ProjectCarousel />

      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className={`text-4xl font-bold text-center mb-16 text-gray-900 ${nosifer.className}`}
          >
            Our Services
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl shadow-lg p-8 text-center transform transition duration-300 hover:scale-105 hover:shadow-2xl border border-gray-200"
              >
                <div className="text-green-600 mb-4 inline-block p-4 rounded-full bg-green-100">
                  {/* Assuming service.icon is a React component */}
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-lg mb-4">
                  {service.description}
                </p>
                <a
                  href={`/order?service=${encodeURIComponent(service.title)}`}
                  className="inline-flex items-center text-green-600 font-semibold hover:text-green-500 transition-colors duration-200 group"
                >
                  Order Service
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialCarousel />

      <div className="flex justify-center my-16">
        <a
          href="/order"
          className="inline-flex items-center px-10 py-5 border border-transparent text-xl font-bold rounded-full shadow-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 group"
        >
          Get Started
          <ArrowRight className="ml-2 h-6 w-6 transition-transform duration-200 group-hover:translate-x-1" />
        </a>
      </div>
    </main>
  );
}