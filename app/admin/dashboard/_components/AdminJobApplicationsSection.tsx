"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { FileText, Search } from "lucide-react";
import Pagination from "@/app/components/Pagination";
import ConfirmationModal from "@/app/components/ConfirmationModal";

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

export default function AdminJobApplicationsSection() {
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const applicationsPerPage = 10;

  // Modal state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [newStatus, setNewStatus] = useState<JobApplication["status"] | null>(
    null,
  );

  const fetchJobApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/jobs${filterRole ? `?role=${filterRole}` : ""}`,
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
      toast.error(err.message || "Failed to load job applications.");
    } finally {
      setLoading(false);
    }
  }, [filterRole]);

  useEffect(() => {
    fetchJobApplications();
  }, [fetchJobApplications]);

  const handleUpdateStatusClick = (
    app: JobApplication,
    status: JobApplication["status"],
  ) => {
    setSelectedApp(app);
    setNewStatus(status);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedApp || !newStatus) return;

    setLoading(true);
    setIsConfirmModalOpen(false);
    try {
      const res = await fetch(
        `/api/admin/job-applications/${selectedApp.id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        },
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update status.");
      }
      toast.success("Application status updated successfully!");
      fetchJobApplications();
    } catch (err: any) {
      console.error("Error updating application status:", err);
      toast.error(err.message || "Error updating status.");
    } finally {
      setLoading(false);
      setSelectedApp(null);
      setNewStatus(null);
    }
  };

  const filteredApplications = useMemo(() => {
    return jobApplications.filter(
      (app) =>
        app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.applicantEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.roleApplied.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.id.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [jobApplications, searchQuery]);

  const totalPages = Math.ceil(
    filteredApplications.length / applicationsPerPage,
  );
  const startIndex = (currentPage - 1) * applicationsPerPage;
  const currentApplications = filteredApplications.slice(
    startIndex,
    startIndex + applicationsPerPage,
  );

  const statusColors = {
    Pending:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    Reviewed:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    Interviewing:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    Rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    Hired:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  };

  const uniqueRoles = Array.from(
    new Set(jobApplications.map((app) => app.roleApplied)),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Job Applications
        </h2>
        <div className="flex items-center gap-2">
          <select
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
            value={filterRole}
            onChange={(e) => {
              setFilterRole(e.target.value);
              setCurrentPage(1);
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

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by name, email, role or ID..."
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
                  Applicant
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Role Applied
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Applied Date
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Status
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
              ) : currentApplications.length > 0 ? (
                currentApplications.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {app.applicantName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {app.applicantEmail}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {app.roleApplied}
                      </p>
                      <p className="text-xs text-gray-500">ID: #{app.id}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {format(new Date(app.appliedDate), "MMM dd, yyyy")}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-bold rounded-full ${
                          statusColors[app.status]
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {app.resumeUrl && (
                          <a
                            href={app.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-lg hover:bg-indigo-100 transition-colors"
                            title="View Resume"
                          >
                            <FileText size={16} />
                          </a>
                        )}
                        <select
                          value={app.status}
                          onChange={(e) =>
                            handleUpdateStatusClick(
                              app,
                              e.target.value as JobApplication["status"],
                            )
                          }
                          className="px-2 py-1 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
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
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No job applications found matching the criteria.
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
        message={`Are you sure you want to change the status of ${selectedApp?.applicantName}'s application to "${newStatus}"?`}
        onConfirm={handleConfirmStatusChange}
        onCancel={() => {
          setIsConfirmModalOpen(false);
          setSelectedApp(null);
          setNewStatus(null);
        }}
      />
    </div>
  );
}
