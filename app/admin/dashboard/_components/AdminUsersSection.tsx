"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import AssignRoleModal from "./AssignRoleModal";
import { User } from "../../../types/app";
import { UserPlus, Tag, Trash2, Search } from "lucide-react";
import ConfirmationModal from "@/app/components/ConfirmationModal";
import Pagination from "@/app/components/Pagination";

export default function AdminUsersSection() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAssignRoleModalOpen, setIsAssignRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    first_name: string;
    last_name: string;
    user_id: number;
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
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  User Info
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Roles
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td
                      colSpan={5}
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
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {user.fullName}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
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
                              className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 px-2 py-0.5 rounded-full text-xs font-medium"
                            >
                              {roleName}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          user.emailVerified
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                        }`}
                      >
                        {user.emailVerified ? "Verified" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {user.createdAt
                        ? format(new Date(user.createdAt), "MMM dd, yyyy")
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleAssignRole(user)}
                          className="p-2 text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg hover:bg-blue-100 transition-colors"
                          title="Assign Role"
                        >
                          <UserPlus size={16} />
                        </button>
                        <button
                          onClick={() => handleApplyDiscount(user)}
                          className="p-2 text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-300 rounded-lg hover:bg-purple-100 transition-colors"
                          title="Apply Discount"
                        >
                          <Tag size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-2 text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-300 rounded-lg hover:bg-red-100 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
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
