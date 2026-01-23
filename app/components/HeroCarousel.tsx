"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import { motion, AnimatePresence } from "framer-motion";
import { Outfit, Inter } from "next/font/google";
import ArrowButton from "./ArrowButton";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});
const inter = Inter({
  subsets: ["latin"],
  weight: "400",
});

const slides = [
  {
    id: 1,
    title: "Bravework Studio",
    subtitle: "Innovative Web, Mobile & 3D Solutions",
    description:
      "Your one-stop-shop to create blazing-fast apps and stunning 3D visualizations.",
    cta: "Get Started",
    link: "/studio",
    textColor: "text-white",
    gradient: "from-black via-gray-900 to-black",
  },
  {
    id: 2,
    title: "Bravework Academy",
    subtitle: "Master Digital Skills with Expert Courses",
    description:
      "Professional courses in web dev, UI/UX, and 3D. Certified and flexible learning.",
    cta: "Browse Courses",
    link: "/academy",
    textColor: "text-blue-50",
    gradient: "from-blue-950 via-black to-blue-950",
  },
  {
    id: 3,
    title: "Bravework Kids",
    subtitle: "Fun Edutainment for Young Creators",
    description:
      "Empowering ages 7+ with creative tech skills in a fun, engaging environment.",
    cta: "Start Learning",
    link: "/kids",
    textColor: "text-purple-50",
    gradient: "from-purple-950 via-black to-purple-950",
  },
  {
    id: 4,
    title: "Bravework Rentals",
    subtitle: "High-Spec Hardware at Your Fingertips",
    description:
      "Rent pro-grade PCs, rendering rigs, and digital tablets. Empowering your creative process.",
    cta: "Rent Gear",
    link: "/academy/rentals",
    textColor: "text-green-50",
    gradient: "from-green-950 via-black to-green-950",
  },
];

export default function HeroCarousel() {
  return (
    <div className="w-full h-full relative group hero-carousel">
      <Swiper
        spaceBetween={0}
        centeredSlides={true}
        effect={"fade"}
        loop={true}
        autoplay={{
          delay: 6000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        navigation={true}
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        className="mySwiper h-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div
              className={`relative w-full h-full flex items-center justify-center text-center bg-gradient-to-tr ${slide.gradient}`}
            >
              {/* Decorative elements */}
              <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]" />
              </div>

              <div className="relative z-10 p-6 max-w-5xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <span
                    className={`inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-sm font-bold uppercase tracking-widest mb-6 ${slide.textColor} border border-white/10`}
                  >
                    {slide.subtitle}
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                  className={`text-5xl sm:text-7xl lg:text-9xl font-black text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] tracking-tight mb-8 ${outfit.className}`}
                >
                  {slide.title}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                  className={`text-xl sm:text-2xl lg:text-3xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed ${inter.className}`}
                >
                  {slide.description}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="flex flex-wrap justify-center gap-4"
                >
                  <ArrowButton label={slide.cta} link={slide.link} />
                </motion.div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        .hero-carousel .swiper-pagination-bullet {
          background: rgba(255, 255, 255, 0.5);
          width: 12px;
          height: 12px;
          transition: all 0.3s ease;
        }
        .hero-carousel .swiper-pagination-bullet-active {
          background: #22c55e;
          width: 32px;
          border-radius: 6px;
        }
        .hero-carousel .swiper-button-next,
        .hero-carousel .swiper-button-prev {
          color: white;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(4px);
          width: 50px;
          height: 50px;
          border-radius: 50%;
          opacity: 0;
          transition: all 0.3s ease;
        }
        .hero-carousel:hover .swiper-button-next,
        .hero-carousel:hover .swiper-button-prev {
          opacity: 1;
        }
        .hero-carousel .swiper-button-next:after,
        .hero-carousel .swiper-button-prev:after {
          font-size: 20px;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}
