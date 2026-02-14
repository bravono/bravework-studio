"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import AcademySubNavBar from "../../components/AcademySubNavBar";
import { motion } from "framer-motion";
import {
  Search,
  BookOpen,
  PlayCircle,
  Calendar,
  Hourglass,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ShowMore } from "@re-dev/react-truncate";

import useExchangeRates from "@/hooks/useExchangeRates";
import useSelectedCurrency from "@/hooks/useSelectedCurrency";
import { getCurrencySymbol } from "@/lib/utils/getCurrencySymbol";
import { convertCurrency } from "@/lib/utils/convertCurrency";
import getWeeksBtwDates from "@/lib/utils/getWeeksBtwDays";
import { KOBO_PER_NAIRA } from "@/lib/constants";

import CurrencySelector from "../../components/CurrencySelector";
import Loader from "../../components/Loader";
import { Course } from "../../types/app";

export default function AcademyCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { exchangeRates } = useExchangeRates();
  const { selectedCurrency, updateSelectedCurrency } = useSelectedCurrency();

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/courses");
      if (!res.ok) throw new Error("Failed to fetch courses");
      const data = await res.json();
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const categories = useMemo(() => {
    return [
      "All",
      "Free",
      ...Array.from(new Set(courses.map((c) => c.category).filter(Boolean))),
    ];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesFilter =
        activeFilter === "All" ||
        course.category === activeFilter ||
        (activeFilter === "Free" && course.price === 0);

      const matchesSearch = course.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [courses, activeFilter, searchQuery]);

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
              {categories.map((filter) => (
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
              ))}
            </div>

            <div className="relative w-full md:w-80">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center md:items-start">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Select Currency
            </p>
            <CurrencySelector
              selectedCurrency={selectedCurrency}
              onSelect={(currency) => updateSelectedCurrency(currency as any)}
            />
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="py-24">
              <Loader user="admin" />
            </div>
          ) : (
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
                    <img
                      src={
                        course.thumbnailUrl ||
                        "/assets/Bravework_Studio-Logo-Color.png"
                      }
                      alt={course.title}
                      className="group-hover:scale-105 transition-transform duration-500"
                    />

                    <div className="absolute top-4 left-4 px-4 py-1.5 bg-black/20 backdrop-blur-md text-white text-xs font-black rounded-full shadow-lg border border-white/30">
                      <span
                        className={
                          course.isActive ? "text-green-400" : "text-yellow-400"
                        }
                      >
                        ●
                      </span>{" "}
                      {course.isActive ? "ACTIVE" : "UPCOMING"}
                    </div>

                    {course.price === 0 && (
                      <div className="absolute top-4 right-4 px-4 py-1.5 bg-emerald-500 text-white text-xs font-black rounded-full shadow-lg">
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

                    <ShowMore
                      className="text-gray-500 text-sm leading-relaxed mb-6"
                      lines={3}
                      more={
                        <span className="text-blue-600 font-bold cursor-pointer hover:underline ml-1">
                          Read more
                        </span>
                      }
                    >
                      <div>{course.description}</div>
                    </ShowMore>

                    <div className="space-y-3 mb-8">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                          <Calendar size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                            Start Date
                          </p>
                          <p className="font-bold">
                            {course.isActive
                              ? new Date(course.startDate).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )
                              : "Open Shortly"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                          <Hourglass size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                            Duration
                          </p>
                          <p className="font-bold">
                            {course.isActive
                              ? getWeeksBtwDates(
                                  course.startDate,
                                  course.endDate,
                                )
                              : "Open Shortly"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                      <div className="text-xl font-black text-gray-900">
                        {course.price === 0
                          ? "Free"
                          : exchangeRates && exchangeRates[selectedCurrency]
                            ? convertCurrency(
                                course.price / KOBO_PER_NAIRA,
                                exchangeRates[selectedCurrency],
                                getCurrencySymbol(selectedCurrency),
                              )
                            : "---"}
                      </div>
                      <Link
                        href={
                          course.isActive
                            ? `/auth/signup?enroll=true&courseId=${course.id}`
                            : `/newsletter?courseId=${course.id}`
                        }
                        className="px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-blue-600 transition-all text-sm"
                      >
                        {course.isActive ? "Enroll Now" : "Get Notified"}
                      </Link>
                    </div>

                    <Link
                      href={`/academy/courses/${course.id}`}
                      className="mt-4 flex w-full items-center justify-center px-6 py-2.5 text-sm font-bold rounded-xl text-gray-700 bg-gray-50 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 border border-gray-100"
                    >
                      View Details
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {!isLoading && filteredCourses.length === 0 && (
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
