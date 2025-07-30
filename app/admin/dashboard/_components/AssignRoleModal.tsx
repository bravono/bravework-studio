// app/admin/dashboard/_components/AssignRoleModal.tsx
'use client';

import React, { useState } from 'react';
import Modal from './Modal';

// Re-import types
interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface AssignRoleModalProps {
  user: User;
  onClose: () => void;
  onSave: () => void;
}

export default function AssignRoleModal({ user, onClose, onSave }: AssignRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState<string>(user.role);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Define available roles (customize as per your application's roles)
  const availableRoles = ['user', 'client', 'student', 'editor', 'admin'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/users/${user.id}/role`, { // NEW API ROUTE (PATCH)
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole }),
      });

      if (!res.ok) throw new Error('Failed to assign role.');

      alert(`Role for ${user.fullName} updated to ${selectedRole} successfully!`);
      onSave(); // Trigger data re-fetch in parent
    } catch (err: any) {
      console.error("Error assigning role:", err);
      setError(err.message || "Failed to assign role.");
      alert('Error assigning role: ' + (err.message || 'Unknown error.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={`Assign Role to ${user.fullName}`}>
      <form onSubmit={handleSubmit} className="modal-form">
        <p><strong>User:</strong> {user.email}</p>
        <div className="form-group">
          <label htmlFor="role">Select Role</label>
          <select
            id="role"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="form-input"
            required
          >
            {availableRoles.map(role => (
              <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
            ))}
          </select>
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" disabled={loading} className="form-submit-button">
          {loading ? "Saving..." : "Assign Role"}
        </button>
      </form>
    </Modal>
  );
}
