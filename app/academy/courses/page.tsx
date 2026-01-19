"use client";

import React, { useState } from "react";
import AcademySubNavBar from "../../components/AcademySubNavBar";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  BookOpen,
  Clock,
  Star,
  PlayCircle,
} from "lucide-react";
import Image from "next/image";

const courses = [
  {
    id: "1",
    title: "UI/UX Design Masterclass",
    category: "Design",
    duration: "12 Weeks",
    rating: 4.9,
    price: "Free Intro",
    image: "/assets/academy/course_placeholder.png",
    level: "Beginner",
    isFree: true,
  },
  {
    id: "2",
    title: "Next.js for Professionals",
    category: "Development",
    duration: "8 Weeks",
    rating: 4.8,
    price: "₦150,000",
    image: "/assets/academy/course_placeholder.png",
    level: "Intermediate",
    isFree: false,
  },
  {
    id: "3",
    title: "3D Character Animation",
    category: "3D Arts",
    duration: "16 Weeks",
    rating: 4.9,
    price: "Free Intro",
    image: "/assets/Course_Thumbnail_Placeholder.png",
    level: "Intermediate",
    isFree: true,
  },
  {
    id: "4",
    title: "Full-Stack Web Dev with Java",
    category: "Development",
    duration: "24 Weeks",
    rating: 4.7,
    price: "₦250,000",
    image: "/assets/Course_Thumbnail_Placeholder.png",
    level: "Beginner",
    isFree: false,
  },
];

export default function AcademyCoursesPage() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredCourses =
    activeFilter === "All"
      ? courses
      : courses.filter(
          (c) =>
            c.category === activeFilter || (activeFilter === "Free" && c.isFree)
        );

  return (
    <div className="bg-white min-h-screen">
      <AcademySubNavBar />

      <section className="py-16 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-black text-gray-900 mb-8">
            Professional Courses
          </h1>

          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {["All", "Free", "Design", "Development", "3D Arts"].map(
                (filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${
                      activeFilter === filter
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                        : "bg-white text-gray-600 border border-gray-200 hover:border-blue-500"
                    }`}
                  >
                    {filter}
                  </button>
                )
              )}
            </div>

            <div className="relative w-full md:w-80">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search courses..."
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <motion.div
                key={course.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-gray-200 transition-all group flex flex-col h-full"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                  <Image
                    src={course.image}
                    alt={course.title}
                    layout="fill"
                    objectFit="cover"
                    className="group-hover:scale-105 transition-transform duration-500"
                  />
                  {course.isFree && (
                    <div className="absolute top-4 left-4 px-4 py-1.5 bg-emerald-500 text-white text-xs font-black rounded-full shadow-lg">
                      FREE INTRO
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-2xl scale-0 group-hover:scale-100 transition-transform">
                      <PlayCircle size={32} />
                    </div>
                  </div>
                </div>

                <div className="p-8 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-blue-600">
                    <BookOpen size={14} />
                    {course.category}
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                    {course.title}
                  </h3>

                  <div className="flex items-center gap-6 mt-auto">
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                      <Clock size={16} />
                      {course.duration}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-amber-500">
                      <Star size={16} fill="currentColor" />
                      {course.rating}
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                    <div className="text-xl font-black text-gray-900">
                      {course.price}
                    </div>
                    <button className="px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-blue-600 transition-all text-sm">
                      Enroll Now
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="py-24 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                <Search size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                No courses found
              </h3>
              <p className="text-gray-500">
                Try adjusting your filters or search terms.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
