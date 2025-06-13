"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import LogoWhite from "../../public/assets/BWS-White.svg";
import LogoColor from "../../public/assets/BWS-Color.svg";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        <Link href="/" className="navbar-logo">
          <Image
            src={isScrolled ? LogoColor : LogoWhite}
            alt="BWS Logo"
            width={70}
            height={70}
          />
        </Link>

        <button
          className={` navbar-toggle  ${isMenuOpen && "active"} ${
            isScrolled && "navbar-toggle-scrolled"
          }`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={`navbar-menu ${isMenuOpen ? "active" : ""}`}>
          <li>
            <Link
              href="/"
              className={pathname === "/" ? "active" : ""}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/portfolio"
              className={pathname === "/portfolio" ? "active" : ""}
              onClick={() => setIsMenuOpen(false)}
            >
              Portfolio
            </Link>
          </li>
          {/* <li>
            <Link
              href="/projects"
              className={pathname === "/projects" ? "active" : ""}
              onClick={() => setIsMenuOpen(false)}
            >
              Project History
            </Link>
          </li> */}
          <li>
            <Link
              href="/jobs"
              className={pathname === "/jobs" ? "active" : ""}
              onClick={() => setIsMenuOpen(false)}
            >
              Jobs
            </Link>
          </li>
          <li>
            <Link
              href="/about"
              className={pathname === "/about" ? "active" : ""}
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              className={pathname === "/contact" ? "active" : ""}
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
