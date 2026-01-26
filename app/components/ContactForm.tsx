"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { toast } from "react-toastify";
import { Outfit } from "next/font/google";

const outfit = Outfit({ subsets: ["latin"], weight: "400" });

interface ContactFormProps {
  defaultDepartment?: string;
  showDepartmentSelector?: boolean;
  title?: string;
  description?: string;
  accentColor?: string;
}

export default function ContactForm({
  defaultDepartment = "General",
  showDepartmentSelector = true,
  title = "Get in Touch",
  description = "Have a project in mind? We'd love to hear from you.",
  accentColor = "blue",
}: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    department: defaultDepartment,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
          department: defaultDepartment,
        });
        toast.success("Message sent successfully!");
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to send message. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const colorClasses = {
    blue: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-blue-600",
    green:
      "bg-green-600 hover:bg-green-700 focus:ring-green-500 text-green-600",
    purple:
      "bg-purple-600 hover:bg-purple-700 focus:ring-purple-500 text-purple-600",
    pink: "bg-pink-600 hover:bg-pink-700 focus:ring-pink-500 text-pink-600",
  };

  const accentHex =
    colorClasses[accentColor as keyof typeof colorClasses].split(" ")[3];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white rounded-3xl shadow-2xl overflow-hidden p-8 lg:p-12">
      {/* Contact Info */}
      <div className="space-y-8">
        <h2 className="text-3xl font-extrabold text-gray-900">{title}</h2>
        <p className="text-gray-600">{description}</p>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-lg ${accentColor === "green" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"}`}
            >
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Email</h3>
              <p className="text-gray-600">support@braveworkstudio.com</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-lg ${accentColor === "green" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"}`}
            >
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Phone / WhatsApp
              </h3>
              <p className="text-gray-600">+234 902-322-4596</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-lg ${accentColor === "green" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"}`}
            >
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Address</h3>
              <p className="text-gray-600">Katsina, Nigeria</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="flex flex-col">
          <label
            htmlFor="name"
            className="mb-2 text-sm font-medium text-gray-700"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 transition-colors duration-200"
            style={{ borderColor: formData.name ? "inherit" : "" }}
          />
        </div>
        <div className="flex flex-col">
          <label
            htmlFor="email"
            className="mb-2 text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 transition-colors duration-200"
          />
        </div>

        {showDepartmentSelector && (
          <div className="flex flex-col">
            <label
              htmlFor="department"
              className="mb-2 text-sm font-medium text-gray-700"
            >
              Department
            </label>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 transition-colors duration-200"
            >
              <option value="General">General Inquiry</option>
              <option value="Studio">Bravework Studio</option>
              <option value="Academy">Bravework Academy</option>
              <option value="Kids">Bravework Kids</option>
              <option value="Rentals">Hardware Rentals</option>
            </select>
          </div>
        )}

        <div className="flex flex-col">
          <label
            htmlFor="subject"
            className="mb-2 text-sm font-medium text-gray-700"
          >
            Subject
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 transition-colors duration-200"
            placeholder="What is this regarding?"
          />
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="message"
            className="mb-2 text-sm font-medium text-gray-700"
          >
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            value={formData.message}
            onChange={handleChange}
            required
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 transition-colors duration-200"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`flex items-center justify-center gap-2 w-full px-6 py-3 rounded-lg font-bold text-base text-white transition-colors duration-200 shadow-md ${
            accentColor === "green"
              ? "bg-green-600 hover:bg-green-700"
              : "bg-blue-600 hover:bg-blue-700"
          } ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {isSubmitting ? (
            <span className="animate-pulse">Sending...</span>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send Message
            </>
          )}
        </button>
      </form>
    </div>
  );
}
