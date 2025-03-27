'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Mock data - replace with actual data from your backend
const mockStats = {
  totalOrders: 156,
  totalRevenue: 245000,
  pendingOrders: 23,
  activeCoupons: 5
};

const mockRecentOrders = [
  {
    id: 'ORD001',
    service: '3D Modeling & Animation',
    client: 'John Doe',
    amount: 5000,
    status: 'Pending',
    date: '2024-03-15'
  },
  {
    id: 'ORD002',
    service: 'Web Development',
    client: 'Jane Smith',
    amount: 12000,
    status: 'In Progress',
    date: '2024-03-14'
  },
  {
    id: 'ORD003',
    service: 'UI/UX Design',
    client: 'Mike Johnson',
    amount: 3500,
    status: 'Completed',
    date: '2024-03-13'
  }
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    profileImage: '/images/profile-placeholder.jpg'
  });

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('clientAuth');
    if (!token) {
      router.push('/auth/login');
    }
  }, [router]);

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Welcome back, {user.name}</h1>
          <Link href="/profile" className="profile-link">
            <img src={user.profileImage} alt="Profile" className="profile-image" />
            <span>Edit Profile</span>
          </Link>
        </div>

        <div className="dashboard-grid">
          {/* Overview Cards */}
          <div className="dashboard-card overview">
            <h2>Overview</h2>
            <div className="overview-stats">
              <div className="stat-item">
                <span className="stat-value">{mockStats.totalOrders}</span>
                <span className="stat-label">Total Orders</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">${mockStats.totalRevenue.toLocaleString()}</span>
                <span className="stat-label">Total Revenue</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{mockStats.pendingOrders}</span>
                <span className="stat-label">Pending Orders</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{mockStats.activeCoupons}</span>
                <span className="stat-label">Active Coupons</span>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="dashboard-card orders">
            <h2>Recent Orders</h2>
            <div className="orders-list">
              {mockRecentOrders.map(order => (
                <div key={order.id} className="order-item">
                  <div className="order-info">
                    <h3>{order.service}</h3>
                    <p>Order ID: {order.id}</p>
                    <p>Date: {order.date}</p>
                  </div>
                  <div className="order-status">
                    <span className={`status-badge ${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                    <span className="order-amount">${order.amount.toLocaleString()}</span>
                  </div>
                  <div className="order-actions">
                    <Link href={`/admin/orders/${order.id}`} className="view-button">
                      View
                    </Link>
                    <button className="edit-button">
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/admin/orders" className="view-all">View All Orders</Link>
          </div>

          {/* Course Progress */}
          <div className="dashboard-card courses">
            <h2>Course Progress</h2>
            <div className="courses-list">
              {/* Add course progress items here */}
            </div>
            <Link href="/courses" className="view-all">View All Courses</Link>
          </div>
        </div>
      </div>
    </div>
  );
} 