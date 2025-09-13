"use client";
import React, { useCallback, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Course } from "@/app/types/app";

import {
  Sparkles,
  Users,
  Clock,
  ExternalLink,
  Github,
  Award,
  Circle,
  CheckCircle,
  Shapes,
  Home,
  Car,
  Plane,
  Ghost,
  Trees,
  ChevronDown,
} from "lucide-react";

export default function CoursePage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState<Course>();

  const isActive = course?.isActive;

  const fetchCourse = useCallback(async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch course");
      }

      const data = await res.json();
      setCourse(data[0]);
    } catch (error) {
      console.error("Error fetching course:", error);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  const coursesData = [
    {
      id: 1, // backend
      title: "3D Animation Adventure for Kids",
      tagline: "Program Title: 3D Animation Adventure for Kids", // backend
      targetAge: "7–14 years", // backend
      duration: "8 weeks (1 level per week, 1 per session)", // backend
      software: "Blender (free, open-source)",
      instructor: "Ahbideen Yusuf",
      instructorTitle: "3D Generalist and Founder of Bravework Studio",
      overview:
        "This beginner-friendly program introduces kids to 3D animation through fun, hands-on projects using Blender. From creating simple shapes to animating flying cars and mysterious characters, kids will build their own 3D world while learning valuable STEM/STEAM skills. No prior experience is required. Just curiosity and creativity!",
      levels: [
        {
          level: "Level 1",
          title: "Getting Started with Blender",
          objective:
            "Learn to install and navigate Blender’s interface, building confidence in 3D software.",
          description:
            "Download and install Blender with step-by-step guidance. Explore the Blender interface through a fun, guided tour, learning basic tools like moving, scaling, and rotating objects.",
          activity:
            "Create a simple 3D cube and transform it into a colorful toy block to understand the workspace.",
          whyFun:
            "Kids personalize their block with colors, making their first 3D creation in minutes!",
          outcomes: [
            "Understand software installation",
            "master basic navigation",
            "create a simple 3D object.",
          ],
          parentsInfo:
            "Builds technical literacy and problem-solving skills, setting a foundation for future tech learning.",
          icon: Shapes,
        },
        {
          level: "Level 2",
          title: "Building a 3D Village Street",
          objective:
            "Create a simple 3D scene using basic shapes and learn lighting basics.",
          description:
            "Build a charming 3D village street using basic shapes (cubes, cylinders) in Blender. Learn to combine shapes to form houses and trees, and change lighting to turn day into night with one click.",
          activity:
            "Design a colorful street scene, experimenting with colors and lighting effects.",
          whyFun:
            "Kids create their own mini-world and see how a single click transforms their scene, sparking creativity!",
          outcomes: [
            "Master basic modeling",
            "apply colors/textures",
            "adjust lighting settings.",
          ],
          parentsInfo:
            "Encourages artistic expression and introduces kids to environmental design concepts used in games and films.",
          icon: Home,
        },
        {
          level: "Level 3",
          title: "Crafting a Hovering Car",
          objective:
            "Customize shapes to create a fantasy vehicle and introduce basic animation.",
          description:
            "Modify basic shapes to design a futuristic hovering car, learning to edit vertices and edges. Animate the car to “fly” out of the village street from Level 2.",
          activity:
            "Create and animate a unique hovering car, choosing its colors and style.",
          whyFun:
            "Kids bring their sci-fi dreams to life, making their car soar through their 3D world!",
          outcomes: [
            "Understand shape editing",
            "apply basic animation techniques",
            "integrate objects into a scene.",
          ],
          parentsInfo:
            "Fosters problem-solving and introduces animation principles used in professional studios.",
          icon: Car,
        },
        {
          level: "Level 4",
          title: "Designing a Village Island",
          objective:
            "Build a complex 3D environment and encourage creative storytelling.",
          description:
            "Expand their world by creating a 3D island village where their hovering car lands. Add details like trees, water, and houses, and share ideas for what their island includes (e.g., a park, a castle).",
          activity:
            "Design a unique island village, customizing elements based on their imagination.",
          whyFun:
            "Kids become world-builders, shaping a unique island and sharing their creative ideas with the group.",
          outcomes: [
            "Master scene composition",
            "apply advanced modeling techniques",
            "practice creative collaboration.",
          ],
          parentsInfo:
            "Enhances teamwork and storytelling skills, preparing kids for creative and technical careers.",
          icon: Trees,
        },
        {
          level: "Level 5",
          title: "Creating Mysterious Characters",
          objective:
            "Design and animate a custom 3D character to enhance storytelling skills.",
          description:
            "Create a mysterious character (e.g., a pirate, alien, or magical creature) to inhabit their island. Learn basic character modeling and simple animation (e.g., walking or waving) with instructor guidance.",
          activity:
            "Design a unique character and animate it to interact with the island village, sharing their character’s story.",
          whyFun:
            "Kids invent their own character and bring it to life, telling a story through animation!",
          outcomes: [
            "Learn character modeling",
            "basic rigging",
            "storytelling through animation.",
          ],
          parentsInfo:
            "Boosts creativity and narrative skills, aligning with media and game design industries.",
          icon: Ghost,
        },
        {
          level: "Level 6",
          title: "Animating a Flying Aircraft",
          objective:
            "Master advanced modeling and animation to create a dynamic 3D scene.",
          description:
            "Build and animate a detailed 3D aircraft (e.g., a spaceship or plane) that flies across their island. Add advanced effects like camera animation and motion blur, and optionally place a character inside.",
          activity:
            "Create a short animated sequence of their aircraft flying, choosing its design and flight path.",
          whyFun:
            "Kids produce a professional-looking animation, deciding their aircraft’s story and style!",
          outcomes: [
            "Master advanced modeling",
            "animation",
            "camera techniques",
            "rendering.",
          ],
          parentsInfo:
            "Prepares kids for advanced STEM/STEAM careers in animation, gaming, or film production.",
          icon: Plane,
        },
      ],
      details: {
        prerequisites:
          "No prior experience needed; just a computer (Windows/Mac/Linux) and enthusiasm!",
        duration:
          "8 weeks, with one 1-hour session per week (flexible for online via Zoom).",
        materials:
          "Free Blender software (download at blender.org). A mouse is recommended for easier navigation.",
        classSize: "Small groups (5–10 kids) for personalized attention.",
        feedback:
          "Weekly opportunities for kids to share ideas and showcase projects, fostering creativity and confidence.",
        certification:
          "Kids receive a Bravework Studio 3D Animation Certificate upon completion, celebrating their new skills!",
        cost: "Check www.braveworkstudio.com/courses for the updated price.",
      },
      whyChooseUs: [
        {
          title: "Fun and Engaging",
          description:
            "Projects like flying cars and mysterious characters keep kids excited and motivated.",
        },
        {
          title: "STEM/STEAM Focus",
          description:
            "Builds skills in science, technology, engineering, arts, and math, preparing kids for future careers.",
        },
        {
          title: "Tailored for Kids",
          description:
            "Designed for ages 8–14, with beginner-friendly steps and expert guidance from Ahbideen Yusuf, a 3D generalist and Tryotek founder.",
        },
        {
          title: "Community Impact",
          description:
            "Part of Bravework Studio’s mission is to empower local kids with creative and technical skills.",
        },
      ],
      howToJoin: [
        "Contact Ahbideen Yusuf at ahbideeny@braveworkstudio.com.",
        "Sign up for our next workshop at www.braveworkstudio.com/courses.",
        "Follow us on Bravework_studio for updates and kid-created 3D showcases!",
      ],
    },
  ];

  // Find the current course based on the courseId
  const currentCourse = coursesData.find(
    (course) => course.id.toString() === courseId
  );

  if (!currentCourse) {
    return <div className="text-center py-12">Course not found</div>;
  }

  return (
    <div className="bg-white min-h-screen py-12 font-[Inter]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl mt-10 font-extrabold text-secondary-dark leading-tight mb-2 rounded-xl">
            {currentCourse.title}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 font-medium">
            {currentCourse.tagline}
          </p>
        </div>

        {/* Course Overview Card */}
        <div className="bg-gray-100 rounded-3xl shadow-lg p-6 sm:p-8 mb-12 border-2 border-primary-light">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Instructor and quick details */}
            <div className="flex flex-col space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-dark">
                Course Overview
              </h2>
              <div className="flex items-center space-x-4">
                <Users className="text-secondary" />
                <span className="text-gray-700 font-medium">Age:</span>
                <span className="font-bold text-gray-900">
                  {currentCourse.targetAge}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <Clock className="text-secondary" />
                <span className="text-gray-700 font-medium">Duration:</span>
                <span className="font-bold text-gray-900">
                  {currentCourse.duration}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <Github className="text-secondary" />
                <span className="text-gray-700 font-medium">Software:</span>
                <span className="font-bold text-gray-900">
                  {currentCourse.software}
                </span>
              </div>
              <div className="mt-4 border-t pt-4">
                <p className="text-gray-700">
                  <span className="font-semibold text-secondary-dark">
                    Instructor:
                  </span>{" "}
                  {currentCourse.instructor}, {currentCourse.instructorTitle}
                </p>
              </div>
            </div>
            {/* Overview paragraph */}
            <div>
              <p className="text-gray-700 leading-relaxed text-base sm:text-lg rounded-xl bg-primary-light/10 border-l-4 border-primary p-4 shadow-inner">
                {currentCourse.overview}
              </p>
            </div>
          </div>
        </div>

        {/* Levels Section */}
        <div className="bg-gray-100 rounded-3xl shadow-lg p-6 sm:p-8 mb-12 border-2 border-primary-light">
          <h2 className="text-3xl sm:text-4xl font-bold text-secondary-dark text-center mb-8">
            <Award className="inline-block w-10 h-10 mr-2 text-secondary" />
            Program Levels
          </h2>
          <div className="space-y-6">
            {currentCourse.levels.map((level, index) => (
              <LevelCard key={index} level={level} />
            ))}
          </div>
        </div>

        {/* Program Details Section */}
        <div className="bg-gray-100 rounded-3xl shadow-lg p-6 sm:p-8 mb-12 border-2 border-primary-light">
          <h2 className="text-3xl sm:text-4xl font-bold text-secondary-dark text-center mb-8">
            Program Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(currentCourse.details).map(([key, value]) => (
              <div
                key={key}
                className="bg-primary-light/10 rounded-xl p-4 flex items-start space-x-4"
              >
                <Circle className="w-5 h-5 mt-1 text-primary flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-primary-dark capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </h3>
                  <p className="text-gray-700 text-sm mt-1">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose Us & How to Join Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Why Choose Us */}
          <div className="bg-gray-100 rounded-3xl shadow-lg p-6 sm:p-8 border-2 border-primary-light">
            <h2 className="text-3xl sm:text-4xl font-bold text-secondary-dark mb-6 text-center">
              Why Choose Us?
            </h2>
            <ul className="space-y-4">
              {currentCourse.whyChooseUs.map((item, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="mt-1 flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.title}
                    </h3>
                    <p className="text-gray-700 text-sm mt-1">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* How to Join */}
          <div className="bg-gray-100 rounded-3xl shadow-lg p-6 sm:p-8 border-2 border-primary-light">
            <h2 className="text-3xl sm:text-4xl font-bold text-secondary-dark mb-6 text-center">
              How to Join
            </h2>
            <ul className="space-y-4">
              {currentCourse.howToJoin.map((item, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <ExternalLink className="w-5 h-5 mt-1 text-secondary flex-shrink-0" />
                  <p className="text-gray-700">{item}</p>
                </li>
              ))}
            </ul>
            {isActive && (
              <Link
                className="mt-8 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-primary hover:bg-primary-dark transition-colors duration-200"
                href={`/auth/signup?enroll=true&courseId=${courseId}`}
              >
                Sign Up Now
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable component for each level card with expand/collapse functionality
const LevelCard = ({ level }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const LevelIcon = level.icon;

  return (
    <div
      className="bg-primary-light/10 p-6 rounded-2xl shadow-inner cursor-pointer transition-transform transform hover:scale-[1.01]"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <LevelIcon className="w-10 h-10 text-primary" />
          <h3 className="text-xl font-bold text-primary-dark">
            {level.level}: {level.title}
          </h3>
        </div>
        <ChevronDown
          className={`w-6 h-6 text-secondary transform transition-transform duration-300 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </div>

      {isExpanded && (
        <div className="mt-4 text-gray-700 space-y-3 transition-opacity duration-300 opacity-100">
          <div className="bg-secondary-light/10 p-3 rounded-lg border-l-4 border-secondary">
            <h4 className="font-semibold text-secondary-dark">Objective:</h4>
            <p>{level.objective}</p>
          </div>
          <p>
            <span className="font-semibold text-secondary-dark">
              What Kids Will Do:
            </span>{" "}
            {level.description}
          </p>
          <p>
            <span className="font-semibold text-secondary-dark">Activity:</span>{" "}
            {level.activity}
          </p>
          <p>
            <span className="font-semibold text-secondary-dark">
              Why It’s Fun:
            </span>{" "}
            {level.whyFun}
          </p>
          <p>
            <span className="font-semibold text-secondary-dark">
              Learning Outcomes:
            </span>{" "}
            {level.outcomes.join(", ")}
          </p>
          <p>
            <span className="font-semibold text-secondary-dark">
              For Parents:
            </span>{" "}
            {level.parentsInfo}
          </p>
        </div>
      )}
    </div>
  );
};
