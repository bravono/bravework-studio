"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import LogoColor from "../../public/assets/BWS-Color.svg";
import {
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  Bell,
  Code,
  Clapperboard,
  House,
  Briefcase,
  Info,
  Mail,
  BookOpen,
  GraduationCap,
  Gamepad2,
  Building2,
  Users,
  Key,
  FileText,
  Sparkles as SparklesIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Extend the user type to include 'roles'
  type UserWithRoles = typeof session extends { user: infer U }
    ? U & { roles?: string[] }
    : never;
  const user = session?.user as UserWithRoles | undefined;

  const isAdmin =
    status === "authenticated" &&
    user?.roles?.map((role) => role.toLocaleLowerCase()).includes("admin");

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch unread notifications
  useEffect(() => {
    if (status === "authenticated") {
      const fetchNotifications = async () => {
        try {
          const res = await fetch("/api/user/notifications");
          if (res.ok) {
            const data = await res.json();
            const count = data.filter((n: any) => !n.isRead).length;
            setNotificationCount(count);
          }
        } catch (error) {
          console.error("Error fetching notifications in Navbar:", error);
        }
      };
      fetchNotifications();
      // Optionally poll every minute
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [status]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { label: "Home", href: "/", icon: House },
    {
      label: "Studio",
      icon: ChevronDown,
      items: [
        { label: "Studio Home", href: "/studio", icon: SparklesIcon },
        { label: "Our Services", href: "/studio/services", icon: Code },
        { label: "Portfolio", href: "/studio/portfolio", icon: Briefcase },
        { label: "Resources", href: "/studio/resources", icon: FileText },
        { label: "Get a Quote", href: "/studio/contact", icon: Mail },
      ],
    },
    {
      label: "Ecosystems",
      icon: ChevronDown,
      items: [
        { label: "Bravework Academy", href: "/academy", icon: GraduationCap },
        { label: "Bravework Kids", href: "/kids", icon: Gamepad2 },
        { label: "Bravework Rentals", href: "/academy/rentals", icon: Key },
      ],
    },
    {
      label: "Company",
      icon: ChevronDown,
      items: [
        { label: "About", href: "/about", icon: Info },
        { label: "Contact", href: "/contact", icon: Mail },
        { label: "Jobs", href: "/job", icon: Users },
      ],
    },
  ];

  const commonLinkClasses = `flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition-all duration-300`;
  const desktopInactiveClasses = `text-gray-700 hover:text-green-600 hover:bg-green-50`;
  const desktopActiveClasses = `text-green-700 bg-green-50 shadow-sm shadow-green-100`;

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/login" });
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 border-b ${
        isScrolled
          ? "bg-white/90 backdrop-blur-md py-2 border-gray-100 shadow-md"
          : "bg-white py-4 border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 relative group">
            <Image
              src={LogoColor}
              alt="BWS Logo"
              width={65}
              height={65}
              className="transition-transform duration-300 group-hover:scale-110"
            />
          </Link>

          {/* Desktop Menu */}
          <div
            className="hidden md:flex md:items-center gap-2"
            ref={dropdownRef}
          >
            {navLinks.map((link) => (
              <div key={link.label} className="relative group">
                {link.items ? (
                  <>
                    <button
                      onMouseEnter={() => setActiveDropdown(link.label)}
                      className={`${commonLinkClasses} ${
                        activeDropdown === link.label
                          ? desktopActiveClasses
                          : desktopInactiveClasses
                      }`}
                    >
                      {link.label}
                      <link.icon
                        className={`w-4 h-4 transition-transform duration-300 ${
                          activeDropdown === link.label ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence>
                      {activeDropdown === link.label && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          onMouseLeave={() => setActiveDropdown(null)}
                          className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50"
                        >
                          {link.items.map((item) => (
                            <Link
                              key={item.label}
                              href={item.href}
                              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:text-green-600 hover:bg-green-50 transition-colors"
                              onClick={() => setActiveDropdown(null)}
                            >
                              <item.icon className="w-5 h-5 text-gray-400 group-hover:text-green-500" />
                              {item.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link
                    href={link.href}
                    className={`${commonLinkClasses} ${
                      pathname === link.href
                        ? desktopActiveClasses
                        : desktopInactiveClasses
                    }`}
                  >
                    {link.label}
                  </Link>
                )}
              </div>
            ))}

            {/* Profile & Notifications Dropdown */}
            <div className="relative ml-4 pl-4 border-l border-gray-200">
              {status === "authenticated" ? (
                <>
                  <div className="hidden md:flex flex-col items-end mr-2">
                    {walletBalance !== null && (
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Balance
                      </span>
                    )}
                    {walletBalance !== null && (
                      <span className="text-sm font-black text-green-600">
                        ₦{(walletBalance / 100).toLocaleString()}
                      </span>
                    )}
                  </div>

                  <button
                    onMouseEnter={() => setActiveDropdown("profile")}
                    className={`relative flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition-all ${
                      activeDropdown === "profile"
                        ? "bg-gray-100 ring-4 ring-green-50"
                        : ""
                    }`}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white overflow-hidden border-2 border-white shadow-sm font-bold">
                        {user?.name?.split(" ")[0][0]?.toUpperCase() +
                          user?.name?.split(" ")[1][0]?.toUpperCase() || (
                          <User size={20} />
                        )}
                      </div>
                      {notificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white scale-110">
                          {notificationCount > 9 ? "9+" : notificationCount}
                        </span>
                      )}
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${
                        activeDropdown === "profile" ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {activeDropdown === "profile" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        onMouseLeave={() => setActiveDropdown(null)}
                        className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 overflow-hidden"
                      >
                        <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                            Signed in as
                          </p>
                          <p className="font-bold text-gray-900 truncate">
                            {user?.name}
                          </p>
                        </div>

                        <div className="p-2 space-y-1">
                          <Link
                            href={
                              isAdmin ? "/admin/dashboard" : "/user/dashboard"
                            }
                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all"
                            onClick={() => setActiveDropdown(null)}
                          >
                            <LayoutDashboard className="w-5 h-5 opacity-70" />
                            Dashboard
                          </Link>

                          <Link
                            href="/user/dashboard?tab=wallet"
                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all"
                            onClick={() => setActiveDropdown(null)}
                          >
                            <div className="flex items-center gap-3">
                              <Briefcase className="w-5 h-5 opacity-70" />
                              Wallet
                            </div>
                            {walletBalance !== null && (
                              <span className="ml-auto text-xs font-bold text-green-600">
                                ₦{(walletBalance / 100).toLocaleString()}
                              </span>
                            )}
                          </Link>

                          <Link
                            href="/user/dashboard/notifications"
                            className="flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all"
                            onClick={() => setActiveDropdown(null)}
                          >
                            <div className="flex items-center gap-3">
                              <Bell className="w-5 h-5 opacity-70" />
                              Notifications
                            </div>
                            {notificationCount > 0 && (
                              <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full">
                                {notificationCount}
                              </span>
                            )}
                          </Link>

                          <button
                            onClick={handleSignOut}
                            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium"
                          >
                            <LogOut className="w-5 h-5 opacity-70" />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-600/20 active:scale-95"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden gap-4">
            {status === "authenticated" && notificationCount > 0 && (
              <Link
                href="/user/dashboard?tab=notifications"
                className="relative p-2 rounded-full bg-gray-100 text-gray-600"
              >
                <Bell size={20} />
                <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>
              </Link>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 top-0 left-0 w-full h-screen bg-white z-[60] flex flex-col md:hidden"
          >
            <div className="p-6 flex justify-between items-center border-b border-gray-100">
              <Link href="/" onClick={() => setIsMenuOpen(false)}>
                <Image src={LogoColor} alt="BWS Logo" width={55} height={55} />
              </Link>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-xl bg-gray-50 text-gray-500"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* User Section */}
              {status === "authenticated" ? (
                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-2xl border border-green-100">
                  <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white text-xl font-bold border-2 border-white shadow-sm">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-green-700 font-medium">
                      Active Account
                    </p>
                  </div>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center p-4 bg-green-600 text-white rounded-2xl font-bold shadow-lg shadow-green-600/20"
                >
                  Sign In
                </Link>
              )}

              {/* Links */}
              <div className="space-y-2">
                {navLinks.map((link) => (
                  <div key={link.label} className="space-y-1">
                    {link.items ? (
                      <div className="pt-2">
                        <p className="px-4 text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">
                          {link.label}
                        </p>
                        <div className="grid grid-cols-1 gap-1">
                          {link.items.map((item) => (
                            <Link
                              key={item.label}
                              href={item.href}
                              onClick={() => setIsMenuOpen(false)}
                              className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-semibold transition-colors"
                            >
                              <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-green-100 transition-colors">
                                <item.icon className="w-5 h-5 text-gray-500" />
                              </div>
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={link.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all ${
                          pathname === link.href
                            ? "bg-green-50 text-green-700"
                            : "text-gray-900 border border-transparent"
                        }`}
                      >
                        <link.icon
                          className={`w-6 h-6 ${
                            pathname === link.href
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        />
                        {link.label}
                      </Link>
                    )}
                  </div>
                ))}
              </div>

              {status === "authenticated" && (
                <div className="pt-4 border-t border-gray-100 space-y-2">
                  <p className="px-4 text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">
                    Account Management
                  </p>
                  <Link
                    href={isAdmin ? "/admin/dashboard" : "/user/dashboard"}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-semibold"
                  >
                    <LayoutDashboard className="w-5 h-5 text-gray-400" />
                    Dashboard
                  </Link>
                  <Link
                    href="/user/dashboard?tab=wallet"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-semibold"
                  >
                    <Briefcase className="w-5 h-5 text-gray-400" />
                    Wallet
                  </Link>
                  <Link
                    href="/user/dashboard?tab=notifications"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-semibold"
                  >
                    <div className="flex items-center gap-4">
                      <Bell className="w-5 h-5 text-gray-400" />
                      Notifications
                    </div>
                    {notificationCount > 0 && (
                      <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] rounded-full font-bold">
                        {notificationCount}
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-4 w-full px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 font-semibold"
                  >
                    <LogOut className="w-5 h-5 opacity-70" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
