'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface Testimonial {
  id: number;
  image: string;
  heading: string;
  body: string;
  companyName: string;
  email: string;
}

// Sample testimonials data - replace with your actual testimonials
const testimonials: Testimonial[] = [
  {
    id: 1,
    image: '/Bravework_Studio-Logo_black-Transparent-bg.png',
    heading: 'Outstanding 3D Work',
    body: 'The team at Bravework Studio delivered exceptional 3D models that perfectly captured our vision. Their attention to detail and professional approach made the entire process smooth and enjoyable.',
    companyName: 'Tech Innovations Inc.',
    email: 'john@techinnovations.com'
  },
  {
    id: 2,
    image: '/Bravework_Studio-Logo_black-Transparent-bg.png',
    heading: 'Web Development Excellence',
    body: 'Working with Bravework Studio on our web development project was a game-changer. They created a modern, responsive website that exceeded our expectations.',
    companyName: 'Digital Solutions Ltd.',
    email: 'sarah@digitalsolutions.com'
  },
  {
    id: 3,
    image: '/Bravework_Studio-Logo_black-Transparent-bg.png',
    heading: 'Creative Design Solutions',
    body: 'The creative solutions provided by Bravework Studio helped us stand out in a crowded market. Their innovative approach to design and development is truly impressive.',
    companyName: 'Creative Minds Co.',
    email: 'mike@creativeminds.com'
  }
];

export default function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Auto-advance testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000); // Change testimonial every 5 seconds

    return () => clearInterval(timer);
  }, []);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => (prevIndex + newDirection + testimonials.length) % testimonials.length);
  };

  return (
    <section className="testimonials-carousel">
      <div className="container">
        <h2 className="section-title">What Our Clients Say</h2>
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
                opacity: { duration: 0.2 }
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
                  src={testimonials[currentIndex].image}
                  alt={testimonials[currentIndex].heading}
                  width={120}
                  height={120}
                  style={{ objectFit: 'cover', borderRadius: '50%' }}
                />
              </div>
              <div className="testimonial-content">
                <h3>{testimonials[currentIndex].heading}</h3>
                <p>{testimonials[currentIndex].body}</p>
                <div className="testimonial-info">
                  <span className="company-name">{testimonials[currentIndex].companyName}</span>
                  <span className="email">{testimonials[currentIndex].email}</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          
          <div className="carousel-dots">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentIndex ? 'active' : ''}`}
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