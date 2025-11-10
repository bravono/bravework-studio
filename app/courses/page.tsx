"use client";

import React from "react";
import CourseList from "../components/CourseList";

export default function coursesPage() {
  const videoStyle =
    "flex flex-col items-center justify-center bg-gray-100 rounded-3xl shadow-lg p- sm:p-8 w-full h-full";

  return (
    <main className="bg-gray-50 min-h-screen">
      <CourseList page="course" />
      {/* Why 3D Technology Matters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className={videoStyle}>
          <h2 className="text-3xl sm:text-4xl font-bold text-secondary-dark mb-6 text-center">
            Why 3D Technology Matter at All
          </h2>
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/JCxr3hcwtvU?si=SWblajsrognJ0EFm"
            title="YouTube video player"
            className="rounded-3xl max-w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          ></iframe>
        </div>

        {/* Student Testimonial */}
        <div className={videoStyle}>
          <h2 className="text-3xl sm:text-4xl font-bold text-secondary-dark mb-6 text-center">
            Watch Shaka's Story With Us
          </h2>
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/RzUtD2gy_rQ?si=27Y0JpUrUgq16zx0"
            title="YouTube video player"
            className="rounded-3xl"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          ></iframe>
        </div>
      </div>
    </main>
  );
}
