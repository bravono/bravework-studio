// app/admin/dashboard/AdminDashboardClient.tsx
'use client';

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import '../css/dashboard.css'; // Your dashboard CSS

// Import sub-components (will be created below)
import AdminOrdersSection from './AdminOrdersSection';
import AdminUsersSection from './AdminUsersSection';
import AdminJobApplicationsSection from './AdminJobApplicationsSection';
import AdminInvoicesSection from './AdminInvoicesSection';

// --- Interfaces (moved here for self-containment, but ideally in a shared types file) ---
interface AdminProfile {
  id: string;
  fullName: string;
  email: string;
  bio?: string;
  profileImage?: string;
  companyName?: string;
  phone?: string;
  memberSince: string;
  referrals?: number;
  coupons?: string[];
  role?: string;
}

interface Order {
  id: string;
  service: string;
  date: string;
  dateStarted?: string;
  dateCompleted?: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled' | 'Pending Payment';
  amount: number;
  amountPaid: number;
  trackingId?: string;
  clientName?: string;
  clientId: string;
  isPortfolio?: boolean;
  description?: string;
}

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  emailVerified: boolean;
  createdAt: string;
}

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

interface CustomOffer {
  id: string;
  orderId: string;
  userId: string;
  offerAmount: number;
  description: string;
  createdAt: string;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Expired';
}

interface Invoice {
  id: string;
  orderId?: string;
  userId: string;
  clientName?: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  amountPaid: number;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Cancelled';
  paymentLink?: string;
}

interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  activeCoupons: number;
  totalUsers: number;
  pendingJobApplications: number;
}
// --- End of Interfaces ---

interface AdminDashboardClientProps {
  initialSession: Session;
}

export default function AdminDashboardClient({ initialSession }: AdminDashboardClientProps) {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [activeTab, setActiveTab] = useState<string>('overview'); // State to manage active tab

  // Admin Profile state (for display, not directly editable here)
  const [adminProfile, setAdminProfile] = useState<AdminProfile>({
    id: (initialSession.user as any)?.id || '',
    fullName: initialSession.user?.name || "Admin User",
    email: initialSession.user?.email || "",
    memberSince: "N/A", // Will be fetched from backend
  });

  // Main dashboard data states
  const [stats, setStats] = useState<AdminStats>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    activeCoupons: 0,
    totalUsers: 0,
    pendingJobApplications: 0,
  });

  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // Function to fetch overall admin dashboard stats
  const fetchAdminStats = useCallback(async () => {
    setLoadingData(true);
    setDataError(null);
    try {
      const res = await fetch('/api/admin/stats'); // NEW API ROUTE
      if (!res.ok) throw new Error('Failed to fetch admin stats.');
      const data: AdminStats = await res.json();
      setStats(data);
    } catch (err: any) {
      console.error("Error fetching admin stats:", err);
      setDataError(err.message || "Failed to load admin overview data.");
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminStats();
  }, [fetchAdminStats]);

  // Handle password change (redirect or open modal)
  const handleChangePassword = () => {
    router.push('/auth/change-password');
  };

  // Render loading/error states for the main dashboard
  if (loadingData) {
    return <div className="loading-state">Loading admin dashboard overview...</div>;
  }

  if (dataError) {
    return <div className="error-state">Error: {dataError}</div>;
  }

  // Fallback for session status (should be authenticated due to server-side check)
  if (status === "loading" || status === "unauthenticated") {
    return <div className="loading-state">Authenticating...</div>;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Welcome, {adminProfile.fullName}! (Admin)</h1>
          <div className="profile-summary">
            <img
              src={adminProfile.profileImage || "/default-profile.png"}
              alt="Profile"
              className="profile-image-thumbnail"
            />
            <Link href="/profile" className="profile-link">
              <span>View/Edit Admin Profile</span>
            </Link>
          </div>
        </div>

        {/* Admin Dashboard Navigation Tabs */}
        <div className="admin-tabs">
          <button
            className={`admin-tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`admin-tab-button ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Orders & Projects
          </button>
          <button
            className={`admin-tab-button ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button
            className={`admin-tab-button ${activeTab === 'jobApplications' ? 'active' : ''}`}
            onClick={() => setActiveTab('jobApplications')}
          >
            Job Applications
          </button>
          <button
            className={`admin-tab-button ${activeTab === 'invoices' ? 'active' : ''}`}
            onClick={() => setActiveTab('invoices')}
          >
            Invoices & Payments
          </button>
          {/* Good to have: Settings, Reports, Discounts */}
          <button
            className={`admin-tab-button ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>

        {/* Render content based on active tab */}
        <div className="dashboard-content">
          {activeTab === 'overview' && (
            <div className="dashboard-grid">
              {/* Overview Cards */}
              <div className="dashboard-card overview">
                <h2>Admin Overview</h2>
                <div className="overview-stats">
                  <div className="stat-item">
                    <span className="stat-value">{stats.totalOrders}</span>
                    <span className="stat-label">Total Orders</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">
                      ${stats.totalRevenue.toLocaleString()}
                    </span>
                    <span className="stat-label">Total Revenue</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{stats.pendingOrders}</span>
                    <span className="stat-label">Pending Orders</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{stats.activeCoupons}</span>
                    <span className="stat-label">Active Coupons</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{stats.totalUsers}</span>
                    <span className="stat-label">Total Users</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{stats.pendingJobApplications}</span>
                    <span className="stat-label">Pending Job Apps</span>
                  </div>
                </div>
              </div>

              {/* Quick Management Tools */}
              <div className="dashboard-card admin-management">
                <h2>Management Tools</h2>
                <div className="quick-actions-list">
                  <button className="action-button" onClick={() => setActiveTab('orders')}>
                    Manage Orders
                  </button>
                  <button className="action-button" onClick={() => setActiveTab('users')}>
                    Manage Users
                  </button>
                  <button className="action-button" onClick={() => setActiveTab('jobApplications')}>
                    Manage Job Apps
                  </button>
                  <button className="action-button" onClick={() => setActiveTab('invoices')}>
                    Manage Invoices
                  </button>
                  <Link href="/admin/reports" className="action-button">
                    View Reports
                  </Link>
                  <Link href="/admin/discounts" className="action-button">
                    Manage Discounts
                  </Link>
                </div>
              </div>

              {/* Placeholder for other admin-specific content */}
              <div className="dashboard-card reports">
                <h2>System Health</h2>
                <p>Monitor server status, API performance, and database health.</p>
                <Link href="/admin/system-health" className="view-all">
                  View System Health
                </Link>
              </div>
            </div>
          )}

          {activeTab === 'orders' && <AdminOrdersSection />}
          {activeTab === 'users' && <AdminUsersSection />}
          {activeTab === 'jobApplications' && <AdminJobApplicationsSection />}
          {activeTab === 'invoices' && <AdminInvoicesSection />}
          {activeTab === 'settings' && (
            <div className="dashboard-card">
              <h2>Admin Settings</h2>
              <p>General application settings, integrations, etc.</p>
              <button onClick={handleChangePassword} className="change-password-button">Change Admin Password</button>
              {/* Other settings forms */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
