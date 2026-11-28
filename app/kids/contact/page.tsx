"use client";

import React from "react";
import KidsSubNavBar from "../../components/KidsSubNavBar";
import Breadcrumbs from "../../components/Breadcrumbs";
import ContactForm from "../../components/ContactForm";
import { motion } from "framer-motion";
import { Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

export default function KidsContactPage() {
  return (
    <main className="bg-white min-h-screen">
      <KidsSubNavBar />

      <section className="py-20 lg:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Kids", href: "/kids" },
              { label: "Contact", href: "/kids/contact" },
            ]}
          />

          <div className="text-center mb-16 max-w-4xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-4xl md:text-6xl font-black text-gray-900 mb-6 ${outfit.className}`}
            >
              Contact <span className="text-pink-600">Bravework Kids</span>
            </motion.h1>
            <p className="text-xl text-gray-600 font-medium leading-relaxed">
              Have a question about our episodes, sponsorships, or educational
              content? We'd love to hear from parents, educators, and partners.
            </p>
          </div>

          <ContactForm
            defaultDepartment="Kids"
            showDepartmentSelector={false}
            title="Kids Inquiries"
            description="Our team loves hearing from our young fans and their parents! We typically respond within 24-48 hours."
            accentColor="pink"
          />
        </div>
      </section>
    </main>
  );
}
