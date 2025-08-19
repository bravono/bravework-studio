"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import LogoWhite from "../../public/assets/BWS-White.svg";
import LogoColor from "../../public/assets/BWS-Color.svg";
import { Menu, X, User, LogOut, LayoutDashboard, Settings } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Extend the user type to include 'roles'
  type UserWithRoles = typeof session extends { user: infer U }
    ? U & { roles?: string[] }
    : never;
  const user = session?.user as UserWithRoles | undefined;

  const isAdmin =
    status === "authenticated" &&
    user?.roles?.map((role) => role.toLocaleLowerCase()).includes("admin");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const commonLinkClasses = `block px-3 py-2 rounded-md font-medium transition-colors duration-200`;
  const inactiveLinkClasses = `text-white hover:bg-gray-700 md:text-gray-900 md:hover:bg-gray-100`;
  const activeLinkClasses = `bg-white text-green hover:bg-white md:bg-blue-100 md:text-blue-600 md:hover:bg-blue-200`;

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out ${
        isScrolled
          ? "bg-white shadow-lg md:bg-white"
          : "bg-transparent md:bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src={isScrolled ? LogoColor : LogoWhite}
              alt="BWS Logo"
              width={70}
              height={70}
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link
              href="/"
              className={`${commonLinkClasses} ${
                pathname === "/" ? activeLinkClasses : inactiveLinkClasses
              }`}
            >
              Home
            </Link>
            <Link
              href="/portfolio"
              className={`${commonLinkClasses} ${
                pathname === "/portfolio"
                  ? activeLinkClasses
                  : inactiveLinkClasses
              }`}
            >
              Portfolio
            </Link>
            <Link
              href="/job"
              className={`${commonLinkClasses} ${
                pathname === "/job" ? activeLinkClasses : inactiveLinkClasses
              }`}
            >
              Jobs
            </Link>
            <Link
              href="/about"
              className={`${commonLinkClasses} ${
                pathname === "/about" ? activeLinkClasses : inactiveLinkClasses
              }`}
            >
              About
            </Link>
            <Link
              href="/contact"
              className={`${commonLinkClasses} ${
                pathname === "/contact"
                  ? activeLinkClasses
                  : inactiveLinkClasses
              }`}
            >
              Contact
            </Link>

            {/* User Dropdown */}
            <div className="relative ml-4">
              <button
                className={`p-2 rounded-full ${
                  isScrolled
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : "bg-gray-700 text-white hover:bg-gray-800"
                } focus:outline-none transition-colors duration-200`}
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <User className="w-6 h-6" />
              </button>
              {showDropdown && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none"
                  onMouseLeave={() => setShowDropdown(false)}
                >
                  {status === "authenticated" && session.user.name ? (
                    <>
                      <Link
                        href={
                          isAdmin
                            ? "/admin/dashboard"
                            : user
                            ? "/user/dashboard"
                            : "/dashboard"
                        }
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setShowDropdown(false);
                        }}
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setShowDropdown(false);
                        }}
                      >
                        <Settings className="w-4 h-4" />
                        My Account
                      </Link>
                      <button
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        onClick={() => {
                          signOut({ callbackUrl: "/auth/login" });
                          setIsMenuOpen(false);
                          setShowDropdown(false);
                        }}
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/auth/login"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setShowDropdown(false);
                      }}
                    >
                      Sign In/Up
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden ${
          isMenuOpen ? "block" : "hidden"
        } bg-green-600 shadow-lg`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            href="/"
            className={`${commonLinkClasses} ${
              pathname === "/" ? activeLinkClasses : inactiveLinkClasses
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/portfolio"
            className={`${commonLinkClasses} ${
              pathname === "/portfolio"
                ? activeLinkClasses
                : inactiveLinkClasses
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Portfolio
          </Link>
          <Link
            href="/job"
            className={`${commonLinkClasses} ${
              pathname === "/job" ? activeLinkClasses : inactiveLinkClasses
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Jobs
          </Link>
          <Link
            href="/about"
            className={`${commonLinkClasses} ${
              pathname === "/about" ? activeLinkClasses : inactiveLinkClasses
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            About
          </Link>
          <Link
            href="/contact"
            className={`${commonLinkClasses} ${
              pathname === "/contact" ? activeLinkClasses : inactiveLinkClasses
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Contact
          </Link>
          <div className="border-t border-gray-200 mt-2 pt-2">
            {status === "authenticated" && session.user.name ? (
              <>
                <Link
                  href={isAdmin ? "/admin/dashboard" : "/dashboard"}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  My Account
                </Link>
                <button
                  className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  onClick={() => {
                    signOut({ callbackUrl: "/auth/login" });
                    setIsMenuOpen(false);
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In/Up
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
