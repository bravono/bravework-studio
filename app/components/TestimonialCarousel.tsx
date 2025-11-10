"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { testimonials } from "../services/localDataService";
import { Nosifer } from "next/font/google";

const nosifer = Nosifer({ subsets: ["latin"], weight: "400" });

// SVG icon for the left arrow
const ChevronLeftIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m15 18-6-6 6-6" />
  </svg>
);

// SVG icon for the right arrow
const ChevronRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
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

export default function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Auto-advance testimonials for non-mobile devices
  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) {
      const timer = setInterval(() => {
        setDirection(1);
        setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
      }, 15000);
      return () => clearInterval(timer);
    }
  }, [testimonials.length]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = useCallback(
    (newDirection: number) => {
      setDirection(newDirection);
      setCurrentIndex(
        (prevIndex) =>
          (prevIndex + newDirection + testimonials.length) % testimonials.length
      );
    },
    [testimonials.length]
  );

  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-16 sm:py-24">
      <div className="container mx-auto px-4 text-center">
        <h2
          className={`text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-12 drop-shadow ${nosifer.className}`}
        >
          What Our Clients Say
        </h2>
        <div className="relative flex items-center justify-center  ">
          {/* Previous Testimonial Button */}
          <button
            className="absolute left-0 z-10 p-3 text-white bg-green-600 rounded-full hover:bg-indigo-600 transition-all duration-300 shadow-lg hidden sm:block"
            onClick={() => paginate(-1)}
            aria-label="Previous Testimonial"
          >
            <ChevronLeftIcon />
          </button>

          <div className="relative w-full max-w-4xl min-h-[400px] flex items-center justify-center">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.5 },
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = swipePower(offset.x, velocity.x);

                  if (swipe < -swipeConfidenceThreshold) {
                    paginate(1);
                  } else if (swipe > swipeConfidenceThreshold) {
                    paginate(-1);
                  }
                }}
                className="absolute inset-0 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 sm:p-12 flex flex-col justify-center items-center"
              >
                <div className="absolute -top-10 mb-8 flex-shrink-0">
                  <img
                    src={testimonials[currentIndex].avatar}
                    alt={testimonials[currentIndex].heading}
                    width={120}
                    height={120}
                    className="rounded-full border-4 border-green-500 shadow-lg object-cover"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className="flex flex-col items-center">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                    &ldquo;{testimonials[currentIndex].heading}&rdquo;
                  </h3>
                  <p className="line-clamp-3 w-full text-lg text-gray-600 dark:text-gray-300 leading-relaxed italic text-center mb-4">
                    {testimonials[currentIndex].body}
                  </p>
                  <div className="text-center">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 block">
                      {testimonials[currentIndex].companyName}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 block">
                      {testimonials[currentIndex].email}
                    </span>
                  </div>
                  <a
                    href={`/testimonial/${testimonials[currentIndex].id}`}
                    className="mt-2 inline-block bg-green-600 text-white font-semibold py-2 px-6 rounded-full shadow-lg hover:bg-indigo-600 transition-colors duration-300"
                  >
                    Read Their Story
                  </a>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Next Testimonial Button */}
          <button
            className="absolute right-0 z-10 p-3 text-white bg-green-600 rounded-full hover:bg-indigo-600 transition-all duration-300 shadow-lg hidden sm:block"
            onClick={() => paginate(1)}
            aria-label="Next Testimonial"
          >
            <ChevronRightIcon />
          </button>
        </div>

        {/* Carousel Dots */}
        <div className="flex justify-center mt-12 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                index === currentIndex
                  ? "bg-green-600 scale-125"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
