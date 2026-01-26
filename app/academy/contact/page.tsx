"use client";

import React from "react";
import AcademySubNavBar from "../../components/AcademySubNavBar";
import Breadcrumbs from "../../components/Breadcrumbs";
import ContactForm from "../../components/ContactForm";
import { motion } from "framer-motion";
import { Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

export default function AcademyContactPage() {
  return (
    <main className="bg-white min-h-screen">
      <AcademySubNavBar />

      <section className="py-20 lg:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Academy", href: "/academy" },
              { label: "Contact", href: "/academy/contact" },
            ]}
          />

          <div className="text-center mb-16 max-w-4xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-5xl sm:text-7xl font-black text-gray-900 mb-6 ${outfit.className}`}
            >
              Start Your <span className="text-blue-600">Learning Journey</span>
            </motion.h1>
            <p className="text-xl text-gray-600 font-medium leading-relaxed">
              Have questions about our courses, certifications, or enrollment?
              Our admissions team is here to guide you toward your future career
              in tech.
            </p>
          </div>

          <ContactForm
            defaultDepartment="Academy"
            showDepartmentSelector={false}
            title="Academy Admissions"
            description="Our team of academic advisors typically responds within 24 hours. Let's find the right path for you."
            accentColor="blue"
          />
        </div>
      </section>
    </main>
  );
}
