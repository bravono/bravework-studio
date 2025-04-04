import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Company Info */}
          <div className="footer-section">
            <h3>Bravework Studio</h3>
            <p>Empowering creativity through technology education and digital solutions.</p>
            <div className="social-links">
              <a href="https://www.facebook.com/BraveworkStudio?mibextid=ZbWKwL" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="https://x.com/YAhbideen" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://www.instagram.com/bravework_studio?igsh=bzJjZDlxNTZnY2h4" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://www.linkedin.com/in/ahbideen-y-74a232179?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-linkedin"></i>
              </a>
              <a href="https://tiktok.com/@techtalestudio" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-tiktok"></i>
              </a>
              <a href="https://youtube.com/@AY-TechTaleStudio" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3>Quick Links</h3>
            <div className="footer-links">
              <ul>
                <li><Link href="/about">About Us</Link></li>
                <li><Link href="/services">Services</Link></li>
                <li><Link href="/projects">Projects</Link></li>
                <li><Link href="/contact">Contact</Link></li>
              </ul>
              <ul>
                <li><Link href="/blog">Blog</Link></li>
                <li><Link href="/jobs">Careers</Link></li>
                <li><Link href="/training">Training</Link></li>
                <li><Link href="/faq">FAQ</Link></li>
              </ul>
            </div>
          </div>

          {/* Services */}
          <div className="footer-section">
            <h3>Our Services</h3>
            <ul>
              <li>3D Modeling & Animation</li>
              <li>Web Development</li>
              <li>UI/UX Design</li>
              <li>Kids Training Programs</li>
              <li>Corporate Training</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h3>Contact Us</h3>
            <ul className="contact-info">
              <li>
                <i className="fas fa-map-marker-alt"></i>
                <span>Abuja, Nigeria</span>
              </li>
              <li>
                <Link href="https://wa.me/2349023224596" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-whatsapp"></i>
                <span>+234 902-322-4596</span>
                </Link>
              </li>
              <li>
                <i className="fas fa-envelope"></i>
                <span>info@braveworkstudio.com</span>
              </li>
              <li>
                <i className="fas fa-clock"></i>
                <span>Mon - Fri: 9:00 AM - 6:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>&copy; {new Date().getFullYear()} Bravework Studio. All rights reserved.</p>
            <div className="footer-bottom-links">
              <Link href="/privacy-policy">Privacy Policy</Link>
              <Link href="/terms-of-service">Terms of Service</Link>
              <Link href="/refund-policy">Refund Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 