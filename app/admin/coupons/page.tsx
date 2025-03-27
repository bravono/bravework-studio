'use client';

import React, { useState } from 'react';

// Mock data - replace with actual data from your backend
const mockCoupons = [
  {
    id: 'CPN001',
    code: 'WELCOME10',
    discount: '10%',
    validFrom: '2024-03-01',
    validTo: '2024-12-31',
    usageLimit: 100,
    usedCount: 45,
    status: 'Active'
  },
  {
    id: 'CPN002',
    code: 'SUMMER20',
    discount: '20%',
    validFrom: '2024-06-01',
    validTo: '2024-08-31',
    usageLimit: 50,
    usedCount: 0,
    status: 'Upcoming'
  }
];

export default function CouponsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discount: '',
    validFrom: '',
    validTo: '',
    usageLimit: ''
  });

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle coupon creation here
    console.log('Creating coupon:', newCoupon);
    setShowCreateForm(false);
    setNewCoupon({
      code: '',
      discount: '',
      validFrom: '',
      validTo: '',
      usageLimit: ''
    });
  };

  return (
    <div className="coupons-page">
      <div className="page-header">
        <h1>Coupons Management</h1>
        <button 
          className="create-btn"
          onClick={() => setShowCreateForm(true)}
        >
          Create New Coupon
        </button>
      </div>

      {showCreateForm && (
        <div className="create-coupon-form">
          <h2>Create New Coupon</h2>
          <form onSubmit={handleCreateCoupon}>
            <div className="form-group">
              <label htmlFor="code">Coupon Code</label>
              <input
                type="text"
                id="code"
                value={newCoupon.code}
                onChange={(e) => setNewCoupon(prev => ({ ...prev, code: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="discount">Discount</label>
              <input
                type="text"
                id="discount"
                value={newCoupon.discount}
                onChange={(e) => setNewCoupon(prev => ({ ...prev, discount: e.target.value }))}
                placeholder="e.g., 10% or $20"
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="validFrom">Valid From</label>
                <input
                  type="date"
                  id="validFrom"
                  value={newCoupon.validFrom}
                  onChange={(e) => setNewCoupon(prev => ({ ...prev, validFrom: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="validTo">Valid To</label>
                <input
                  type="date"
                  id="validTo"
                  value={newCoupon.validTo}
                  onChange={(e) => setNewCoupon(prev => ({ ...prev, validTo: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="usageLimit">Usage Limit</label>
              <input
                type="number"
                id="usageLimit"
                value={newCoupon.usageLimit}
                onChange={(e) => setNewCoupon(prev => ({ ...prev, usageLimit: e.target.value }))}
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="submit-btn">Create Coupon</button>
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="coupons-list">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Discount</th>
              <th>Valid From</th>
              <th>Valid To</th>
              <th>Usage</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockCoupons.map((coupon) => (
              <tr key={coupon.id}>
                <td>{coupon.code}</td>
                <td>{coupon.discount}</td>
                <td>{coupon.validFrom}</td>
                <td>{coupon.validTo}</td>
                <td>{coupon.usedCount}/{coupon.usageLimit}</td>
                <td>
                  <span className={`status-badge ${coupon.status.toLowerCase()}`}>
                    {coupon.status}
                  </span>
                </td>
                <td>
                  <button className="action-btn edit-btn">Edit</button>
                  <button className="action-btn delete-btn">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 