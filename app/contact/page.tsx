"use client";

import React from "react";
import Navbar from "../components/Navbar";
import { Nosifer, Outfit } from "next/font/google";
import ContactForm from "../components/ContactForm";

const nosifer = Nosifer({ subsets: ["latin"], weight: "400" });
const outfit = Outfit({ subsets: ["latin"], weight: ["400", "700", "900"] });

export default function Contact() {
  return (
    <main className="bg-gray-50 min-h-screen">
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1
              className={`text-5xl md:text-7xl font-black text-gray-900 mb-6 ${outfit.className}`}
            >
              Contact Us
            </h1>
            <p className="mt-4 text-xl text-gray-600 font-medium">
              We'd love to hear from you! Reach out and we'll get back to you as
              soon as possible.
            </p>
          </div>

          <ContactForm
            defaultDepartment="General"
            showDepartmentSelector={true}
            title="General Inquiries"
            description="Whether you have a question about our ecosystem or you're not sure which department to talk to, we're here to help."
          />
        </div>
      </section>
    </main>
  );
}
