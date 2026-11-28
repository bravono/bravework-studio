"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import AssignRoleModal from "./AssignRoleModal";
import { User } from "../../../types/app";
import { UserPlus, Tag, Trash2, Search } from "lucide-react";
import ConfirmationModal from "@/app/components/ConfirmationModal";
import Pagination from "@/app/components/Pagination";

interface AdminUsersSectionProps {
  userIdToOpen?: string;
}

export default function AdminUsersSection({
  userIdToOpen,
}: AdminUsersSectionProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAssignRoleModalOpen, setIsAssignRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    fullName: string;
    id: number;
    email: string;
  } | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // State for the confirmation modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmModalContent, setConfirmModalContent] = useState({
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // State for the alert modal
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertModalContent, setAlertModalContent] = useState({
    title: "",
    message: "",
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch users.");
      }
      const data: User[] = await res.json();
      setUsers(data);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError(err.message || "Failed to load users.");
      toast.error("Failed to load users: " + (err.message || "Unknown error."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAssignRole = (user: any) => {
    setSelectedUser(user);
    setIsAssignRoleModalOpen(true);
  };

  const handleDeleteUser = (user: any) => {
    setConfirmModalContent({
      title: "Confirm Deletion",
      message: `Are you sure you want to delete user ${user.fullName} (${user.email})? This action cannot be undone.`,
      onConfirm: async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/admin/users/${user.id}`, {
            method: "DELETE",
          });
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Failed to delete user.");
          }
          toast.success("User deleted successfully!");
          fetchUsers(); // Re-fetch users
        } catch (err: any) {
          console.error("Error deleting user:", err);
          toast.error(
            "Error deleting user: " + (err.message || "Unknown error."),
          );
        } finally {
          setLoading(false);
        }
      },
    });
    setIsConfirmModalOpen(true);
  };

  const handleApplyDiscount = (user: User) => {
    const roles = Array.isArray(user.roles)
      ? user.roles.map((r) => (typeof r === "string" ? r : r.roleName))
      : [user.roles];

    if (roles.includes("client") || roles.includes("student")) {
      setAlertModalContent({
        title: "Apply Discount",
        message: `A discount is being applied for ${user.fullName} (${roles.join(", ")}). This would open a discount modal or trigger an API request.`,
      });
      setIsAlertModalOpen(true);
    } else {
      setAlertModalContent({
        title: "Action Not Allowed",
        message: "Discounts can only be applied to clients or students.",
      });
      setIsAlertModalOpen(true);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [users, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const currentUsers = filteredUsers.slice(
    startIndex,
    startIndex + usersPerPage,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          User Management
        </h2>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1600px] text-left divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  User Info
                </th>
                <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Bio / Intro
                </th>
                <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Roles
                </th>
                <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  KYC Verified
                </th>
                <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  2FA Status
                </th>
                <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Referral Code
                </th>
                <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Lead Source
                </th>
                <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Updated
                </th>
                <th className="px-5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right sticky right-0 bg-gray-50 dark:bg-gray-900/90 shadow-sm">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td
                      colSpan={14}
                      className="px-6 py-4 h-16 bg-gray-50/50 dark:bg-gray-800/50"
                    ></td>
                  </tr>
                ))
              ) : currentUsers.length > 0 ? (
                currentUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-5 py-4 text-xs font-mono font-bold text-gray-500">
                      #{user.id}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {user.profilePictureUrl ? (
                          <img
                            src={user.profilePictureUrl}
                            alt={user.fullName}
                            className="w-9 h-9 rounded-full object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-xs">
                            {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white text-sm">
                            {user.fullName}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {user.phone || <span className="text-gray-400 italic">None</span>}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {user.companyName || <span className="text-gray-400 italic">None</span>}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-600 dark:text-gray-400 max-w-[200px] truncate" title={user.bio || ""}>
                      {user.bio || <span className="text-gray-400 italic">None</span>}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(Array.isArray(user.roles)
                          ? user.roles
                          : [user.roles]
                        ).map((r, idx) => {
                          const roleName =
                            typeof r === "string" ? r : (r?.roleName ?? "User");
                          return (
                            <span
                              key={idx}
                              className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap"
                            >
                              {roleName}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          user.emailVerified
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                        }`}
                      >
                        {user.emailVerified ? "Verified" : "Unverified"}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          user.isVerified
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                            : user.verificationSubmittedAt
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {user.isVerified ? "Approved" : user.verificationSubmittedAt ? "Pending" : "None"}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          user.twoFactorEnabled
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                            : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {user.twoFactorEnabled ? "2FA Enabled" : "2FA Off"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs font-mono text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {user.referralCode || <span className="text-gray-400 italic">None</span>}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {user.hearAboutUs || <span className="text-gray-400 italic">N/A</span>}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                      {user.createdAt
                        ? format(new Date(user.createdAt), "MMM dd, yyyy")
                        : "N/A"}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                      {user.updatedAt
                        ? format(new Date(user.updatedAt), "MMM dd, yyyy")
                        : "N/A"}
                    </td>
                    <td className="px-5 py-4 text-right sticky right-0 bg-white dark:bg-gray-800 shadow-sm">
                      <div className="flex justify-end space-x-1.5">
                        <button
                          onClick={() => handleAssignRole(user)}
                          className="p-1.5 text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg hover:bg-blue-100 transition-colors"
                          title="Assign Role"
                        >
                          <UserPlus size={15} />
                        </button>
                        <button
                          onClick={() => handleApplyDiscount(user)}
                          className="p-1.5 text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-300 rounded-lg hover:bg-purple-100 transition-colors"
                          title="Apply Discount"
                        >
                          <Tag size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-1.5 text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-300 rounded-lg hover:bg-red-100 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={14}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No users found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        message={confirmModalContent.message}
        onConfirm={() => {
          confirmModalContent.onConfirm();
          setIsConfirmModalOpen(false);
        }}
        onCancel={() => setIsConfirmModalOpen(false)}
      />

      <ConfirmationModal
        isOpen={isAlertModalOpen}
        message={`${alertModalContent.title}: ${alertModalContent.message}`}
        onConfirm={() => setIsAlertModalOpen(false)}
        onCancel={() => setIsAlertModalOpen(false)}
      />

      {isAssignRoleModalOpen && selectedUser && (
        <AssignRoleModal
          user={selectedUser}
          onClose={() => {
            setIsAssignRoleModalOpen(false);
            setSelectedUser(null);
          }}
          onSave={() => {
            fetchUsers();
            setIsAssignRoleModalOpen(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}
