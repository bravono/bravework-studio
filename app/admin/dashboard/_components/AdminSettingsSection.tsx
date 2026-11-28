"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Key, User, ExternalLink, Shield, Loader2, Eye, EyeOff } from "lucide-react";
import Modal from "@/app/components/Modal";
import Link from "next/link";

interface AdminProfile {
  fullName: string;
  email: string;
  phone?: string;
  companyName?: string;
  profileImage?: string | null;
}

export default function AdminSettingsSection() {
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Change Password Form State
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          setAdminProfile({
            fullName: data.fullName || "Admin",
            email: data.email || "",
            phone: data.phone,
            companyName: data.companyName,
            profileImage: data.profileImage,
          });
        } else {
          setAdminProfile({
            fullName: "Admin User",
            email: "admin@braveworkstudio.com",
            profileImage: null,
          });
        }
      } catch (error) {
        console.error("Failed to load admin profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminProfile();
  }, []);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
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
        throw new Error(data.error || "Failed to update password");
      }

      toast.success("Password changed successfully!");
      setIsPasswordModalOpen(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setPasswordSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mr-3" />
        <span className="font-semibold">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        Admin Settings
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 space-y-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Profile Information
          </h3>

          <div className="flex items-center space-x-5">
            {adminProfile?.profileImage ? (
              <img
                src={adminProfile.profileImage}
                alt="Profile"
                className="w-20 h-20 rounded-full border-2 border-indigo-500 object-cover shadow-md"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-2xl shadow-md">
                {adminProfile?.fullName ? adminProfile.fullName.charAt(0).toUpperCase() : "A"}
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {adminProfile?.fullName}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {adminProfile?.email}
              </span>
              <Link
                href="/profile"
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold mt-2 inline-flex items-center gap-1 text-sm"
              >
                <span>Edit Full Profile</span>
                <ExternalLink size={14} />
              </Link>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap gap-3">
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition-colors text-sm"
            >
              <Key size={16} />
              <span>Change Password</span>
            </button>
            <Link
              href="/admin/settings/security"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-xl transition-colors text-sm"
            >
              <Shield size={16} />
              <span>MFA Settings</span>
            </Link>
          </div>
        </div>

        {/* Security & System Settings Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 space-y-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Security & Controls
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Manage your login credentials, two-factor authentication (MFA) devices, and account recovery options.
          </p>

          <div className="space-y-3">
            <Link
              href="/profile#password"
              className="block p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-indigo-600">
                    Password & Credentials
                  </p>
                  <p className="text-xs text-gray-500">Update password and authentication credentials</p>
                </div>
                <ExternalLink size={16} className="text-gray-400 group-hover:text-indigo-600" />
              </div>
            </Link>

            <Link
              href="/admin/settings/security"
              className="block p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-indigo-600">
                    Two-Factor Authentication (MFA)
                  </p>
                  <p className="text-xs text-gray-500">Configure authenticator apps and recovery keys</p>
                </div>
                <ExternalLink size={16} className="text-gray-400 group-hover:text-indigo-600" />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <Modal
          title="Change Admin Password"
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
        >
          <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  required
                  placeholder="Enter current password"
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                New Password (min. 8 characters)
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  required
                  placeholder="Enter new password"
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  required
                  placeholder="Confirm new password"
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={passwordSaving}
                className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow disabled:opacity-50 transition"
              >
                {passwordSaving ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

