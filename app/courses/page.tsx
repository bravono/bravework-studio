"use client";

import React from "react";
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
  Sparkles,
  Tag,
  Hourglass,
  DollarSign,
} from "lucide-react";

const trainingPrograms = [
  {
    courseId: 1,
    title: "3D for Kids",
    description:
      "Learn the basics of 3D modeling and animation in a fun, kid-friendly environment.",
    icon: <Paintbrush className="w-8 h-8 text-blue-600" />,
    thumbnail_url: "",
    ageGroup: "Ages 8-12",
    duration: "8 weeks",
    level: "Beginner",
    is_active: true,
    start_date: "2025-10-01",
    end_date: "2025-11-26",
    instructor_id: "inst-1",
    max_students: 20,
    price: 0,
    category_id: "cat-3d",
    language: "English",
    tag_id: "tag-art",
  },
  {
    courseId: 2,
    title: "Web Development for Kids",
    description:
      "Introduction to web development through interactive and engaging projects.",
    icon: <Laptop className="w-8 h-8 text-blue-600" />,
    thumbnail_url: "",
    ageGroup: "Ages 10-14",
    duration: "10 weeks",
    level: "Beginner",
    is_active: true,
    start_date: "2025-10-15",
    end_date: "2025-12-24",
    instructor_id: "inst-2",
    max_students: 25,
    price: 0,
    category_id: "cat-web",
    language: "English",
    tag_id: "tag-dev",
  },
  {
    courseId: 3,
    title: "UI/UX Design for Kids",
    description:
      "Creative design thinking and user interface basics for young designers.",
    icon: <Lightbulb className="w-8 h-8 text-blue-600" />,
    thumbnail_url: "",
    ageGroup: "Ages 8-12",
    duration: "8 weeks",
    level: "Beginner",
    is_active: true,
    start_date: "2025-11-01",
    end_date: "2025-12-26",
    instructor_id: "inst-1",
    max_students: 18,
    price: 0,
    category_id: "cat-uiux",
    language: "English",
    tag_id: "tag-design",
  },
  {
    courseId: 4,
    title: "Game Development for Kids",
    description:
      "Learn to create simple games using kid-friendly development tools.",
    icon: <Gamepad className="w-8 h-8 text-blue-600" />,
    thumbnail_url: "",
    ageGroup: "Ages 10-14",
    duration: "12 weeks",
    level: "Beginner",
    is_active: false,
    start_date: "2026-01-10",
    end_date: "2026-04-03",
    instructor_id: "inst-3",
    max_students: 30,
    price: 0,
    category_id: "cat-game",
    language: "English",
    tag_id: "tag-gamedev",
  },
];

export default function TrainingPage() {
  return (
    <main className="bg-gray-50 min-h-screen">
      <Navbar />
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Kids Training Programs
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Empowering young minds with technology education through fun and
              engaging courses.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {trainingPrograms.map((program, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col transition-transform duration-300 hover:scale-105"
              >
                <div className="relative">
                  <img
                    src={
                      program.thumbnail_url ||
                      "assets/Bravework_Studio-Logo-Color.png"
                    }
                    alt={program.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold text-white bg-green-600">
                    {program.is_active ? "Active" : "Upcoming"}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-4 mb-3">
                    {program.icon}
                    <h3 className="text-xl font-bold text-gray-900">
                      {program.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-4">{program.description}</p>
                  <div className="flex-grow">
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span>
                          <strong>Dates:</strong> {program.start_date} -{" "}
                          {program.end_date}
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-500" />
                        <span>
                          <strong>Instructor ID:</strong>{" "}
                          {program.instructor_id}
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Hourglass className="h-4 w-4 text-blue-500" />
                        <span>
                          <strong>Duration:</strong> {program.duration}
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-blue-500" />
                        <span>
                          <strong>Level:</strong> {program.level}
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-blue-500" />
                        <span>
                          <strong>Max Students:</strong> {program.max_students}
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-blue-500" />
                        <span>
                          <strong>Language:</strong> {program.language}
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-blue-500" />
                        <span>
                          <strong>Price:</strong>{" "}
                          {program.price === 0 ? "Free" : `$${program.price}`}
                        </span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-6">
                    <Link
                      href={"auth/signup?enroll=true&courseId=" + program.courseId}
                      className="inline-flex w-full items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
                    >
                      Enroll Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
