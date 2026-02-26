"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import {
  FileText,
  Search,
  Eye,
  X,
  User,
  Mail,
  Phone,
  Globe,
  Clock,
  Briefcase,
  Calendar,
} from "lucide-react";
import Pagination from "@/app/components/Pagination";
import ConfirmationModal from "@/app/components/ConfirmationModal";
import Modal from "@/app/components/Modal";

interface JobApplication {
  id: string;
  applicantName: string;
  applicantEmail: string;
  phone?: string;
  portfolio?: string;
  experience?: string;
  availability?: string;
  roleApplied: string;
  status: "Pending" | "Reviewed" | "Interviewing" | "Rejected" | "Hired";
  appliedDate: string;
  coverLetter?: string;
  files?: { name: string; url: string }[];
}

function ApplicationDetailsModal({
  app,
  onClose,
}: {
  app: JobApplication;
  onClose: () => void;
}) {
  return (
    <Modal isOpen={true} onClose={onClose} title="Application Details">
      <div className="p-6 space-y-8 max-h-[80vh] overflow-y-auto">
        {/* Header Info */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-300">
              <User size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {app.applicantName}
              </h3>
              <p className="text-gray-500 flex items-center gap-2">
                <Mail size={14} /> {app.applicantEmail}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
              Status
            </p>
            <span
              className={`px-3 py-1 text-xs font-bold rounded-full ${
                app.status === "Pending"
                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                  : app.status === "Reviewed"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : app.status === "Interviewing"
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                      : app.status === "Rejected"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                        : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
              }`}
            >
              {app.status}
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                <Briefcase size={16} />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">
                  Role Applied
                </p>
                <p className="font-medium">{app.roleApplied}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                <Phone size={16} />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">
                  Phone Number
                </p>
                <p className="font-medium">{app.phone || "Not provided"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                <Clock size={16} />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">
                  Availability
                </p>
                <p className="font-medium">
                  {app.availability || "Not provided"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                <Globe size={16} />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">
                  Portfolio / Website
                </p>
                {app.portfolio ? (
                  <a
                    href={app.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline font-medium"
                  >
                    View Portfolio
                  </a>
                ) : (
                  <p className="font-medium">Not provided</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                <Calendar />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">
                  Applied On
                </p>
                <p className="font-medium">
                  {app.appliedDate
                    ? format(new Date(app.appliedDate), "MMMM dd, yyyy")
                    : "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                <Clock size={16} />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">
                  Experience
                </p>
                <p className="font-medium">
                  {app.experience || "Not provided"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cover Letter */}
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <FileText size={16} /> Cover Letter / Message
          </h4>
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 italic text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {app.coverLetter || "No cover letter provided."}
          </div>
        </div>

        {/* Files */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
            Attached Files
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {app.files && app.files.length > 0 ? (
              app.files.map((file, idx) => (
                <a
                  key={idx}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-300">
                    <FileText size={20} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-semibold truncate">
                      {file.name || "Resume/File"}
                    </p>
                    <p className="text-xs text-gray-500 uppercase">
                      Click to view
                    </p>
                  </div>
                </a>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">No files attached.</p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
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
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [newStatus, setNewStatus] = useState<JobApplication["status"] | null>(
    null,
  );

  const fetchJobApplications = useCallback(async () => {
    console.log("Component fetching job applications...");
    setLoading(true);
    setError(null);
    try {
      const url = `/api/admin/jobs${filterRole ? `?role=${filterRole}` : ""}`;
      console.log("Fetching from URL:", url);
      const res = await fetch(url);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch job applications.");
      }
      const data: JobApplication[] = await res.json();
      console.log("Job Applications Data Received:", data);
      setJobApplications(data);
    } catch (err: any) {
      console.error("Error fetching job applications in component:", err);
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

  const handleViewDetails = (app: JobApplication) => {
    setSelectedApp(app);
    setIsDetailsModalOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedApp || !newStatus) return;

    setLoading(true);
    setIsConfirmModalOpen(false);
    try {
      console.log("Updating status for ID:", selectedApp.id, "to:", newStatus);
      const res = await fetch(`/api/admin/jobs`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedApp.id, status: newStatus }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Status update failed:", errorData);
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
        app.applicantName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.applicantEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.roleApplied?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.id?.toLowerCase().includes(searchQuery.toLowerCase()),
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

  const uniqueRoles = useMemo(() => {
    return Array.from(
      new Set(
        jobApplications
          .map((app) => app.roleApplied)
          .filter((role): role is string => !!role),
      ),
    );
  }, [jobApplications]);

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
                    key={app.id || Math.random().toString()}
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
                      {app.appliedDate
                        ? (() => {
                            try {
                              return format(
                                new Date(app.appliedDate),
                                "MMM dd, yyyy",
                              );
                            } catch (e) {
                              return "Invalid Date";
                            }
                          })()
                        : "N/A"}
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
                        <button
                          onClick={() => handleViewDetails(app)}
                          className="p-2 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-lg hover:bg-indigo-100 transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        {app.files && app.files.length > 0 && (
                          <a
                            href={app.files[0].url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg hover:bg-blue-100 transition-colors"
                            title="View Primary Resume"
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

      {isDetailsModalOpen && selectedApp && (
        <ApplicationDetailsModal
          app={selectedApp}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedApp(null);
          }}
        />
      )}
    </div>
  );
}
