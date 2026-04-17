"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { toast } from "react-toastify";
import AcademySubNavBar from "../../components/AcademySubNavBar";
import { motion } from "framer-motion";
import {
  Search,
  BookOpen,
  PlayCircle,
  Calendar,
  Hourglass,
  Plus,
  Minus,
  ShoppingCart,
  Monitor,
  Tag,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  X,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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

function AcademyCoursesContent() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBundle, setSelectedBundle] = useState<string[]>([]);
  const [includeHardware, setIncludeHardware] = useState(false);

  const searchParams = useSearchParams();

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

  useEffect(() => {
    const filter = searchParams.get("filter");
    if (filter) {
      setActiveFilter(filter);
    }
  }, [searchParams]);

  const categories = useMemo(() => {
    return [
      "All",
      "Free",
      ...Array.from(new Set(courses.map((c) => c.category).filter(Boolean))),
    ];
  }, [courses]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    courses.forEach((course) => {
      if (Array.isArray(course.tags)) {
        course.tags.forEach((tag) => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }, [courses]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesFilter =
        activeFilter === "All" ||
        course.category === activeFilter ||
        (activeFilter === "Free" && course.price === 0);

      const matchesSearch = course.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => course.tags?.includes(tag));

      return matchesFilter && matchesSearch && matchesTags;
    });
  }, [courses, activeFilter, searchQuery, selectedTags]);

  const bundleCourses = useMemo(() => {
    return courses.filter((c) => selectedBundle.includes(String(c.id)));
  }, [courses, selectedBundle]);

  const bundleSubtotal = useMemo(() => {
    return bundleCourses.reduce((sum, c) => sum + c.price, 0);
  }, [bundleCourses]);

  const bundleDiscount = useMemo(() => {
    if (selectedBundle.length === 2) return 0.1; // 10%
    if (selectedBundle.length >= 3) return 0.2; // 20%
    return 0;
  }, [selectedBundle]);

  const bundleTotal = useMemo(() => {
    return bundleSubtotal * (1 - bundleDiscount);
  }, [bundleSubtotal, bundleDiscount]);

  const toggleBundleCourse = (courseId: string) => {
    setSelectedBundle((prev) => {
      if (prev.includes(courseId)) {
        return prev.filter((id) => id !== courseId);
      }
      if (prev.length >= 3) {
        toast.warning("Maximum 3 courses in a bundle");
        return prev;
      }
      return [...prev, courseId];
    });
  };

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

          {allTags.length > 0 && (
            <div className="mt-10 pt-8 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  Filter by Specialization
                </p>
                {selectedTags.length > 0 && (
                  <button
                    onClick={() => setSelectedTags([])}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Clear all tags
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => {
                  const isActive = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                        isActive
                          ? "bg-blue-50 text-blue-600 border-2 border-blue-600 ring-4 ring-blue-50/50"
                          : "bg-white text-gray-500 border border-gray-200 hover:border-blue-300 hover:bg-gray-50/50"
                      }`}
                    >
                      {tag}
                      {isActive && (
                        <span className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white text-[10px]">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col items-center md:items-start">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Select Currency
            </p>
            <CurrencySelector
              selectedCurrency={selectedCurrency}
              onSelect={(currency) => updateSelectedCurrency(currency as any)}
            />
          </div>

          {/* Bundle Advertisement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 p-8 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] text-white relative overflow-hidden shadow-xl shadow-blue-500/20"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-black uppercase tracking-widest mb-4">
                  <Tag size={14} />
                  <span>Limited Time Offer</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black mb-2 text-center md:text-left">
                  Build Your Power Bundle
                </h2>
                <p className="text-blue-100 max-w-xl text-sm md:text-base text-center md:text-left">
                  Select up to 3 courses and get up to{" "}
                  <span className="text-white font-black text-lg md:text-xl">
                    20% OFF
                  </span>
                  . Add hardware rental for an additional{" "}
                  <span className="text-white font-black text-lg md:text-xl">
                    10% discount
                  </span>{" "}
                  on gear.
                </p>
              </div>
              <div className="flex items-center gap-4 md:gap-6 pb-2 md:pb-0">
                <div className="text-center">
                  <div className="text-2xl font-black">10% OFF</div>
                  <div className="text-xs text-blue-200 uppercase font-bold">
                    2 Courses
                  </div>
                </div>
                <div className="w-px h-12 bg-white/20"></div>
                <div className="text-center">
                  <div className="text-2xl font-black">20% OFF</div>
                  <div className="text-xs text-blue-200 uppercase font-bold">
                    3 Courses
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
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

                    {course.tags && course.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-8">
                        {course.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 bg-gray-50 text-gray-500 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-gray-100"
                          >
                            {tag}
                          </span>
                        ))}
                        {course.tags.length > 3 && (
                          <span className="text-[10px] font-black text-gray-400 mt-1">
                            +{course.tags.length - 3} MORE
                          </span>
                        )}
                      </div>
                    )}

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
                        Enroll Now
                      </Link>
                    </div>

                    {course.price > 0 && (
                      <button
                        onClick={() => toggleBundleCourse(String(course.id))}
                        className={`mt-4 flex w-full items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 border ${
                          selectedBundle.includes(String(course.id))
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-blue-600 border-blue-100 hover:bg-blue-50"
                        }`}
                      >
                        {selectedBundle.includes(String(course.id)) ? (
                          <>
                            <Minus size={16} /> Remove from Bundle
                          </>
                        ) : (
                          <>
                            <Plus size={16} /> Add to Bundle
                          </>
                        )}
                      </button>
                    )}

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

      {/* Bundle Summary UI */}
      {selectedBundle.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-0 md:bottom-0 left-0 md:left-2/2 md:-translate-x-1/2 z-[100] w-full md:max-w-4xl px-0 md:px-4"
        >
          <div className="bg-white rounded-t-[2rem] md:rounded-[2.5rem] shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.15)] md:shadow-2xl border-t md:border border-blue-100 p-5 md:p-8 flex flex-col md:flex-row items-center gap-4 md:gap-8 relative">
            <button
              onClick={() => setSelectedBundle([])}
              className="absolute -top-3 -right-3 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors shadow-lg"
            >
              <X size={16} />
            </button>

            <div className="flex-grow w-full md:w-auto">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                  <ShoppingCart size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">
                    Your Academy Bundle
                  </h3>
                  <p className="text-sm text-gray-500 font-bold">
                    {selectedBundle.length} / 3 Courses Selected
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {bundleCourses.map((c) => (
                  <div
                    key={c.id}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg flex items-center gap-2"
                  >
                    <BookOpen size={12} />
                    {c.title}
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full md:w-auto flex flex-col gap-4">
              <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl cursor-pointer group hover:bg-blue-50 transition-colors border border-gray-100 hover:border-blue-100">
                <input
                  type="checkbox"
                  checked={includeHardware}
                  onChange={(e) => setIncludeHardware(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="flex items-center gap-2 font-black text-gray-900 leading-none">
                    <Monitor size={16} /> Add Hardware Rental
                  </div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">
                    Get 10% Discount on Gear
                  </div>
                </div>
              </label>

              <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0">
                <div className="text-right">
                  {bundleDiscount > 0 && (
                    <div className="text-xs text-green-600 font-black uppercase tracking-widest mb-1">
                      {Math.round(bundleDiscount * 100)}% Discount Applied
                    </div>
                  )}
                  <div className="flex items-baseline gap-2 justify-end">
                    {bundleDiscount > 0 && (
                      <span className="text-sm text-gray-400 line-through font-bold">
                        {exchangeRates && exchangeRates[selectedCurrency]
                          ? convertCurrency(
                              bundleSubtotal / KOBO_PER_NAIRA,
                              exchangeRates[selectedCurrency],
                              getCurrencySymbol(selectedCurrency),
                            )
                          : "---"}
                      </span>
                    )}
                    <span className="text-3xl font-black text-gray-900">
                      {exchangeRates && exchangeRates[selectedCurrency]
                        ? convertCurrency(
                            bundleTotal / KOBO_PER_NAIRA,
                            exchangeRates[selectedCurrency],
                            getCurrencySymbol(selectedCurrency),
                          )
                        : "---"}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/auth/signup?enroll=true&bundle=${selectedBundle.join(",")}${includeHardware ? "&hardware=true" : ""}`}
                  className="px-6 md:px-8 py-3.5 md:py-4 bg-blue-600 text-white font-black rounded-xl md:rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 whitespace-nowrap text-sm md:text-base"
                >
                  Check Out <ArrowRight size={20} />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function AcademyCoursesPage() {
  return (
    <Suspense fallback={<Loader user="admin" />}>
      <AcademyCoursesContent />
    </Suspense>
  );
}
