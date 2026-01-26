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

export default function RentalsContactPage() {
  return (
    <main className="bg-white min-h-screen">
      <AcademySubNavBar />

      <section className="py-20 lg:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Academy", href: "/academy" },
              { label: "Rentals", href: "/academy/rentals" },
              { label: "Contact", href: "/academy/rentals/contact" },
            ]}
          />

          <div className="text-center mb-16 max-w-4xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-5xl sm:text-7xl font-black text-gray-900 mb-6 ${outfit.className}`}
            >
              Hardware <span className="text-orange-600">Inquiry</span>
            </motion.h1>
            <p className="text-xl text-gray-600 font-medium leading-relaxed">
              Need specific device specs, bulk rental pricing, or custom
              hardware configurations for your team or studies? Reach out to our
              hardware specialists.
            </p>
          </div>

          <ContactForm
            defaultDepartment="Rentals"
            showDepartmentSelector={false}
            title="Hardware Support"
            description="Our technical team typically responds within 12-24 hours. Let us know your hardware requirements."
            accentColor="pink" // Using pink as it's the closest to orange in my predefined colors for now
          />
        </div>
      </section>
    </main>
  );
}
