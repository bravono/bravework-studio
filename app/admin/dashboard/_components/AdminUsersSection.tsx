"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import AssignRoleModal from "./AssignRoleModal";
import { User } from "../../../types/app";
import { UserPlus, Tag, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import Modal from "@/app/components/Modal";


// Reusable Loading Spinner component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8 text-gray-500">
    <div className="w-8 h-8 border-4 border-t-4 border-blue-500 border-opacity-25 rounded-full animate-spin"></div>
    <span className="ml-3 font-semibold">Loading...</span>
  </div>
);

// Reusable Custom Modal component to replace alert() and confirm()
const CustomModal = ({
  title,
  message,
  isOpen,
  onClose,
  onConfirm,
  isConfirm = false,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 p-4">
      <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-auto transform transition-all duration-300 scale-95 md:scale-100">
        <h3 className="text-xl font-bold mb-4 text-gray-800">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          {isConfirm && (
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors hover:bg-gray-300"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={() => {
              if (onConfirm) onConfirm();
              onClose();
            }}
            className={`px-6 py-2 rounded-lg font-bold text-white transition-colors
              ${
                isConfirm
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
          >
            {isConfirm ? confirmText : "OK"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function AdminUsersSection() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAssignRoleModalOpen, setIsAssignRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

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

  const handleAssignRole = (user: User) => {
    setSelectedUser(user);
    setIsAssignRoleModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
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
            "Error deleting user: " + (err.message || "Unknown error.")
          );
        } finally {
          setLoading(false);
        }
      },
    });
    setIsConfirmModalOpen(true);
  };

  const handleApplyDiscount = (user: User) => {
    if (user.role === "client" || user.role === "student") {
      setAlertModalContent({
        title: "Apply Discount",
        message: `A discount is being applied for ${user.fullName} (${user.role}). This would open a discount modal or trigger an API request.`,
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

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = useMemo(
    () => users.slice(indexOfFirstUser, indexOfLastUser),
    [users, indexOfFirstUser, indexOfLastUser]
  );
  const totalPages = Math.ceil(users.length / usersPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const renderPaginationButtons = () => {
    if (totalPages <= 1) return null;
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    return (
      <nav className="flex justify-center mt-6">
        <ul className="flex items-center space-x-2">
          <li>
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
          </li>
          {pageNumbers.map((number) => (
            <li key={number}>
              <button
                onClick={() => paginate(number)}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  currentPage === number
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {number}
              </button>
            </li>
          ))}
          <li>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-md text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  if (loading) return <LoadingSpinner />;
  if (error)
    return (
      <div className="p-4 text-center text-red-500 bg-red-100 rounded-lg font-medium">
        Error: {error}
      </div>
    );

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 border-b-2 border-gray-200 pb-2">
          User Management
        </h2>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">All Users</h3>
          {users.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Full Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Verified
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Member Since
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {user.fullName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {user.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {user.emailVerified ? "Yes" : "No"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {user.createdAt
                          ? format(new Date(user.createdAt), "MMM dd, yyyy")
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAssignRole(user)}
                            className="p-2 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                            title="Assign Role"
                          >
                            <UserPlus size={16} />
                          </button>
                          <button
                            onClick={() => handleApplyDiscount(user)}
                            className="p-2 text-purple-600 bg-purple-50 rounded-md hover:bg-purple-100 transition-colors"
                            title="Apply Discount"
                          >
                            <Tag size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="p-2 text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="p-4 text-center text-gray-500">No users found.</p>
          )}
          {renderPaginationButtons()}
        </div>
      </div>

      {/* Confirmation modal for user deletion */}
      <Modal
        title={confirmModalContent.title}
        message={confirmModalContent.message}
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={() => {
          confirmModalContent.onConfirm();
          setIsConfirmModalOpen(false);
        }}
        isConfirm={true}
        confirmText="Delete"
        cancelText="Cancel"
        children
      />

      {/* Alert modal for other messages */}
      <Modal
        title={alertModalContent.title}
        message={alertModalContent.message}
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        onConfirm={() => {
          confirmModalContent.onConfirm();
          setIsConfirmModalOpen(false);
        }}
        children
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
