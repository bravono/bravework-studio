// app/admin/dashboard/_components/AssignRoleModal.tsx
"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";
import { User, UserCheck } from "lucide-react";
import Modal from "@/app/components/Modal";

interface AssignRoleModalProps {
  user: {
    email: string;
    fullName: string;
    id: number;
  };
  onClose: () => void;
  onSave: () => void;
}

export default function AssignRoleModal({
  user,
  onClose,
  onSave,
}: AssignRoleModalProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch current roles on mount
  React.useEffect(() => {
    const fetchCurrentRoles = async () => {
      try {
        const res = await fetch(`/api/admin/roles/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setSelectedRoles(data.roles || []);
        }
      } catch (err) {
        console.error("Error fetching current roles:", err);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchCurrentRoles();
  }, [user.id]);

  console.log("Received user ID", user.id);

  // Define available roles (customize as per your application's roles)
  const availableRoles = ["instructor", "admin", "freelancer"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/roles/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roles: selectedRoles }),
      });

      const data = await res.json();

      if (res.ok) {
        const assignedCount = data.assigned?.length || 0;
        const skippedCount = data.skipped?.length || 0;

        let message = `Successfully assigned ${assignedCount} role(s).`;
        if (skippedCount > 0) {
          message += ` (${skippedCount} already existed)`;
        }

        toast.success(message);
        onSave(); // Trigger data re-fetch in parent
        onClose(); // Close the modal
      } else {
        const errorMessage = data.error || "Failed to assign role.";
        setError(errorMessage);
        toast.error("Error: " + errorMessage);
      }
    } catch (err: any) {
      console.log("Error", err);
      setError("An unexpected error occurred.");
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Assign Role to ${user.fullName}`}
    >
      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        <div className="flex items-center space-x-3 text-gray-700">
          <User className="h-5 w-5 text-gray-500" />
          <span>
            <strong>User:</strong> {user.email}
          </span>
        </div>
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Roles
          </label>
          <div className="grid grid-cols-1 gap-2">
            {initialLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-10 bg-gray-100 animate-pulse rounded-md"
                  />
                ))}
              </div>
            ) : (
              availableRoles.map((role) => (
                <label
                  key={role}
                  className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 border border-gray-100 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    value={role}
                    checked={selectedRoles.includes(role)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setSelectedRoles((prev) =>
                        checked
                          ? [...prev, role]
                          : prev.filter((r) => r !== role),
                      );
                    }}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </span>
                </label>
              ))
            )}
          </div>
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
            disabled={loading || initialLoading}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-t-2 border-white border-opacity-25 rounded-full animate-spin"></div>
            ) : (
              <UserCheck className="h-5 w-5 mr-2" />
            )}
            {loading ? "Updating..." : "Update Roles"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
