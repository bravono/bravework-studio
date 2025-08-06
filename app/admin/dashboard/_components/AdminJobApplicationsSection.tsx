'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';

// Re-import types (or import from a shared types file)
interface JobApplication {
  id: string;
  applicantName: string;
  applicantEmail: string;
  roleApplied: string;
  status: 'Pending' | 'Reviewed' | 'Interviewing' | 'Rejected' | 'Hired';
  appliedDate: string;
  resumeUrl?: string;
  coverLetter?: string;
}

export default function AdminJobApplicationsSection() {
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<string>(''); // State for role filter

  const fetchJobApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // NEW API ROUTE (GET job applications, with optional role filter)
      const res = await fetch(`/api/admin/jobs${filterRole ? `?role=${filterRole}` : ''}`);
      if (!res.ok) throw new Error('Failed to fetch job applications.');
      const data: JobApplication[] = await res.json();
      setJobApplications(data);
    } catch (err: any) {
      console.error("Error fetching job applications:", err);
      setError(err.message || "Failed to load job applications.");
    } finally {
      setLoading(false);
    }
  }, [filterRole]); // Re-fetch when filterRole changes

  useEffect(() => {
    fetchJobApplications();
  }, [fetchJobApplications]);

  const handleUpdateApplicationStatus = async (appId: string, newStatus: JobApplication['status']) => {
    if (!confirm(`Change status of application ${appId} to ${newStatus}?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/job-applications/${appId}/status`, { // NEW API ROUTE (PATCH)
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update application status.');
      alert('Application status updated!');
      fetchJobApplications(); // Re-fetch applications
    } catch (err: any) {
      console.error("Error updating application status:", err);
      alert('Error updating status: ' + (err.message || 'Unknown error.'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-state">Loading job applications...</div>;
  if (error) return <div className="error-state">Error: {error}</div>;

  // Extract unique roles for the filter dropdown
  const uniqueRoles = Array.from(new Set(jobApplications.map(app => app.roleApplied)));

  return (
    <div className="dashboard-section">
      <h2>Job Applications</h2>
      <div className="filter-controls mb-4">
        <label htmlFor="roleFilter" className="mr-2">Filter by Role:</label>
        <select
          id="roleFilter"
          className="select-filter"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="">All Roles</option>
          {uniqueRoles.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>

      <div className="dashboard-card all-job-applications mt-4">
        <h3>All Applications</h3>
        {jobApplications.length > 0 ? (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Applicant</th>
                  <th>Email</th>
                  <th>Role Applied</th>
                  <th>Status</th>
                  <th>Applied Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobApplications.map(app => (
                  <tr key={app.id}>
                    <td>{app.id}</td>
                    <td>{app.applicantName}</td>
                    <td>{app.applicantEmail}</td>
                    <td>{app.roleApplied}</td>
                    <td><span className={`status-badge ${app.status.toLowerCase()}`}>{app.status}</span></td>
                    <td>{format(new Date(app.appliedDate), 'MMM dd, yyyy')}</td>
                    <td className="action-buttons">
                      {app.resumeUrl && (
                        <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className="view-button">Resume</a>
                      )}
                      {/* Dropdown for status update */}
                      <select
                        value={app.status}
                        onChange={(e) => handleUpdateApplicationStatus(app.id, e.target.value as JobApplication['status'])}
                        className="select-action"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Reviewed">Reviewed</option>
                        <option value="Interviewing">Interviewing</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Hired">Hired</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No job applications found.</p>
        )}
      </div>
    </div>
  );
}
