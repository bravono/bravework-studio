"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import LogoWhite from "../../public/assets/BWS-White.svg";
import LogoColor from "../../public/assets/BWS-Color.svg";
import "../css/navbar.css";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

 

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [session]);

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

          <li>
            <Link
              href="/job"
              className={pathname === "/job" ? "active" : ""}
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
          <li
            className="navbar-user"
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            <Link
              href={status === "authenticated" && session.user.name ? "/dashboard" : "/auth/login"}
              className={pathname === "/auth/login" ? "active" : ""}
              onClick={() => setIsMenuOpen(false)}
            >
              {status === "authenticated" && session.user.name ? <i className="fas fa-user"></i> : "Sign In/Up"}
            </Link>
            {status === "authenticated" && session.user.name && showDropdown && (
              <div className="navbar-dropdown">
                <Link
                  href="/dashboard"
                  className="dropdown-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="dropdown-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Account
                </Link>
                <button
                  className="dropdown-link"
                  style={{
                    border: "none",
                    background: "red",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    signOut({ callbackUrl: "/auth/login" }); // Redirect to login page after logout
                    setIsMenuOpen(false);
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}
