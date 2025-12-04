"use client";

import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import { Nosifer } from "next/font/google";
import { Award, Briefcase, Smile } from "lucide-react";

const nosifer = Nosifer({ subsets: ["latin"], weight: "400" });

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

  return (
    <main className="bg-gray-50 min-h-screen">
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1
              className={`text-5xl font-bold text-gray-900 ${nosifer.className}`}
            >
              About Bravework Studio
            </h1>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              We are a creative powerhouse specializing in digital solutions
              that bring ideas to life.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-3xl shadow-2xl overflow-hidden p-8 lg:p-12">
            {/* About Text */}
            <div className="space-y-6">
              <p className="text-gray-700 leading-relaxed text-lg">
                Bravework Studio is a creative powerhouse specializing in 3D
                services, web development, and UI/UX design. Founded with a
                passion for bringing ideas to life, we combine technical
                expertise with artistic vision to deliver exceptional results
                for our clients.
              </p>
              <p className="text-gray-700 leading-relaxed text-lg">
                Our team of skilled professionals brings together years of
                experience in various fields, allowing us to offer comprehensive
                solutions that meet the unique needs of each project. We are
                committed to excellence and innovation in everything we do.
              </p>
              <p className="text-gray-700 leading-relaxed text-lg">
                We believe in the power of collaboration and innovation, working
                closely with our clients to understand their vision and bring it
                to reality through cutting-edge technology and creative
                solutions.
              </p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 self-center text-center">
              <div
                ref={yearsRef}
                className="p-6 bg-blue-50 rounded-2xl shadow-sm border border-blue-100 transition-transform duration-200 hover:scale-105"
              >
                <Briefcase className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-4xl font-extrabold text-gray-900">
                  {yearsCount}+
                </h3>
                <p className="text-gray-600 mt-1">Years Experience</p>
              </div>
              <div
                ref={projectsRef}
                className="p-6 bg-green-50 rounded-2xl shadow-sm border border-green-100 transition-transform duration-200 hover:scale-105"
              >
                <Award className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-4xl font-extrabold text-gray-900">
                  {projectsCount}+
                </h3>
                <p className="text-gray-600 mt-1">Projects Completed</p>
              </div>
              <div
                ref={clientsRef}
                className="p-6 bg-yellow-50 rounded-2xl shadow-sm border border-yellow-100 transition-transform duration-200 hover:scale-105"
              >
                <Smile className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                <h3 className="text-4xl font-extrabold text-gray-900">
                  {clientsCount}+
                </h3>
                <p className="text-gray-600 mt-1">Happy Clients</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
