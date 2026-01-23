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
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Bravework Studio</h3>
            <p className="text-sm">
              Empowering creativity through technology education and digital
              solutions.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/BraveworkStudio?mibextid=ZbWKwL"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-green-500 hover:text-blue-500 transition-colors duration-200"
              >
                <Facebook size={24} />
              </a>
              <a
                href="https://x.com/YAhbideen"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="text-green-500 hover:text-blue-400 transition-colors duration-200"
              >
                <Twitter size={24} />
              </a>
              <a
                href="https://www.instagram.com/bravework_studio?igsh=bzJjZDlxNTZnY2h4"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-green-500 hover:text-pink-500 transition-colors duration-200"
              >
                <Instagram size={24} />
              </a>
              <a
                href="https://www.linkedin.com/in/ahbideen-y-74a232179?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-green-500 hover:text-blue-700 transition-colors duration-200"
              >
                <Linkedin size={24} />
              </a>
              <a
                href="https://tiktok.com/@techtalestudio"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="text-green-500 hover:text-black transition-colors duration-200"
              >
                {/* lucide-react does not have a dedicated TikTok icon */}
                <Square size={24} />
              </a>
              <a
                href="https://youtube.com/@AY-TechTaleStudio"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="text-green-500 hover:text-red-600 transition-colors duration-200"
              >
                <Youtube size={24} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Quick Links</h3>
            <div className="grid grid-cols-2 gap-4">
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-blue-500 transition-colors duration-200"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/order"
                    className="hover:text-blue-500 transition-colors duration-200"
                  >
                    Services
                  </Link>
                </li>
                <li>
                  <Link
                    href="/portfolio"
                    className="hover:text-blue-500 transition-colors duration-200"
                  >
                    Projects
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-blue-500 transition-colors duration-200"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-blue-500 transition-colors duration-200"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/jobs"
                    className="hover:text-blue-500 transition-colors duration-200"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/academy/courses"
                    className="hover:text-blue-500 transition-colors duration-200"
                  >
                    Courses
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faqs"
                    className="hover:text-blue-500 transition-colors duration-200"
                  >
                    FAQs
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Our Services</h3>
            <ul className="space-y-2 text-sm">
              <li>3D Modeling & Animation</li>
              <li>Web Development</li>
              <li>UI/UX Design</li>
              <li>Training Programs</li>
              <li>Game Development</li>
              <li>Voice-Over Services</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Contact Us</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <MapPin
                  size={20}
                  className="flex-shrink-0 text-green-500 mt-0.5"
                />
                <span>Katsina, Nigeria</span>
              </li>
              <li className="flex items-start gap-2">
                <Link
                  href="https://wa.me/2349023224596"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-blue-500 transition-colors duration-200"
                >
                  <MessageCircle
                    size={20}
                    className="flex-shrink-0 text-green-500"
                  />
                  <span>+234 902-322-4596</span>
                </Link>
              </li>
              <li className="flex items-start gap-2">
                <Mail
                  size={20}
                  className="flex-shrink-0 text-green-500 mt-0.5"
                />
                <span>support@braveworkstudio.com</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock
                  size={20}
                  className="flex-shrink-0 text-green-500 mt-0.5"
                />
                <span>Mon - Fri: 9:00 AM - 6:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-700 flex flex-col md:flex-row items-center justify-between text-sm">
          <p>© {currentYear} Bravework Studio. All rights reserved.</p>
          <div className="flex flex-wrap justify-center md:justify-end gap-x-6 mt-4 md:mt-0">
            <Link
              href="/privacy-policy"
              className="hover:text-blue-500 transition-colors duration-200"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-service"
              className="hover:text-blue-500 transition-colors duration-200"
            >
              Terms of Service
            </Link>
            <Link
              href="/refund-policy"
              className="hover:text-blue-500 transition-colors duration-200"
            >
              Refund Policy
            </Link>
            <Link
              href="/faqs"
              className="hover:text-blue-500 transition-colors duration-200"
            >
              FAQs
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
