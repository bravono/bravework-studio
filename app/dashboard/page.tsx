'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    profileImage: '/images/profile-placeholder.jpg'
  });

  // Mock data for recent orders
  const recentOrders = [
    {
      id: 'ORD001',
      service: '3D Modeling',
      date: '2024-03-15',
      status: 'In Progress',
      amount: 1500
    },
    {
      id: 'ORD002',
      service: 'UI/UX Design',
      date: '2024-03-10',
      status: 'Completed',
      amount: 2000
    }
  ];

  // Mock data for course progress
  const courseProgress = [
    {
      course: '3D Modeling Basics',
      progress: 75,
      lastAccessed: '2024-03-18'
    },
    {
      course: 'UI/UX Design Fundamentals',
      progress: 45,
      lastAccessed: '2024-03-17'
    }
  ];

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
                <span className="stat-value">2</span>
                <span className="stat-label">Active Orders</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">2</span>
                <span className="stat-label">Courses in Progress</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">$3,500</span>
                <span className="stat-label">Total Spent</span>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="dashboard-card orders">
            <h2>Recent Orders</h2>
            <div className="orders-list">
              {recentOrders.map(order => (
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
                    <span className="order-amount">${order.amount}</span>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/orders" className="view-all">View All Orders</Link>
          </div>

          {/* Course Progress */}
          <div className="dashboard-card courses">
            <h2>Course Progress</h2>
            <div className="courses-list">
              {courseProgress.map(course => (
                <div key={course.course} className="course-item">
                  <div className="course-info">
                    <h3>{course.course}</h3>
                    <p>Last accessed: {course.lastAccessed}</p>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{course.progress}% Complete</span>
                </div>
              ))}
            </div>
            <Link href="/courses" className="view-all">View All Courses</Link>
          </div>
        </div>
      </div>
    </div>
  );
} 