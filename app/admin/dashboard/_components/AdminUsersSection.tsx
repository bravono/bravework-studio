// app/admin/dashboard/_components/AdminUsersSection.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AssignRoleModal from './AssignRoleModal'; // New modal component
import { User } from "../../../types/app";
import { format } from 'date-fns';


export default function AdminUsersSection() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAssignRoleModalOpen, setIsAssignRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/users'); // NEW API ROUTE (GET all users)
      if (!res.ok) throw new Error('Failed to fetch users.');
      const data: User[] = await res.json();
      setUsers(data);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError(err.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAssignRole = (user: User) => {
    setSelectedUser(user);
    setIsAssignRoleModalOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm(`Are you sure you want to delete user ${userId}? This action cannot be undone.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' }); // NEW API ROUTE
      if (!res.ok) throw new Error('Failed to delete user.');
      alert('User deleted successfully!');
      fetchUsers(); // Re-fetch users
    } catch (err: any) {
      console.error("Error deleting user:", err);
      alert('Error deleting user: ' + (err.message || 'Unknown error.'));
    } finally {
      setLoading(false);
    }
  };

  // Good to have: Apply Discount (could be a modal or direct action)
  const handleApplyDiscount = (user: User) => {
    if (user.role === 'client' || user.role === 'student') {
      alert(`Applying discount for ${user.fullName} (${user.role}). This would open a discount modal.`);
      // Implement discount application logic (e.g., open a modal, send API request)
    } else {
      alert('Discounts can only be applied to clients or students.');
    }
  };

  if (loading) return <div className="loading-state">Loading users...</div>;
  if (error) return <div className="error-state">Error: {error}</div>;

  return (
    <div className="dashboard-section">
      <h2>User Management</h2>
      <div className="dashboard-card all-users mt-4">
        <h3>All Users</h3>
        {users.length > 0 ? (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Verified</th>
                  <th>Member Since</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.fullName}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.emailVerified ? 'Yes' : 'No'}</td>
                    <td>{user.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : 'N/A'}</td>
                    <td className="action-buttons">
                      <button onClick={() => handleAssignRole(user)} className="edit-button">Assign Role</button>
                      <button onClick={() => handleApplyDiscount(user)} className="action-button">Apply Discount</button>
                      <button onClick={() => handleDeleteUser(user.id)} className="delete-button">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No users found.</p>
        )}
      </div>

      {isAssignRoleModalOpen && selectedUser && (
        <AssignRoleModal
          user={selectedUser}
          onClose={() => { setIsAssignRoleModalOpen(false); setSelectedUser(null); }}
          onSave={() => { fetchUsers(); setIsAssignRoleModalOpen(false); setSelectedUser(null); }}
        />
      )}
    </div>
  );
}
