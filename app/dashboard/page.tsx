"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import "../css/dashboard.css";

// Define a type for your user profile data
interface UserProfile {
  fullName: string;
  email: string;
  bio: string;
  profileImage: string; // URL to the image
  companyName: string;
  phone: string;
  memberSince: string; // Date string or actual Date object
  referrals: number;
  coupons: string[]; // Array of coupon codes
  // Add other fields you might have, like user ID
  id?: string;
}

// Define types for other data
interface Order {
  id: string;
  service: string;
  date: string;
  status: "In Progress" | "Completed" | "Pending Payment" | "Cancelled";
  amount: number;
  // Add a unique identifier for tracking if different from id
  trackingId?: string;
}

interface Course {
  id: string;
  title: string;
  progress: number; // Percentage
  lastAccessed: string; // Date string
  link: string; // Link to the course page
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: "Paid" | "Pending" | "Overdue";
  // Add payment initiation link/API endpoint
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // State for user profile data (initially empty or from session if available)
  const [userProfile, setUserProfile] = useState<UserProfile>({
    fullName: "",
    email: "",
    bio: "",
    profileImage: "/assets/Bravework_Studio-Logo-Color.png", // Default image
    companyName: "",
    phone: "",
    memberSince: "",
    referrals: 0,
    coupons: [],
  });

  // State for editing mode
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editableProfile, setEditableProfile] =
    useState<UserProfile>(userProfile);

  // States for other dashboard data
  const [orders, setOrders] = useState<Order[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch all dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (status !== "authenticated") return; // Only fetch if authenticated

    setLoading(true);
    setError(null);

    try {
      // 1. Fetch User Profile Data
      const profileRes = await fetch("/api/user/profile"); // Create this API route
      if (!profileRes.ok) throw new Error("Failed to fetch profile data");
      const profileData: UserProfile = await profileRes.json();
      setUserProfile(profileData);
      setEditableProfile(profileData); // Initialize editable state

      // 2. Fetch Orders
      const ordersRes = await fetch("/api/user/orders"); // Create this API route
      if (!ordersRes.ok) throw new Error("Failed to fetch orders");
      const ordersData: Order[] = await ordersRes.json();
      setOrders(ordersData);

      // 3. Fetch Courses
      // const coursesRes = await fetch("/api/user/courses"); // Create this API route
      // if (!coursesRes.ok) throw new Error("Failed to fetch courses");
      // const coursesData: Course[] = await coursesRes.json();
      // setCourses(coursesData);

      // 4. Fetch Invoices
      // const invoicesRes = await fetch("/api/user/invoices"); // Create this API route
      // if (!invoicesRes.ok) throw new Error("Failed to fetch invoices");
      // const invoicesData: Invoice[] = await invoicesRes.json();
      // setInvoices(invoicesData);
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
      setError(
        err.message || "An error occurred while fetching dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }, [status]); // Re-run if authentication status changes

  // Effect to trigger data fetch when authenticated
  useEffect(() => {
    if (status === "authenticated") {
      fetchDashboardData();
    } else if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, fetchDashboardData, router]);

  // Handle profile edit changes
  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditableProfile((prev) => ({ ...prev, [name]: value }));
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/user/profile", {
        // Create this API route (PATCH/PUT)
        method: "PATCH", // Or PUT, depending on your API design
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editableProfile), // Send updated data
      });

      if (!res.ok) throw new Error("Failed to save profile changes");
      const updatedProfile = await res.json();
      setUserProfile(updatedProfile); // Update main profile state
      setEditableProfile(updatedProfile); // Keep editable state in sync
      setIsEditingProfile(false); // Exit editing mode
      alert("Profile updated successfully!");
    } catch (err: any) {
      console.error("Error saving profile:", err);
      setError(err.message || "Failed to save profile changes.");
      alert("Error saving profile: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  // Handle password change (redirect or open modal)
  const handleChangePassword = () => {
    router.push("/auth/change-password"); // Create this page/modal
  };

  // Handle initiate payment
  const handleInitiatePayment = (invoiceId: string) => {
    // Implement payment initiation logic (e.g., redirect to payment gateway, open modal)
    alert(`Initiating payment for Invoice ID: ${invoiceId}`);
    // Example: router.push(`/checkout?invoice=${invoiceId}`);
  };

  if (status === "loading" || loading) {
    return <div className="loading-state">Loading dashboard...</div>;
  }

  if (status === "unauthenticated") {
    return (
      <div className="unauthenticated-state">
        Please log in to view your dashboard.
      </div>
    );
  }

  if (error) {
    return <div className="error-state">Error: {error}</div>;
  }

  // Calculate overview stats from fetched data
  const activeOrders = orders.filter(
    (order) =>
      order.status === "In Progress" || order.status === "Pending Payment"
  ).length;
  const coursesInProgress = courses.filter(
    (course) => course.progress < 100
  ).length;
  const totalSpent = orders.reduce((sum, order) => sum + order.amount, 0);

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>
            Welcome back,{" "}
            {userProfile.fullName || session.user?.name || session.user?.email}!
          </h1>
          <div className="profile-summary">
            <img
              src={userProfile.profileImage || "/assets/Bravework_Studio-Logo-Color.png"}
              alt="Profile"
              className="profile-image-thumbnail"
            />
            <Link href="/profile" className="profile-link">
              <span>Edit Profile</span>
            </Link>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* User Profile Details (Editable) */}
          <div className="dashboard-card profile-details">
            <h2>Your Profile</h2>
            <div className="profile-info-grid">
              <div className="profile-image-container">
                <img
                  src={userProfile.profileImage || "/assets/Bravework_Studio-Logo-Color.png"}
                  alt="Profile"
                  className="profile-image-large"
                />
                {/* Add functionality for changing profile image here (e.g., upload button) */}
              </div>
              <div className="profile-fields">
                <p>
                  <strong>Email:</strong>{" "}
                  {userProfile.email || session.user?.email}
                </p>
                <p>
                  <strong>Member Since:</strong> {userProfile.memberSince}
                </p>

                {isEditingProfile ? (
                  <>
                    <label>Full Name:</label>
                    <input
                      type="text"
                      name="fullName"
                      value={editableProfile.fullName}
                      onChange={handleProfileChange}
                    />
                    <label>Company Name:</label>
                    <input
                      type="text"
                      name="companyName"
                      value={editableProfile.companyName}
                      onChange={handleProfileChange}
                    />
                    <label>Phone:</label>
                    <input
                      type="text"
                      name="phone"
                      value={editableProfile.phone}
                      onChange={handleProfileChange}
                    />
                    <label>Bio:</label>
                    <textarea
                      name="bio"
                      value={editableProfile.bio}
                      onChange={handleProfileChange}
                      rows={3}
                    ></textarea>
                    <button onClick={handleSaveProfile} disabled={loading}>
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingProfile(false);
                        setEditableProfile(userProfile);
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <p>
                      <strong>Full Name:</strong> {userProfile.fullName}
                    </p>
                    <p>
                      <strong>Company Name:</strong> {userProfile.companyName}
                    </p>
                    <p>
                      <strong>Phone:</strong> {userProfile.phone}
                    </p>
                    <p>
                      <strong>Bio:</strong> {userProfile.bio || "No bio yet."}
                    </p>
                    <button onClick={() => setIsEditingProfile(true)}>
                      Edit Profile
                    </button>
                  </>
                )}
                <button
                  onClick={handleChangePassword}
                  className="change-password-button"
                >
                  Change Password
                </button>
                {/* For changing email, it might require a separate verification flow */}
                <Link
                  href="/profile/change-email"
                  className="change-email-link"
                >
                  Change Email
                </Link>
              </div>
            </div>
          </div>
          {/* Overview Card */}
          <div className="dashboard-card overview">
            <h2>Overview</h2>
            <div className="overview-stats">
              <div className="stat-item">
                <span className="stat-value">{activeOrders}</span>
                <span className="stat-label">Active Orders</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{coursesInProgress}</span>
                <span className="stat-label">Courses in Progress</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">
                  ${totalSpent.toLocaleString()}
                </span>
                <span className="stat-label">Total Spent</span>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="dashboard-card orders">
            <h2>Recent Orders</h2>
            {orders.length > 0 ? (
              <div className="orders-list">
                {orders.slice(0, 3).map(
                  (
                    order // Show top 3 recent orders
                  ) => (
                    <div key={order.id} className="order-item">
                      <div className="order-info">
                        <h3>{order.service}</h3>
                        <p>Order ID: {order.id}</p>
                        <p>Date: {order.date}</p>
                      </div>
                      <div className="order-status">
                        <span
                          className={`status-badge ${order.status
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          {order.status}
                        </span>
                        <span className="order-amount">
                          ${order.amount.toLocaleString()}
                        </span>
                      </div>
                      {order.status !== "Completed" && ( // Only show track button for active orders
                        <Link
                          href={`/orders/track/${order.trackingId || order.id}`}
                          className="track-button"
                        >
                          Track
                        </Link>
                      )}
                    </div>
                  )
                )}
              </div>
            ) : (
              <p>No recent orders found.</p>
            )}
            <Link href="/orders" className="view-all">
              View All Orders
            </Link>
          </div>

          {/* Course Progress */}
          <div className="dashboard-card courses">
            <h2>My Courses</h2>
            {courses.length > 0 ? (
              <div className="courses-list">
                {courses.slice(0, 3).map(
                  (
                    course // Show top 3 courses
                  ) => (
                    <div key={course.id} className="course-item">
                      <div className="course-info">
                        <h3>{course.title}</h3>
                        <p>Last accessed: {course.lastAccessed}</p>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">
                        {course.progress}% Complete
                      </span>
                      <Link href={course.link} className="explore-button">
                        Go to Course
                      </Link>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p>You haven't enrolled in any courses yet.</p>
            )}
            <Link href="/courses" className="view-all">
              Explore All Courses
            </Link>
          </div>

          {/* Invoices */}
          <div className="dashboard-card invoices">
            <h2>My Invoices</h2>
            {invoices.length > 0 ? (
              <div className="invoices-list">
                {invoices.slice(0, 3).map(
                  (
                    invoice // Show top 3 invoices
                  ) => (
                    <div key={invoice.id} className="invoice-item">
                      <div className="invoice-info">
                        <h3>Invoice #{invoice.id}</h3>
                        <p>Date: {invoice.date}</p>
                        <p>Amount: ${invoice.amount.toLocaleString()}</p>
                      </div>
                      <div className="invoice-status">
                        <span
                          className={`status-badge ${invoice.status.toLowerCase()}`}
                        >
                          {invoice.status}
                        </span>
                        {invoice.status !== "Paid" && (
                          <button
                            onClick={() => handleInitiatePayment(invoice.id)}
                            className="pay-button"
                          >
                            Initiate Payment
                          </button>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p>No invoices found.</p>
            )}
            <Link href="/invoices" className="view-all">
              View All Invoices
            </Link>
          </div>

          {/* Referrals & Coupons */}
          <div className="dashboard-card referrals-coupons">
            <h2>Referrals & Coupons</h2>
            <div className="referrals-info">
              <p>
                <strong>Referrals:</strong> {userProfile.referrals} total
                referrals
              </p>
              {/* You might display a referral code or link here */}
              <p>Share your unique referral link to earn rewards!</p>
              <Link href="/referrals" className="button">
                Manage Referrals
              </Link>
            </div>
            <div className="coupons-info">
              <h3>Your Coupons</h3>
              {userProfile?.coupons?.length > 0 ? (
                <ul>
                  {userProfile.coupons.map((coupon, index) => (
                    <li key={index}>{coupon}</li>
                  ))}
                </ul>
              ) : (
                <p>No active coupons.</p>
              )}
              <Link href="/coupons" className="button">
                View All Coupons
              </Link>
            </div>
          </div>

          {/* Other Important Things (Example: Notifications/Support) */}
          <div className="dashboard-card other-important">
            <h2>Quick Actions</h2>
            <div className="quick-actions-list">
              <Link href="/support" className="action-button">
                Get Support
              </Link>
              <Link href="/notifications" className="action-button">
                Notifications (0 new)
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
