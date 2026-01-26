import React from "react";
import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  MessageCircle,
  MapPin,
  Mail,
  Clock,
  Square,
  ArrowRight,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "Core Ecosystem",
      links: [
        { label: "About Bravework", href: "/about" },
        { label: "General Contact", href: "/contact" },
        { label: "Jobs & Careers", href: "/jobs" },
        { label: "Latest Blog", href: "/blog" },
      ],
    },
    {
      title: "Studio",
      links: [
        { label: "Studio Home", href: "/studio" },
        { label: "About Studio", href: "/studio/about" },
        { label: "Digital Services", href: "/studio/services" },
        { label: "Portfolio", href: "/studio/portfolio" },
        { label: "Contact Studio", href: "/studio/contact" },
      ],
    },
    {
      title: "Academy",
      links: [
        { label: "Academy Home", href: "/academy" },
        { label: "About Academy", href: "/academy/about" },
        { label: "All Courses", href: "/academy/courses" },
        { label: "Certifications", href: "/academy/certifications" },
        { label: "Rentals About", href: "/academy/rentals/about" },
        { label: "Contact Academy", href: "/academy/contact" },
      ],
    },
    {
      title: "Kids & Legal",
      links: [
        { label: "Kids Home", href: "/kids" },
        { label: "About Kids", href: "/kids/about" },
        { label: "Contact Kids", href: "/kids/contact" },
        { label: "Privacy Policy", href: "/privacy-policy" },
        { label: "Terms of Service", href: "/terms-of-service" },
      ],
    },
  ];

  return (
    <footer className="bg-gray-950 text-gray-400 py-20 border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {footerLinks.map((section) => (
            <div key={section.title} className="space-y-6">
              <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">
                {section.title}
              </h3>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="hover:text-green-500 transition-colors duration-200 flex items-center gap-2 group"
                    >
                      <ArrowRight
                        size={12}
                        className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all"
                      />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-12 border-t border-gray-900 flex flex-col lg:flex-row justify-between items-center gap-8">
          <div className="space-y-4 text-center lg:text-left">
            <h3 className="text-xl font-bold text-white">Bravework Studio</h3>
            <p className="text-sm max-w-sm">
              Nigerian-born creative powerhouse driving the digital economy
              through specialized arms.
            </p>
            <div className="flex justify-center lg:justify-start space-x-4">
              <a
                href="https://facebook.com/BraveworkStudio"
                target="_blank"
                className="text-gray-500 hover:text-green-500 transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://x.com/YAhbideen"
                target="_blank"
                className="text-gray-500 hover:text-green-500 transition-colors"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://instagram.com/bravework_studio"
                target="_blank"
                className="text-gray-500 hover:text-green-500 transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://linkedin.com/in/ahbideen-y-74a232179"
                target="_blank"
                className="text-gray-500 hover:text-green-500 transition-colors"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-sm">
            <div className="space-y-3">
              <h4 className="font-bold text-white">Contact</h4>
              <p className="flex items-center gap-2">
                <Mail size={16} className="text-green-500" />{" "}
                support@braveworkstudio.com
              </p>
              <p className="flex items-center gap-2">
                <MessageCircle size={16} className="text-green-500" /> +234
                902-322-4596
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-bold text-white">Location</h4>
              <p className="flex items-center gap-2">
                <MapPin size={16} className="text-green-500" /> Katsina & Lagos,
                Nigeria
              </p>
              <p className="flex items-center gap-2">
                <Clock size={16} className="text-green-500" /> Mon-Fri: 9AM -
                6PM
              </p>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-gray-900 text-center text-[10px] uppercase tracking-widest text-gray-600">
          <p>© {currentYear} Bravework Studio. Built for African Innovation.</p>
        </div>
      </div>
    </footer>
  );
}
