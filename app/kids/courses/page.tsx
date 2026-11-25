"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  BookOpen,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Users,
  PlayCircle,
  Gamepad2,
  CheckCircle2,
} from "lucide-react";

import KidsSubNavBar from "../../components/KidsSubNavBar";
import CurrencySelector from "../../components/CurrencySelector";
import Loader from "../../components/Loader";
import useExchangeRates from "@/hooks/useExchangeRates";
import useSelectedCurrency from "@/hooks/useSelectedCurrency";
import { getCurrencySymbol } from "@/lib/utils/getCurrencySymbol";
import { convertCurrency } from "@/lib/utils/convertCurrency";
import { KOBO_PER_NAIRA } from "@/lib/constants";
import { cleanImageUrl } from "@/lib/utils/cleanImageUrl";
import { Course } from "../../types/app";

export default function KidsCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { exchangeRates } = useExchangeRates();
  const { selectedCurrency, updateSelectedCurrency } = useSelectedCurrency();

  const fetchKidsCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/courses?audience=kids");
      if (!res.ok) throw new Error("Failed to fetch kids courses");
      const data = await res.json();
      const kidsOnly = Array.isArray(data)
        ? data.filter((c: Course) => c.isForKids)
        : [];
      setCourses(kidsOnly);
    } catch (error) {
      console.error("Error fetching kids courses:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKidsCourses();
  }, [fetchKidsCourses]);

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(courses.map((c) => c.category).filter(Boolean)),
    );
    return ["All", ...unique];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesCategory =
        selectedCategory === "All" || course.category === selectedCategory;
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.description &&
          course.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [courses, selectedCategory, searchQuery]);

  return (
    <div className="bg-white min-h-screen">
      <KidsSubNavBar />

      {/* Top Bridge Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-xs py-2.5 px-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 font-medium">
          <span>Looking for adult & professional career certifications?</span>
          <Link
            href="/academy/courses"
            className="underline font-bold hover:text-yellow-300 transition-colors inline-flex items-center gap-1"
          >
            Visit Bravework Academy <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24 bg-gradient-to-b from-yellow-50/60 via-pink-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-100 text-pink-700 font-bold text-sm mb-6 shadow-sm">
                <Sparkles size={16} />
                <span>Creative Skills for Young Minds</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-tight mb-6">
                Learn 3D, Coding &amp; Art Through{" "}
                <span className="text-pink-600">Pure Fun.</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed max-w-xl">
                Hands-on digital training designed for kids and teenagers (Ages 7–16).
                Build 3D models, animated characters, and creative games with beginner-friendly tools.
              </p>

              <div className="flex flex-wrap gap-4 text-sm font-semibold text-gray-600">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                  <Gamepad2 className="text-pink-500" size={18} />
                  Hands-On Projects
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                  <ShieldCheck className="text-green-500" size={18} />
                  Safe &amp; Guided
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                  <GraduationCap className="text-blue-500" size={18} />
                  Certificates Included
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative hidden lg:block"
            >
              <div className="aspect-square bg-gradient-to-tr from-pink-200/50 via-purple-200/40 to-blue-200/50 rounded-full blur-3xl absolute -inset-4" />
              <div className="relative bg-white p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 max-w-md mx-auto">
                <div className="w-16 h-16 bg-pink-500 text-white rounded-2xl flex items-center justify-center font-black mb-6 shadow-lg shadow-pink-500/30">
                  <BookOpen size={32} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">
                  Why Kids Love Learning Here
                </h3>
                <div className="space-y-4">
                  {[
                    "Zero complicated jargon - simple, visual steps",
                    "Real creative output: take home 3D models and short films",
                    "Parent dashboard tracking with progress badges",
                  ].map((benefit) => (
                    <div key={benefit} className="flex items-start gap-3 text-sm text-gray-700 font-medium">
                      <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={18} />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Filter and Course Catalog */}
      <section className="py-12 bg-gray-50 border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-8">
            {/* Category Pills */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${
                    selectedCategory === cat
                      ? "bg-pink-600 text-white shadow-lg shadow-pink-500/30"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-pink-500"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search kids courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-gray-200 focus:ring-2 focus:ring-pink-500 outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* Currency Selector */}
          <div className="flex justify-end mb-6">
            <div className="inline-flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Currency:
              </span>
              <CurrencySelector
                selectedCurrency={selectedCurrency}
                onSelect={(currency) => updateSelectedCurrency(currency as any)}
              />
            </div>
          </div>

          {/* Course Grid */}
          {isLoading ? (
            <div className="py-24">
              <Loader user="user" />
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 p-8">
              <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No Kids Courses Found
              </h3>
              <p className="text-gray-500 max-w-md mx-auto text-sm mb-6">
                We are actively developing exciting new curricula for young learners.
                Check back soon or explore our animated episodes.
              </p>
              <Link
                href="/kids/episodes"
                className="inline-flex items-center gap-2 px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-2xl transition-all shadow-md text-sm"
              >
                <PlayCircle size={18} />
                Watch Kids Episodes
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course) => {
                const rawPrice = (course.price || 0) / KOBO_PER_NAIRA;
                const convertedPrice = convertCurrency(
                  rawPrice,
                  "NGN",
                  selectedCurrency,
                  exchangeRates,
                );
                const currencySymbol = getCurrencySymbol(selectedCurrency);

                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col group"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-gray-100 overflow-hidden">
                      <img
                        src={cleanImageUrl(course.thumbnailUrl)}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/assets/Bravework_Studio-Logo-Color.png";
                        }}
                      />
                      <div className="absolute top-4 left-4 bg-pink-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-md">
                        Ages 7–16
                      </div>
                      {course.duration && (
                        <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                          <Clock size={12} />
                          {course.duration}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-center gap-2 text-xs font-bold text-pink-600 mb-2 uppercase tracking-wider">
                        {course.category || "Creative Arts"}
                      </div>
                      <h3 className="text-xl font-black text-gray-900 mb-3 group-hover:text-pink-600 transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed mb-6 line-clamp-3 flex-grow">
                        {course.description}
                      </p>

                      <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                        <div>
                          <span className="text-xs text-gray-400 block">Tuition</span>
                          <span className="text-2xl font-black text-gray-900">
                            {rawPrice === 0 ? (
                              <span className="text-green-600">Free</span>
                            ) : (
                              `${currencySymbol}${convertedPrice}`
                            )}
                          </span>
                        </div>
                        <Link
                          href={`/academy/courses/${course.id}`}
                          className="px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl transition-all shadow-md shadow-pink-600/20 text-sm flex items-center gap-1.5"
                        >
                          Details <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Parent Information Banner */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-10 rounded-[2.5rem] bg-gradient-to-br from-indigo-50 to-pink-50 border border-indigo-100">
            <h2 className="text-3xl font-black text-gray-900 mb-4">
              Parents &amp; Guardians Dashboard
            </h2>
            <p className="text-gray-600 text-base mb-8 max-w-xl mx-auto">
              Once your child is enrolled, monitor their progress, verify projects completed,
              and see milestone badges in your personal dashboard.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/user/dashboard"
                className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 transition-all text-sm"
              >
                Go to Parent Dashboard
              </Link>
              <Link
                href="/kids/contact"
                className="px-8 py-3.5 bg-white border border-gray-200 hover:border-indigo-600 text-gray-700 font-bold rounded-2xl transition-all text-sm"
              >
                Contact Kids Support
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
