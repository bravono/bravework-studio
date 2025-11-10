import React from "react";
import { notFound } from "next/navigation";
import { testimonials } from "../../services/localDataService";
import { Quote } from "lucide-react";

export default async function TestimonialDetailPage({
  params,
}: {
  params: { id: number };
}) {
  const testimonial = testimonials.find((t) => t.id === Number(params.id));

  if (!testimonial) {
    notFound();
  }

  const customerTestimony = testimonial
    ? testimonials.filter((t) => t.companyName === testimonial.companyName)
    : [];

  return (
    <div className="min-h-screen min-w-screen mt-10 bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full mx-auto p-6 sm:p-8 md:p-10 bg-white rounded-2xl shadow-xl space-y-8">
        {/* Company Header */}
        <div className="flex flex-col items-center text-center">
          <img
            src={testimonial.avatar}
            alt={testimonial.companyName}
            className="w-24 h-24 rounded-full object-cover ring-2 ring-green-600 ring-offset-2 mb-4"
          />
          <h2 className="text-3xl font-bold text-gray-900">
            {testimonial.companyName}
          </h2>
        </div>

        {/* Testimonial List */}
        <div className="space-y-10">
          {customerTestimony.map((t, index) => (
            <div key={index} className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">{t.heading}</h3>
              <div className="relative p-6 bg-gray-100 rounded-xl">
                <Quote className="absolute top-4 left-4 h-8 w-8 text-gray-400" />
                <blockquote className="pl-12 text-gray-700 text-lg leading-relaxed italic">
                  “{t.body}”
                </blockquote>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
