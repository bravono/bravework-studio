import React from 'react';

interface Payment {
  id: string;
  date: string;
  amount: number;
  method: string;
  transactionId?: string;
  receiptUrl?: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  sentAt: string;
  paymentDate?: string;
  paymentMethod?: string;
  reminderSent?: boolean;
  lastReminderDate?: string;
  payments?: Payment[];
}

interface InvoiceHistoryProps {
  invoices: Invoice[];
  onViewInvoice: (invoice: Invoice) => void;
  onMarkAsPaid: (invoice: Invoice) => void;
  onSendReminder: (invoice: Invoice) => void;
  onViewReceipt: (payment: Payment) => void;
}

export default function InvoiceHistory({ 
  invoices, 
  onViewInvoice, 
  onMarkAsPaid,
  onSendReminder,
  onViewReceipt
}: InvoiceHistoryProps) {
  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="invoice-history">
      <h2>Invoice History</h2>
      <div className="invoice-list">
        {invoices.map((invoice) => {
          const daysUntilDue = getDaysUntilDue(invoice.dueDate);
          const isOverdue = daysUntilDue < 0 && invoice.status !== 'paid';
          
          return (
            <div key={invoice.id} className="invoice-item">
              <div className="invoice-info">
                <div className="invoice-number">
                  <span className="label">Invoice Number:</span>
                  <span className="value">{invoice.invoiceNumber}</span>
                </div>
                <div className="invoice-dates">
                  <span className="label">Issue Date:</span>
                  <span className="value">{invoice.issueDate}</span>
                  <span className="label">Due Date:</span>
                  <span className="value">{invoice.dueDate}</span>
                  {invoice.paymentDate && (
                    <>
                      <span className="label">Payment Date:</span>
                      <span className="value">{invoice.paymentDate}</span>
                    </>
                  )}
                </div>
                <div className="invoice-amount">
                  <span className="label">Amount:</span>
                  <span className="value">{formatCurrency(invoice.amount)}</span>
                  {invoice.paymentMethod && (
                    <>
                      <span className="label">Payment Method:</span>
                      <span className="value">{invoice.paymentMethod}</span>
                    </>
                  )}
                </div>
                <div className="invoice-status">
                  <span className={`status-badge ${invoice.status}`}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </span>
                  {isOverdue && (
                    <span className="days-overdue">
                      {Math.abs(daysUntilDue)} days overdue
                    </span>
                  )}
                  {!isOverdue && invoice.status !== 'paid' && (
                    <span className="days-until-due">
                      {daysUntilDue} days until due
                    </span>
                  )}
                </div>
                {invoice.reminderSent && (
                  <div className="reminder-info">
                    <span className="label">Last Reminder:</span>
                    <span className="value">{invoice.lastReminderDate}</span>
                  </div>
                )}
                {invoice.payments && invoice.payments.length > 0 && (
                  <div className="payment-history">
                    <h3>Payment History</h3>
                    <div className="payment-list">
                      {invoice.payments.map((payment) => (
                        <div key={payment.id} className="payment-item">
                          <div className="payment-info">
                            <span className="payment-date">{payment.date}</span>
                            <span className="payment-amount">{formatCurrency(payment.amount)}</span>
                            <span className="payment-method">{payment.method}</span>
                            {payment.transactionId && (
                              <span className="transaction-id">Transaction ID: {payment.transactionId}</span>
                            )}
                          </div>
                          <button
                            className="view-receipt-btn"
                            onClick={() => onViewReceipt(payment)}
                          >
                            View Receipt
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="invoice-actions">
                <button
                  className="view-invoice-btn"
                  onClick={() => onViewInvoice(invoice)}
                >
                  View Invoice
                </button>
                {invoice.status !== 'paid' && (
                  <>
                    <button
                      className="mark-paid-btn"
                      onClick={() => onMarkAsPaid(invoice)}
                    >
                      Mark as Paid
                    </button>
                    <button
                      className="send-reminder-btn"
                      onClick={() => onSendReminder(invoice)}
                    >
                      Send Reminder
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 