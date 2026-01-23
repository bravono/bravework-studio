"use client";

import React, { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { Outfit } from "next/font/google";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  Clock,
  Globe,
} from "lucide-react";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";

import StudioSubNavBar from "../../components/StudioSubNavBar";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});

function Contact() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "consultation",
    message: "",
  });

  useEffect(() => {
    const category = searchParams.get("category");
    const scope = searchParams.get("scope");
    const timeline = searchParams.get("timeline");

    if (category || scope || timeline) {
      let initialMessage =
        "I'm interested in a project with the following details:\n";
      if (category) initialMessage += `- Category: ${category}\n`;
      if (scope) initialMessage += `- Scope: ${scope}\n`;
      if (timeline) initialMessage += `- Timeline: ${timeline}\n`;

      setFormData((prev) => ({
        ...prev,
        message: initialMessage,
        subject: category || "consultation",
      }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading("Sending your inquiry...");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({
          name: "",
          email: "",
          subject: "consultation",
          message: "",
        });
        toast.update(loadingToast, {
          render: "Inquiry sent successfully! We'll be in touch.",
          type: "success",
          isLoading: false,
          autoClose: 5000,
        });
      } else {
        toast.update(loadingToast, {
          render: "Failed to send inquiry. Please try again.",
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      }
    } catch (err) {
      toast.update(loadingToast, {
        render: "An error occurred. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <main className="bg-black min-h-screen">
      <StudioSubNavBar />

      <section className="py-24 bg-gray-950 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-5xl sm:text-7xl font-black text-white mb-6 ${outfit.className}`}
          >
            Start a <span className="text-green-500">Conversation</span>
          </motion.h1>
          <p className="text-xl text-gray-400">
            Have a project in mind? Whether you're in Lagos, Abuja, or anywhere
            globally, our specialized team is ready to bring your vision to
            life.
          </p>
        </div>
      </section>

      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Contact Info & Nigerian Context */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="space-y-12"
            >
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">
                  Expertise at Your Service
                </h2>
                <p className="text-gray-400 text-lg leading-relaxed">
                  Bravework Studio is more than just a service provider. We are
                  your technical partners in the evolving digital economy of
                  Nigeria and beyond.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-8">
                <div className="flex gap-4">
                  <div className="p-4 bg-green-500/10 rounded-2xl text-green-500 h-fit">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">Fast Response</h3>
                    <p className="text-gray-400 text-sm">
                      We typically respond within 12-24 hours.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-500 h-fit">
                    <Globe size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">
                      Global Standard
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Nigerian heart, world-class execution.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-gray-800">
                <div className="flex items-center gap-4 text-gray-300">
                  <Mail className="text-green-500" />
                  <span>support@braveworkstudio.com</span>
                </div>
                <div className="flex items-center gap-4 text-gray-300">
                  <Phone className="text-green-500" />
                  <span>+234 902-322-4596 (WhatsApp available)</span>
                </div>
                <div className="flex items-center gap-4 text-gray-300">
                  <MapPin className="text-green-500" />
                  <span>Katsina & Lagos, Nigeria (Worldwide Remote)</span>
                </div>
              </div>
            </motion.div>

            {/* Inquiry Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 p-8 sm:p-12 rounded-[2.5rem] shadow-2xl"
            >
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-1">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Your name"
                      className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-green-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="Your email"
                      className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-green-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-1">
                    Interest
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-green-500 transition-colors"
                  >
                    <option value="consultation">Free Consultation</option>
                    <option value="web">Web/Mobile Development</option>
                    <option value="3d">3D Modeling & Animation</option>
                    <option value="uiux">UI/UX Design</option>
                    <option value="other">Other Inquiry</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-1">
                    Message
                  </label>
                  <textarea
                    name="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="Tell us about your project..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-green-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 py-5 rounded-2xl text-white font-black uppercase tracking-[0.2em] shadow-lg shadow-green-900/20 active:scale-95 transition-all"
                >
                  Submit Inquiry <Send size={20} />
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function StudioContact() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Contact />
    </Suspense>
  );
}
