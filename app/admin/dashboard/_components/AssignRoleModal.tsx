// app/admin/dashboard/_components/AssignRoleModal.tsx
"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";
import { User, UserCheck } from "lucide-react";
import Modal from "@/app/components/Modal";

interface AssignRoleModalProps {
  user: {
    email: string;
    first_name: string;
    last_name: string;
    user_id: number;
  };
  onClose: () => void;
  onSave: () => void;
}

export default function AssignRoleModal({
  user,
  onClose,
  onSave,
}: AssignRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log("Received user ID", user.user_id);

  // Define available roles (customize as per your application's roles)
  const availableRoles = [
    "user",
    "customer",
    "student",
    "instructor",
    "admin",
    "freelancer",
    "guest",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/roles/${user.user_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      });

      if (!res.ok) throw new Error("Failed to assign role.");

      toast.success(
        `Role for ${user.first_name} ${user.last_name} updated to ${selectedRole} successfully!`
      );
      onSave(); // Trigger data re-fetch in parent
      onClose(); // Close the modal
    } catch (err: any) {
      console.error("Error assigning role:", err);
      setError(err.message || "Failed to assign role.");
      toast.error("Error assigning role: " + (err.message || "Unknown error."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Assign Role to ${user.first_name} ${user.last_name}`}
    >
      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        <div className="flex items-center space-x-3 text-gray-700">
          <User className="h-5 w-5 text-gray-500" />
          <span>
            <strong>User:</strong> {user.email}
          </span>
        </div>
        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Select Role
          </label>
          <select
            id="role"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          >
            {availableRoles.map((role) => (
              <option key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-t-2 border-white border-opacity-25 rounded-full animate-spin"></div>
            ) : (
              <UserCheck className="h-5 w-5 mr-2" />
            )}
            {loading ? "Saving..." : "Update Role"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
