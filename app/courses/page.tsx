"use client";

import React, { useCallback, useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Link from "next/link";
import {
  Paintbrush,
  Laptop,
  Lightbulb,
  Gamepad,
  User,
  Calendar,
  Layers,
  GraduationCap,
  Award,
  Tag,
  Hourglass,
  DollarSign,
} from "lucide-react";
import { Course } from "../types/app";
import { getCurrencySymbol } from "@/lib/utils/getCurrencySymbol";
import useSelectedCurrency from "@/hooks/useSelectedCurrency";
import { convertCurrency } from "@/lib/utils/convertCurrency";
import useExchangeRates from "@/hooks/useExchangeRates";
import getWeeksBtwDates from "@/lib/utils/getWeeksBtwDays";
import CurrencySelector from "../components/CurrencySelector";
import Loader from "../components/Loader";

const icons = [
  <Paintbrush className="w-8 h-8 text-secondary" />,
  <Laptop className="w-8 h-8 text-secondary" />,
  <Lightbulb className="w-8 h-8 text-secondary" />,
  <Gamepad className="w-8 h-8 text-secondary" />,
];

export default function coursesPage() {
  const KOBO_PER_NAIRA = 100;
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { selectedCurrency, updateSelectedCurrency } = useSelectedCurrency();
  const { exchangeRates, ratesError, ratesLoading } = useExchangeRates();

  const rateIsFetched = exchangeRates?.[selectedCurrency];

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
    <main className="bg-gray-50 min-h-screen">
      <Navbar />
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="w-full px-4 mt-10 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-secondary-dark mb-4">
              Available Courses
            </h1>
            <p className="text-lg text-secondary-dark max-w-2xl mx-auto">
              Empowering young minds and professionals with technology education
              through fun and engaging courses.
            </p>
          </div>
          {/* Currency selection */}
          <div className="mb-20">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Select Currency
            </p>
            <CurrencySelector
              selectedCurrency={selectedCurrency}
              onSelect={(currency) => updateSelectedCurrency(currency)}
            />
          </div>
          {isLoading ? (
            <Loader />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-items-center">
              {courses.map((course, index) => (
                <div
                  key={index}
                  className="bg-white w-full max-w-sm mx-auto rounded-2xl shadow-lg overflow-hidden flex flex-col transition-transform duration-500 hover:scale-105"
                >
                  <div className="relative">
                    <img
                      src={
                        // course.thumbnail_url ||
                        "assets/Bravework_Studio-Logo-Color.png"
                      }
                      alt={course.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold text-white bg-green-600">
                      {course.isActive ? "Active" : "Upcoming"}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="text-xl font-bold text-secondary">
                        {course.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 mb-4">{course.description}</p>
                    <div className="flex-grow">
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span>
                            <strong>Start Date:</strong>{" "}
                            {course.isActive
                              ? new Date(course.startDate).toLocaleDateString()
                              : "Coming Soon"}
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          <User className="h-4 w-4 text-primary" />
                          <span>
                            <strong>Instructor:</strong>{" "}
                            {`${course.firstName} ${course.lastName}`}
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Hourglass className="h-4 w-4 text-primary" />
                          <span>
                            <strong>Duration:</strong>{" "}
                            {getWeeksBtwDates(
                              new Date(course.startDate),
                              new Date(course.endDate)
                            )}
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-primary" />
                          <span>
                            <strong>Level:</strong> {course.level}
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Layers className="h-4 w-4 text-primary" />
                          <span>
                            <strong>Max Students:</strong> {course.maxStudents}
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-primary" />
                          <span>
                            <strong>Language:</strong> {course.language}
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-primary" />
                          <span>
                            <strong>Price:</strong>{" "}
                            {course.amount === 0
                              ? "Free"
                              : `${getCurrencySymbol(selectedCurrency)}${
                                  rateIsFetched &&
                                  convertCurrency(
                                    course.amount / KOBO_PER_NAIRA,
                                    exchangeRates[selectedCurrency],
                                    getCurrencySymbol(selectedCurrency)
                                  )
                                }`}
                          </span>
                        </li>
                      </ul>
                    </div>
                    {/* Early Bird Discount (Unchanged) */}
                    {course?.discount &&
                      new Date(course.discountEndDate) > new Date() && (
                        <div className="mt-4">
                          <div className="flex items-center space-x-3 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-3 shadow">
                            <Award className="text-yellow-500 w-6 h-6" />
                            <div>
                              <span className="font-semibold text-yellow-700">
                                Early Bird Discount:
                              </span>{" "}
                              <span className="text-yellow-800 font-bold">
                                {course.discount}% OFF
                              </span>
                              <span className="ml-2 text-yellow-700">
                                (
                                {(() => {
                                  const end = new Date(course.discountEndDate);
                                  const now = new Date();
                                  const diff = end.getTime() - now.getTime();
                                  if (diff <= 0) return "Discount ended";
                                  const days = Math.floor(
                                    diff / (1000 * 60 * 60 * 24)
                                  );
                                  const hours = Math.floor(
                                    (diff / (1000 * 60 * 60)) % 24
                                  );
                                  const minutes = Math.floor(
                                    (diff / (1000 * 60)) % 60
                                  );
                                  return `ends in ${days}d ${hours}h ${minutes}m`;
                                })()}
                                )
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    {course.isActive && (
                      <div className="mt-6">
                        <Link
                          href={
                            "/auth/signup?enroll=true&courseId=" + course.id
                          }
                          className="inline-flex w-full items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
                        >
                          Enroll Now
                        </Link>
                      </div>
                    )}
                    <div className="mt-6">
                      <Link
                        href={"/courses/" + course.id}
                        className="inline-flex w-full items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-secondary-dark hover:bg-secondary-light transition-colors duration-200"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
