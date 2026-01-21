"use client";
import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ActiveCourseForm from "./ActiveCourseForm";
import InactiveCourseForm from "./InactiveCourseForm";

function NewsletterContent() {
  const searchParams = useSearchParams();
  const isActive = searchParams.get("isActive") === "true";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
        {/* Visual/Text Side */}
        <div className="p-10 md:p-16 flex flex-col justify-center bg-indigo-600 text-white relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-indigo-500 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-blue-400 rounded-full opacity-20 blur-3xl"></div>

          <div className="relative z-10">
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase bg-white/20 backdrop-blur-md rounded-full text-indigo-100 border border-white/10">
              Nexus Weekly
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6">
              Empower Your{" "}
              <span className="text-blue-300 italic">Workflow</span>
            </h1>
            <p className="text-lg md:text-xl text-indigo-100 mb-10 leading-relaxed font-light">
              Join 10,000+ creators getting weekly deep-dives into development,
              design, and digital strategy.
            </p>

            <div className="space-y-6">
              {[
                {
                  title: "Weekly Insights",
                  desc: "The best tech news, curated for you.",
                },
                {
                  title: "Exclusive Access",
                  desc: "First dibs on new course releases.",
                },
                {
                  title: "Community Perks",
                  desc: "Special discounts and free assets.",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 mt-1">
                    <svg
                      className="w-4 h-4 text-blue-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-white leading-none mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-indigo-200">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form Side */}
        <div className="p-10 md:p-16 bg-gray-50 flex items-center justify-center border-l border-gray-100">
          <div className="w-full max-w-sm">
            {isActive ? <ActiveCourseForm /> : <InactiveCourseForm />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewsletterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <NewsletterContent />
    </Suspense>
  );
}
