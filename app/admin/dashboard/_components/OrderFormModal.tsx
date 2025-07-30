// app/admin/dashboard/_components/OrderFormModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Modal from './Modal';

// Re-import types
interface Order {
  id: string;
  service: string;
  date: string; // created_at
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

interface OrderFormModalProps {
  order?: Order | null; // Null for create, Order object for edit
  onClose: () => void;
  onSave: () => void;
}

export default function OrderFormModal({ order, onClose, onSave }: OrderFormModalProps) {
  const [formData, setFormData] = useState<Partial<Order>>({
    service: order?.service || '',
    status: order?.status || 'Pending',
    amount: order?.amount || 0,
    amountPaid: order?.amountPaid || 0,
    clientId: order?.clientId || '',
    description: order?.description || '',
    dateStarted: order?.dateStarted ? order.dateStarted.split('T')[0] : '', // Format for date input
    dateCompleted: order?.dateCompleted ? order.dateCompleted.split('T')[0] : '',
    isPortfolio: order?.isPortfolio || false,
    trackingId: order?.trackingId || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (order) {
      setFormData({
        service: order.service,
        status: order.status,
        amount: order.amount,
        amountPaid: order.amountPaid,
        clientId: order.clientId,
        description: order.description,
        dateStarted: order.dateStarted ? order.dateStarted.split('T')[0] : '',
        dateCompleted: order.dateCompleted ? order.dateCompleted.split('T')[0] : '',
        isPortfolio: order.isPortfolio,
        trackingId: order.trackingId,
      });
    }
  }, [order]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const method = order ? 'PATCH' : 'POST';
      const url = order ? `/api/admin/orders/${order.id}` : '/api/admin/orders'; // NEW API ROUTES

      const payload = {
        ...formData,
        // Convert kobo back to cents if storing in kobo on backend
        amount: formData.amount ? Math.round(formData.amount * 100) : 0,
        amountPaid: formData.amountPaid ? Math.round(formData.amountPaid * 100) : 0,
        // Ensure dates are sent in correct format if needed
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Failed to ${order ? 'update' : 'create'} order.`);

      alert(`Order ${order ? 'updated' : 'created'} successfully!`);
      onSave();
    } catch (err: any) {
      console.error("Error saving order:", err);
      setError(err.message || "Failed to save order.");
      alert('Error saving order: ' + (err.message || 'Unknown error.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={order ? "Edit Order" : "Create New Order"}>
      <form onSubmit={handleSubmit} className="modal-form">
        <div className="form-group">
          <label htmlFor="clientId">Client ID</label>
          <input type="text" id="clientId" name="clientId" value={formData.clientId || ''} onChange={handleChange} required className="form-input" />
        </div>
        <div className="form-group">
          <label htmlFor="service">Service (Category ID)</label>
          <input type="text" id="service" name="service" value={formData.service || ''} onChange={handleChange} required className="form-input" />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" value={formData.description || ''} onChange={handleChange} rows={3} className="form-textarea"></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" value={formData.status || 'Pending'} onChange={handleChange} className="form-input">
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Pending Payment">Pending Payment</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="amount">Total Expected Amount ($)</label>
          <input type="number" id="amount" name="amount" value={formData.amount || 0} onChange={handleChange} required min="0" step="0.01" className="form-input" />
        </div>
        <div className="form-group">
          <label htmlFor="amountPaid">Amount Paid ($)</label>
          <input type="number" id="amountPaid" name="amountPaid" value={formData.amountPaid || 0} onChange={handleChange} required min="0" step="0.01" className="form-input" />
        </div>
        <div className="form-group">
          <label htmlFor="dateStarted">Date Started</label>
          <input type="date" id="dateStarted" name="dateStarted" value={formData.dateStarted || ''} onChange={handleChange} className="form-input" />
        </div>
        <div className="form-group">
          <label htmlFor="dateCompleted">Date Completed</label>
          <input type="date" id="dateCompleted" name="dateCompleted" value={formData.dateCompleted || ''} onChange={handleChange} className="form-input" />
        </div>
        <div className="form-group checkbox-group">
          <input type="checkbox" id="isPortfolio" name="isPortfolio" checked={formData.isPortfolio || false} onChange={handleChange} />
          <label htmlFor="isPortfolio">Mark as Portfolio</label>
        </div>
        <div className="form-group">
          <label htmlFor="trackingId">Tracking ID</label>
          <input type="text" id="trackingId" name="trackingId" value={formData.trackingId || ''} onChange={handleChange} className="form-input" />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" disabled={loading} className="form-submit-button">
          {loading ? "Saving..." : (order ? "Update Order" : "Create Order")}
        </button>
      </form>
    </Modal>
  );
}
