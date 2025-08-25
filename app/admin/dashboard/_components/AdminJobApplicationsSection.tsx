"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  ArrowRightCircle,
} from "lucide-react";
import Modal from "@/app/components/Modal";

// Re-import types (or import from a shared types file)
interface JobApplication {
  id: string;
  applicantName: string;
  applicantEmail: string;
  roleApplied: string;
  status: "Pending" | "Reviewed" | "Interviewing" | "Rejected" | "Hired";
  appliedDate: string;
  resumeUrl?: string;
  coverLetter?: string;
}

// Reusable Loading Spinner component for a better user experience
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
                  ? "bg-blue-500 hover:bg-blue-600"
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

export default function AdminJobApplicationsSection() {
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<string>(""); // State for role filter

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [applicationsPerPage] = useState(10);

  // Modal state for confirmations
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmModalContent, setConfirmModalContent] = useState({
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const fetchJobApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/jobs${filterRole ? `?role=${filterRole}` : ""}`
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch job applications.");
      }
      const data: JobApplication[] = await res.json();
      setJobApplications(data);
    } catch (err: any) {
      console.error("Error fetching job applications:", err);
      setError(err.message || "Failed to load job applications.");
      toast.error(
        "Failed to load job applications: " + (err.message || "Unknown error.")
      );
    } finally {
      setLoading(false);
    }
  }, [filterRole]);

  useEffect(() => {
    fetchJobApplications();
  }, [fetchJobApplications]);

  const handleUpdateApplicationStatus = (
    app: JobApplication,
    newStatus: JobApplication["status"]
  ) => {
    setConfirmModalContent({
      title: "Confirm Status Change",
      message: `Are you sure you want to change the status of the application from ${app.applicantName} to "${newStatus}"?`,
      onConfirm: async () => {
        setLoading(true);
        try {
          const res = await fetch(
            `/api/admin/job-applications/${app.id}/status`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: newStatus }),
            }
          );
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(
              errorData.error || "Failed to update application status."
            );
          }
          toast.success("Application status updated successfully!");
          fetchJobApplications(); // Re-fetch applications
        } catch (err: any) {
          console.error("Error updating application status:", err);
          toast.error(
            "Error updating status: " + (err.message || "Unknown error.")
          );
        } finally {
          setLoading(false);
        }
      },
    });
    setIsConfirmModalOpen(true);
  };

  // Pagination logic
  const indexOfLastApplication = currentPage * applicationsPerPage;
  const indexOfFirstApplication = indexOfLastApplication - applicationsPerPage;
  const currentApplications = useMemo(
    () =>
      jobApplications.slice(indexOfFirstApplication, indexOfLastApplication),
    [jobApplications, indexOfFirstApplication, indexOfLastApplication]
  );
  const totalPages = Math.ceil(jobApplications.length / applicationsPerPage);

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

  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-800",
    Reviewed: "bg-blue-100 text-blue-800",
    Interviewing: "bg-purple-100 text-purple-800",
    Rejected: "bg-red-100 text-red-800",
    Hired: "bg-green-100 text-green-800",
  };

  if (loading) return <LoadingSpinner />;
  if (error)
    return (
      <div className="p-4 text-center text-red-500 bg-red-100 rounded-lg font-medium">
        Error: {error}
      </div>
    );

  const uniqueRoles = Array.from(
    new Set(jobApplications.map((app) => app.roleApplied))
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 border-b-2 border-gray-200 pb-2">
          Job Applications
        </h2>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">
              All Applications
            </h3>
            <div className="filter-controls flex items-center space-x-2">
              <label
                htmlFor="roleFilter"
                className="text-gray-700 font-medium text-sm"
              >
                Filter by Role:
              </label>
              <select
                id="roleFilter"
                className="select-filter px-3 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={filterRole}
                onChange={(e) => {
                  setFilterRole(e.target.value);
                  setCurrentPage(1); // Reset to first page on filter change
                }}
              >
                <option value="">All Roles</option>
                {uniqueRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {currentApplications.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Applicant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Role Applied
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Applied Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentApplications.map((app) => (
                    <tr
                      key={app.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {app.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {app.applicantName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {app.applicantEmail}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {app.roleApplied}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {format(new Date(app.appliedDate), "MMM dd, yyyy")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            statusColors[app.status]
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2 items-center">
                          {app.resumeUrl && (
                            <a
                              href={app.resumeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                              title="View Resume"
                            >
                              <FileText size={16} />
                            </a>
                          )}
                          <select
                            value={app.status}
                            onChange={(e) =>
                              handleUpdateApplicationStatus(
                                app,
                                e.target.value as JobApplication["status"]
                              )
                            }
                            className="px-2 py-1 text-xs rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Reviewed">Reviewed</option>
                            <option value="Interviewing">Interviewing</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Hired">Hired</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="p-4 text-center text-gray-500">
              No job applications found.
            </p>
          )}
          {renderPaginationButtons()}
        </div>
      </div>
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
        confirmText="Change Status"
        cancelText="Cancel"
        children
      />
    </div>
  );
}
