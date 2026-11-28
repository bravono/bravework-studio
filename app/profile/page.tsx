"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  User,
  Lock,
  Shield,
  Eye,
  EyeOff,
  Save,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Mail,
  Phone,
  Building,
  FileText,
} from "lucide-react";
import Link from "next/link";

interface UserProfileData {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  bio: string;
  profileImage?: string;
  memberSince?: string;
  emailVerified?: boolean;
  isVerified?: boolean;
  twoFactorEnabled?: boolean;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"profile" | "password" | "security">("profile");

  // Profile Form State
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileData, setProfileData] = useState<UserProfileData>({
    fullName: "",
    email: "",
    phone: "",
    companyName: "",
    bio: "",
  });

  // Password Form State
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Determine user dashboard back link
  const roles = (session?.user as any)?.roles;
  const isAdmin =
    (session?.user as any)?.role === "admin" ||
    (Array.isArray(roles) &&
      roles.some(
        (r: any) =>
          typeof r === "string"
            ? r.toLowerCase() === "admin"
            : r.roleName?.toLowerCase() === "admin"
      ));

  const dashboardLink = isAdmin ? "/admin/dashboard" : "/user/dashboard";

  // Fetch Profile Data
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (status === "authenticated") {
      const fetchProfile = async () => {
        setProfileLoading(true);
        try {
          const res = await fetch("/api/user/profile");
          if (!res.ok) {
            throw new Error("Failed to load profile");
          }
          const data = await res.json();
          setProfileData({
            fullName: data.fullName || "",
            email: data.email || "",
            phone: data.phone || "",
            companyName: data.companyName || "",
            bio: data.bio || "",
            profileImage: data.profileImage || "",
            memberSince: data.memberSince || "",
            emailVerified: data.emailVerified,
            isVerified: data.isVerified,
            twoFactorEnabled: data.twoFactorEnabled,
          });
        } catch (error: any) {
          toast.error(error.message || "Could not fetch profile");
        } finally {
          setProfileLoading(false);
        }
      };

      fetchProfile();
    }
  }, [status, router]);

  // Check for #password in URL hash
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#password") {
      setActiveTab("password");
    }
  }, []);

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      toast.success("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setPasswordSaving(false);
    }
  };

  if (status === "loading" || profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
          <p className="text-sm font-medium text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href={dashboardLink}
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors mb-2"
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Account Settings
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage your personal information, security credentials, and preferences.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-lg shadow-md">
              {profileData.fullName
                ? profileData.fullName.charAt(0).toUpperCase()
                : "U"}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {profileData.fullName || "User"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {profileData.email}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 space-x-8">
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-4 px-1 inline-flex items-center gap-2 font-bold text-sm border-b-2 transition-colors ${
              activeTab === "profile"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            <User size={18} />
            Edit Profile
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`pb-4 px-1 inline-flex items-center gap-2 font-bold text-sm border-b-2 transition-colors ${
              activeTab === "password"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            <Lock size={18} />
            Change Password
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`pb-4 px-1 inline-flex items-center gap-2 font-bold text-sm border-b-2 transition-colors ${
              activeTab === "security"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            <Shield size={18} />
            Security & MFA
          </button>
        </div>

        {/* Tab 1: Edit Profile */}
        {activeTab === "profile" && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700">
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <User size={16} />
                    </div>
                    <input
                      type="text"
                      name="fullName"
                      value={profileData.fullName}
                      onChange={handleProfileChange}
                      required
                      placeholder="e.g. John Doe"
                      className="pl-10 w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      required
                      placeholder="your@email.com"
                      className="pl-10 w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Changing email will require confirmation sent to your new email.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Phone size={16} />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      placeholder="+1 (555) 000-0000"
                      className="pl-10 w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Company / Organization
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Building size={16} />
                    </div>
                    <input
                      type="text"
                      name="companyName"
                      value={profileData.companyName}
                      onChange={handleProfileChange}
                      placeholder="e.g. Acme Innovations"
                      className="pl-10 w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Bio / Professional Summary
                </label>
                <textarea
                  name="bio"
                  rows={4}
                  value={profileData.bio}
                  onChange={handleProfileChange}
                  placeholder="Share a brief overview of your background, industry, or goals..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition"
                >
                  {profileSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save size={16} /> Save Profile Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Change Password */}
        {activeTab === "password" && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700">
            <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-xl">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    placeholder="Enter your current password"
                    className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    placeholder="At least 8 characters"
                    className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <CheckCircle
                      size={13}
                      className={
                        passwordData.newPassword.length >= 8
                          ? "text-green-500"
                          : "text-gray-300"
                      }
                    />
                    <span>Minimum 8 characters</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    placeholder="Repeat your new password"
                    className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordData.confirmPassword && (
                  <p
                    className={`text-xs mt-1 font-medium ${
                      passwordData.newPassword === passwordData.confirmPassword
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {passwordData.newPassword === passwordData.confirmPassword
                      ? "Passwords match"
                      : "Passwords do not match"}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition"
                >
                  {passwordSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Updating Password...
                    </>
                  ) : (
                    <>
                      <Lock size={16} /> Update Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Security & MFA */}
        {activeTab === "security" && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Multi-Factor Authentication (MFA)
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Protect your account with two-step verification using Google Authenticator, Authy, or another authenticator app.
              </p>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-xl border border-indigo-100 dark:border-indigo-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 rounded-xl">
                  <Shield size={24} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">
                    Two-Factor Authentication
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Configure your MFA security key and authenticator apps.
                  </p>
                </div>
              </div>

              <Link
                href="/admin/settings/security"
                className="inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition shadow"
              >
                Manage MFA Settings
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
