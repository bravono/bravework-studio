// app/admin/dashboard/_components/AdminInvoicesSection.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';

// Re-import types (or import from a shared types file)
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

export default function AdminInvoicesSection() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/invoices'); // NEW API ROUTE (GET all invoices)
      if (!res.ok) throw new Error('Failed to fetch invoices.');
      const data: Invoice[] = await res.json();
      setInvoices(data);
    } catch (err: any) {
      console.error("Error fetching invoices:", err);
      setError(err.message || "Failed to load invoices.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleMarkInvoiceAsPaid = async (invoiceId: string) => {
    if (!confirm(`Mark invoice ${invoiceId} as Paid?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}/status`, { // NEW API ROUTE (PATCH)
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Paid' }),
      });
      if (!res.ok) throw new Error('Failed to mark invoice as paid.');
      alert('Invoice marked as paid successfully!');
      fetchInvoices();
    } catch (err: any) {
      console.error("Error marking invoice as paid:", err);
      alert('Error marking invoice as paid: ' + (err.message || 'Unknown error.'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-state">Loading invoices...</div>;
  if (error) return <div className="error-state">Error: {error}</div>;

  return (
    <div className="dashboard-section">
      <h2>Invoices & Payments</h2>
      <div className="dashboard-card all-invoices mt-4">
        <h3>All Invoices</h3>
        {invoices.length > 0 ? (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Order ID</th>
                  <th>Client</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Amount</th>
                  <th>Paid</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(invoice => (
                  <tr key={invoice.id}>
                    <td>{invoice.id}</td>
                    <td>{invoice.orderId || 'N/A'}</td>
                    <td>{invoice.clientName || 'N/A'}</td>
                    <td>{format(new Date(invoice.issueDate), 'MMM dd, yyyy')}</td>
                    <td>{format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</td>
                    <td>${invoice.amount.toLocaleString()}</td>
                    <td>${invoice.amountPaid.toLocaleString()}</td>
                    <td><span className={`status-badge ${invoice.status.toLowerCase()}`}>{invoice.status}</span></td>
                    <td className="action-buttons">
                      {invoice.status !== 'Paid' && (
                        <button onClick={() => handleMarkInvoiceAsPaid(invoice.id)} className="action-button">Mark Paid</button>
                      )}
                      {invoice.paymentLink && (
                        <a href={invoice.paymentLink} target="_blank" rel="noopener noreferrer" className="view-button">View Link</a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No invoices found.</p>
        )}
      </div>
    </div>
  );
}
