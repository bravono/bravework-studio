"use client";

import React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import { motion } from "framer-motion";
import { testimonials } from "../services/localDataService";
import { Outfit, Inter } from "next/font/google";
import { Quote } from "lucide-react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "700", "900"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500"] });

export default function TestimonialCarousel() {
  return (
    <section className="bg-black py-24 relative overflow-hidden border-t border-white/5">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 rounded-full bg-green-500/10 text-green-400 text-sm font-bold uppercase tracking-widest mb-4 border border-green-500/20"
          >
            Testimonials
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className={`text-4xl sm:text-7xl font-black text-white mb-6 ${outfit.className}`}
          >
            What Our <span className="text-green-500 text-glow">Clients</span> Say
          </motion.h2>
        </div>

        <div className="max-w-6xl mx-auto testimonial-swiper-container">
          <Swiper
            spaceBetween={30}
            centeredSlides={true}
            loop={true}
            autoplay={{
              delay: 8000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            navigation={true}
            onNavigationNext={(swiper) => {
              const testimonial = testimonials[swiper.realIndex];
              if (testimonial) {
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                  event: "testimonial_next_click",
                  testimonial_author: testimonial.companyName,
                  testimonial_heading: testimonial.heading,
                  page: window.location.pathname,
                });
              }
            }}
            onNavigationPrev={(swiper) => {
              const testimonial = testimonials[swiper.realIndex];
              if (testimonial) {
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                  event: "testimonial_prev_click",
                  testimonial_author: testimonial.companyName,
                  testimonial_heading: testimonial.heading,
                  page: window.location.pathname,
                });
              }
            }}
            modules={[Autoplay, Pagination, Navigation]}
            className="mySwiper"
          >
            {testimonials.map((testimonial) => (
              <SwiperSlide key={testimonial.id}>
                <div className="py-12 px-4 sm:px-12">
                  <div className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-[3rem] p-8 sm:p-20 relative shadow-2xl">
                    <Quote className="absolute top-10 right-10 text-white/5 w-24 h-24 lg:w-40 lg:h-40" />
                    
                    <div className="flex flex-col lg:flex-row items-center gap-12 relative z-10 text-center lg:text-left">
                      <div className="relative shrink-0">
                        <div className="absolute -inset-4 bg-gradient-to-tr from-green-500 to-blue-500 rounded-full blur-xl opacity-20 animate-pulse" />
                        <div className="relative w-32 h-32 sm:w-48 sm:h-48 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl bg-gray-800">
                          <img
                            src={testimonial.avatar}
                            alt={testimonial.heading}
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                          />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-3 rounded-2xl shadow-xl">
                          <Quote size={20} />
                        </div>
                      </div>

                      <div className="flex-grow">
                        <h3 className="text-2xl sm:text-4xl font-bold text-white mb-6 leading-tight">
                          &ldquo;{testimonial.heading}&rdquo;
                        </h3>
                        <p className={`text-lg sm:text-2xl text-gray-400 leading-relaxed italic mb-8 ${inter.className}`}>
                          {testimonial.body}
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-white/10 pt-8">
                          <div>
                            <span className={`text-xl font-bold text-green-400 block mb-1 ${outfit.className}`}>
                              {testimonial.companyName}
                            </span>
                            <span className="text-sm text-gray-500 uppercase tracking-widest font-semibold">
                              {testimonial.email}
                            </span>
                          </div>
                          
                          <a
                            href={`/testimonial/${testimonial.id}`}
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 group"
                          >
                            Read Full Story
                            <span className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center translate-x-0 group-hover:translate-x-1 transition-transform">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                            </span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      <style jsx global>{`
        .testimonial-swiper-container .swiper-pagination-bullet {
          background: rgba(255, 255, 255, 0.2);
          width: 8px;
          height: 8px;
          transition: all 0.3s ease;
        }
        .testimonial-swiper-container .swiper-pagination-bullet-active {
          background: #22c55e;
          width: 32px;
          border-radius: 4px;
        }
        .testimonial-swiper-container .swiper-button-next,
        .testimonial-swiper-container .swiper-button-prev {
          color: white;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(8px);
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: 1px border-white/10;
          transition: all 0.3s ease;
        }
        .testimonial-swiper-container .swiper-button-next:hover,
        .testimonial-swiper-container .swiper-button-prev:hover {
          background: rgba(34, 197, 94, 0.2);
          border-color: rgba(34, 197, 94, 0.4);
        }
        .testimonial-swiper-container .swiper-button-next:after,
        .testimonial-swiper-container .swiper-button-prev:after {
          font-size: 20px;
          font-weight: bold;
        }
        .text-glow {
          text-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
        }
      `}</style>
    </section>
  );
}
