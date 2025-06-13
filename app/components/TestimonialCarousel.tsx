"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { testimonials } from "../services/localDataService";
import { Nosifer } from "next/font/google";

const nosifer = Nosifer({ subsets: ["latin"], weight: "400" });

export default function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Auto-advance testimonials
  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) {
      const timer = setInterval(() => {
        setDirection(1);
        setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
      }, 15000);
      return () => clearInterval(timer);
    }
  }, []);

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

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex(
      (prevIndex) =>
        (prevIndex + newDirection + testimonials.length) % testimonials.length
    );
  };

  return (
    <section className="testimonials-carousel">
      <div className="container">
        <h2 className={`section-title ${nosifer.className}`}>What Our Clients Say</h2>
        <div className="carousel-container">
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
              className="testimonial-card"
            >
              <div className="testimonial-image">
                <Image
                  src={testimonials[currentIndex].avatar}
                  alt={testimonials[currentIndex].heading}
                  width={120}
                  height={120}
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className="testimonial-content">
                <div className="testimonial-body">
                  <h3>{testimonials[currentIndex].heading}</h3>
                  <p>{testimonials[currentIndex].body}</p>
                </div>
                <div className="testimonial-info">
                  <span className="company-name">
                    {testimonials[currentIndex].companyName}
                  </span>
                  <span className="email">
                    {testimonials[currentIndex].email}
                  </span>
                </div>
                <a
                  href={`/testimonial/${testimonials[currentIndex].id}`}
                  className="read-more"
                >
                  Read Their Story
                </a>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="carousel-dots">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentIndex ? "active" : ""}`}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
