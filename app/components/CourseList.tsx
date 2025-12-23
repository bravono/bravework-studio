"use client";

import React, { useCallback, useState, useEffect } from "react";
import { ShowMore } from "@re-dev/react-truncate";
import { Calendar, Award, Hourglass, DollarSign, Filter } from "lucide-react";

import Link from "next/link";

import useExchangeRates from "@/hooks/useExchangeRates";
import useSelectedCurrency from "@/hooks/useSelectedCurrency";

import { getCurrencySymbol } from "@/lib/utils/getCurrencySymbol";
import { convertCurrency } from "@/lib/utils/convertCurrency";
import getWeeksBtwDates from "@/lib/utils/getWeeksBtwDays";

import CurrencySelector from "../components/CurrencySelector";
import Loader from "../components/Loader";
import ArrowButton from "./ArrowButton";
import CourseFilters from "./CourseFilters";
import { Course } from "../types/app";
import { KOBO_PER_NAIRA } from "@/lib/constants";


export default function coursesPage({ page }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { exchangeRates, ratesError, ratesLoading } = useExchangeRates();
  const { selectedCurrency, updateSelectedCurrency } = useSelectedCurrency();

  // Filter State
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [showPublishedOnly, setShowPublishedOnly] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const rateIsFetched = exchangeRates?.[selectedCurrency];
  const atHome = page === "home";

  // Derived Data
  const categories = React.useMemo(
    () => Array.from(new Set(courses.map((c) => c.category).filter(Boolean))),
    [courses]
  );
  const tags = React.useMemo(
    () => Array.from(new Set(courses.flatMap((c) => c.tags || []))),
    [courses]
  );

  const filteredCourses = React.useMemo(() => {
    let result = courses;

    if (selectedCategories.length > 0) {
      result = result.filter((c) => selectedCategories.includes(c.category));
    }

    if (selectedTags.length > 0) {
      result = result.filter((c) =>
        c.tags?.some((tag) => selectedTags.includes(tag))
      );
    }

    if (showFreeOnly) {
      result = result.filter((c) => c.price === 0);
    }

    if (showPublishedOnly) {
      result = result.filter((c) => c.isActive);
    }

    return result;
  }, [
    courses,
    selectedCategories,
    selectedTags,
    showFreeOnly,
    showPublishedOnly,
  ]);

  const coursesToDisplay = atHome ? courses.slice(0, 4) : filteredCourses;

  const courseHeading = atHome ? `text-white` : `text-secondary-dark`;

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleTagChange = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedTags([]);
    setShowFreeOnly(false);
  };

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);

    try {
      const res = await fetch("/api/courses");
      if (!res.ok) {
        throw new Error("Failed to fetch courses");
      }
      const data = await res.json();
      setCourses(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return (
    <>
      <section
        className={`${
          page === "home" ? "dark:bg-gray-900" : ""
        } py-16 px-4 sm:px-6 lg:px-8`}
      >
        <div className="text-center mb-16">
          <h1
            className={`${courseHeading} text-5xl md:text-6xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900`}
          >
            Available Courses
          </h1>
          <p
            className={`${courseHeading} text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed`}
          >
            Empowering young minds and professionals with technology education
            through fun and engaging courses.
          </p>
          {page === "home" && (
            <ArrowButton
              label={"Explore More"}
              link={"/courses"}
              style={"my-4"}
            />
          )}
        </div>
        {/* Currency selection */}
        {!atHome && (
          <div className="mb-20 flex flex-col items-center">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Select Currency
            </p>
            <CurrencySelector
              selectedCurrency={selectedCurrency}
              onSelect={(currency) => updateSelectedCurrency(currency)}
            />
          </div>
        )}
        <div className="w-full px-4 mt-10 sm:px-6 lg:px-8">
          {isLoading ? (
            <Loader user={"admin"} />
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              {!atHome && (
                <>
                  <button
                    className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsFilterOpen(true)}
                  >
                    <Filter size={20} />
                    Filters
                  </button>
                  <CourseFilters
                    categories={categories}
                    tags={tags}
                    selectedCategories={selectedCategories}
                    selectedTags={selectedTags}
                    priceRange={{ min: 0, max: 0 }} // Not used yet
                    showFreeOnly={showFreeOnly}
                    showPublishedOnly={showPublishedOnly}
                    onCategoryChange={handleCategoryChange}
                    onTagChange={handleTagChange}
                    onPriceRangeChange={() => {}}
                    onShowFreeOnlyChange={setShowFreeOnly}
                    onShowPublishedOnlyChange={setShowPublishedOnly}
                    onClearFilters={clearFilters}
                    isOpen={isFilterOpen}
                    onClose={() => setIsFilterOpen(false)}
                  />
                </>
              )}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
                {coursesToDisplay.map((course, index) => (
                  <div
                    key={index}
                    className="group bg-white w-full max-w-lg mx-auto rounded-3xl shadow-lg hover:shadow-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 border border-gray-100"
                    // onClick={ () => router.push("/courses/" + course.id)}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={
                          course.thumbnailUrl ||
                          "assets/Bravework_Studio-Logo-Color.png"
                        }
                        alt={course.title}
                        className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-white/20 backdrop-blur-md border border-white/30 shadow-sm">
                        <span
                          className={
                            course.isActive
                              ? "text-green-400"
                              : "text-yellow-400"
                          }
                        >
                          ●
                        </span>{" "}
                        {course.isActive ? "Active" : "Upcoming"}
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-grow relative">
                      <div className="mb-4">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {course.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium uppercase tracking-wide">
                            {course.level}
                          </span>
                          <span>•</span>
                          <span>{course.language}</span>
                        </div>
                      </div>

                      <ShowMore
                        className="text-gray-600 text-sm leading-relaxed mb-6"
                        lines={3}
                        more={
                          <span className="text-primary font-medium cursor-pointer hover:underline ml-1">
                            Read more
                          </span>
                        }
                      >
                        <div>{course.description}</div>
                      </ShowMore>

                      <div className="flex-grow space-y-3 mb-6">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <div className="p-2 bg-primary/5 rounded-lg text-primary">
                            <Calendar className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-medium uppercase">
                              Start Date
                            </p>
                            <p className="font-semibold">
                              {course.isActive
                                ? new Date(
                                    course.startDate
                                  ).toLocaleDateString()
                                : "Coming Soon"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <div className="p-2 bg-primary/5 rounded-lg text-primary">
                            <Hourglass className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-medium uppercase">
                              Duration
                            </p>
                            <p className="font-semibold">
                              {getWeeksBtwDates(
                                new Date(course.startDate),
                                new Date(course.endDate)
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <div className="p-2 bg-primary/5 rounded-lg text-primary">
                            <DollarSign className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-medium uppercase">
                              Price
                            </p>
                            <p className="font-bold text-lg text-gray-900">
                              {course.price === 0
                                ? "Free"
                                : `${getCurrencySymbol(selectedCurrency)}${
                                    rateIsFetched &&
                                    convertCurrency(
                                      course.price / KOBO_PER_NAIRA,
                                      exchangeRates[selectedCurrency],
                                      getCurrencySymbol(selectedCurrency)
                                    )
                                  }`}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Early Bird Discount */}
                      {course?.discount &&
                        new Date(course.discountEndDate) > new Date() && (
                          <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-100">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-yellow-100 rounded-full text-yellow-600">
                                <Award className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-bold text-yellow-800 text-sm">
                                  Early Bird: {course.discount}% OFF
                                </p>
                                <p className="text-xs text-yellow-600 font-medium">
                                  {(() => {
                                    const end = new Date(
                                      course.discountEndDate
                                    );
                                    const now = new Date();
                                    const diff = end.getTime() - now.getTime();
                                    if (diff <= 0) return "Ended";
                                    const days = Math.floor(
                                      diff / (1000 * 60 * 60 * 24)
                                    );
                                    return `Ends in ${days} days`;
                                  })()}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                      <div className="mt-auto space-y-3">
                        {course.isActive ? (
                          <Link
                            href={
                              "/auth/signup?enroll=true&courseId=" + course.id
                            }
                            className="flex w-full items-center justify-center px-6 py-3.5 text-sm font-bold rounded-xl text-white bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20 hover:shadow-green-600/30 transition-all duration-200 transform hover:-translate-y-0.5"
                          >
                            Enroll Now
                          </Link>
                        ) : (
                          <Link
                            href={`/newsletter?isActive=${
                              course.isActive ? "true" : "false"
                            }`}
                            className="flex w-full items-center justify-center px-6 py-3.5 text-sm font-bold rounded-xl text-primary bg-primary/5 hover:bg-primary/10 border border-primary/10 transition-all duration-200"
                          >
                            Get Notified
                          </Link>
                        )}
                        <Link
                          href={"/courses/" + course.id}
                          className="flex w-full items-center justify-center px-6 py-3.5 text-sm font-bold rounded-xl text-gray-700 bg-gray-50 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
