'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import InvoiceHistory from './InvoiceHistory';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { dataService } from '../../../services/dataService';

// Add type declaration for jsPDF with autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => void;
  }
}

// Define Invoice interface
interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  sentAt: string;
  payments?: Array<{
    id: string;
    date: string;
    amount: number;
    method: string;
    transactionId: string;
  }>;
}

export default function OrderDetailsPage() {
  const params = useParams();
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [paymentData, setPaymentData] = useState({
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'bank_transfer'
  });
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: `INV-${Date.now()}`,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [
      {
        description: '',
        amount: 0,
        quantity: 1
      }
    ],
    taxRate: 10,
    notes: '',
    email: ''
  });
  const [showPreview, setShowPreview] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const orderId = params.id as string;
        const order = await dataService.getOrderById(orderId);
        if (order) {
          setOrderDetails(order);
          setInvoiceData(prev => ({
            ...prev,
            items: [{
              description: order.service,
              amount: order.details.budget,
              quantity: 1
            }],
            email: order.client.email
          }));
          
          const orderInvoices = await dataService.getInvoices(orderId);
          setInvoices(orderInvoices);
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const calculateSubtotal = () => {
    return invoiceData.items.reduce((sum, item) => sum + (item.amount * item.quantity), 0);
  };

  const calculateTax = () => {
    return (calculateSubtotal() * invoiceData.taxRate) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const addLineItem = () => {
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', amount: 0, quantity: 1 }]
    }));
  };

  const removeLineItem = (index: number) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const generatePDF = (invoiceData: any) => {
    const doc = new jsPDF();
    
    // Add company logo/header
    doc.setFontSize(20);
    doc.text('Brave Work Studio', 20, 20);
    doc.setFontSize(12);
    
    // Add invoice details
    doc.text(`Invoice Number: ${invoiceData.invoiceNumber}`, 20, 40);
    doc.text(`Issue Date: ${invoiceData.issueDate}`, 20, 50);
    doc.text(`Due Date: ${invoiceData.dueDate}`, 20, 60);
    
    // Add client details
    doc.setFontSize(14);
    doc.text('Bill To:', 20, 80);
    doc.setFontSize(12);
    doc.text(orderDetails.client.name, 20, 90);
    doc.text(orderDetails.client.company, 20, 100);
    doc.text(orderDetails.client.email, 20, 110);
    
    // Add items table
    const tableData = invoiceData.items.map((item: any) => [
      item.description,
      `$${item.amount.toFixed(2)}`,
      item.quantity,
      `$${(item.amount * item.quantity).toFixed(2)}`
    ]);
    
    // Add summary
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    const total = calculateTotal();
    
    doc.autoTable({
      startY: 120,
      head: [['Description', 'Amount', 'Quantity', 'Total']],
      body: tableData,
      foot: [
        ['', '', 'Subtotal:', `$${subtotal.toFixed(2)}`],
        ['', '', `Tax (${invoiceData.taxRate}%):`, `$${tax.toFixed(2)}`],
        ['', '', 'Total:', `$${total.toFixed(2)}`]
      ],
      theme: 'grid'
    });
    
    // Add notes if any
    if (invoiceData.notes) {
      const finalY = (doc as any).lastAutoTable.finalY + 20;
      doc.setFontSize(12);
      doc.text('Notes:', 20, finalY);
      doc.setFontSize(10);
      doc.text(invoiceData.notes, 20, finalY + 10);
    }
    
    // Save the PDF
    doc.save(`invoice-${invoiceData.invoiceNumber}.pdf`);
  };

  const handleViewInvoice = (invoice: any) => {
    // Here you would typically fetch the full invoice data from your backend
    // For now, we'll use the mock data
    generatePDF({
      ...invoice,
      items: [{ description: 'Service', amount: invoice.amount, quantity: 1 }],
      taxRate: 10,
      notes: ''
    });
  };

  const handleInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    
    try {
      // Generate PDF
      generatePDF(invoiceData);
      
      // Here you would typically send the invoice data to your backend
      console.log('Invoice data:', invoiceData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add to invoice history
      const newInvoice = {
        id: `INV${invoices.length + 1}`,
        invoiceNumber: invoiceData.invoiceNumber,
        issueDate: invoiceData.issueDate,
        dueDate: invoiceData.dueDate,
        amount: calculateTotal(),
        status: 'pending' as const,
        sentAt: new Date().toISOString()
      };
      
      setInvoices(prev => [...prev, newInvoice]);
      
      // Send email notification
      const emailData = {
        to: invoiceData.email,
        subject: `Invoice ${invoiceData.invoiceNumber} from Brave Work Studio`,
        html: `
          <h2>Invoice ${invoiceData.invoiceNumber}</h2>
          <p>Dear ${orderDetails.client.name},</p>
          <p>Thank you for your business. Please find attached your invoice for the following services:</p>
          <table>
            <tr>
              <th>Description</th>
              <th>Amount</th>
              <th>Quantity</th>
              <th>Total</th>
            </tr>
            ${invoiceData.items.map(item => `
              <tr>
                <td>${item.description}</td>
                <td>$${item.amount}</td>
                <td>${item.quantity}</td>
                <td>$${item.amount * item.quantity}</td>
              </tr>
            `).join('')}
          </table>
          <p>Subtotal: $${calculateSubtotal()}</p>
          <p>Tax (${invoiceData.taxRate}%): $${calculateTax()}</p>
          <p><strong>Total: $${calculateTotal()}</strong></p>
          <p>Due Date: ${invoiceData.dueDate}</p>
          <p>${invoiceData.notes}</p>
        `
      };
      
      // Here you would typically send the email using your email service
      console.log('Sending email:', emailData);
      
      setShowInvoiceForm(false);
      alert('Invoice sent successfully!');
    } catch (error) {
      console.error('Error sending invoice:', error);
      alert('Failed to send invoice. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleMarkAsPaid = (invoice: any) => {
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
  };

  const generateReceipt = (payment: any) => {
    const doc = new jsPDF();
    
    // Add company header
    doc.setFontSize(20);
    doc.text('Brave Work Studio', 20, 20);
    doc.setFontSize(12);
    
    // Add receipt details
    doc.text('PAYMENT RECEIPT', 20, 40);
    doc.text(`Receipt Number: RCP-${payment.id}`, 20, 50);
    doc.text(`Date: ${payment.date}`, 20, 60);
    doc.text(`Transaction ID: ${payment.transactionId}`, 20, 70);
    
    // Add payment details
    doc.setFontSize(14);
    doc.text('Payment Details:', 20, 90);
    doc.setFontSize(12);
    doc.text(`Amount: $${payment.amount.toFixed(2)}`, 20, 100);
    doc.text(`Method: ${payment.method}`, 20, 110);
    
    // Add client details
    doc.setFontSize(14);
    doc.text('Client Information:', 20, 130);
    doc.setFontSize(12);
    doc.text(orderDetails.client.name, 20, 140);
    doc.text(orderDetails.client.company, 20, 150);
    doc.text(orderDetails.client.email, 20, 160);
    
    // Add invoice reference
    doc.setFontSize(14);
    doc.text('Invoice Reference:', 20, 180);
    doc.setFontSize(12);
    doc.text(`Invoice Number: ${selectedInvoice?.invoiceNumber}`, 20, 190);
    
    // Save the PDF
    doc.save(`receipt-${payment.id}.pdf`);
  };

  const handleViewReceipt = (payment: any) => {
    setSelectedPayment(payment);
    generateReceipt(payment);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Generate transaction ID
      const transactionId = `TRX-${Date.now()}`;
      
      // Create new payment record
      const newPayment = {
        id: `PAY${invoices.length + 1}`,
        date: paymentData.paymentDate,
        amount: selectedInvoice.amount,
        method: paymentData.paymentMethod,
        transactionId
      };
      
      // Update invoice status and add payment to history
      setInvoices(prev => prev.map(inv => 
        inv.id === selectedInvoice.id 
          ? {
              ...inv,
              status: 'paid' as const,
              paymentDate: paymentData.paymentDate,
              paymentMethod: paymentData.paymentMethod,
              payments: [...(inv.payments || []), newPayment]
            }
          : inv
      ));

      // Generate and save receipt
      generateReceipt(newPayment);

      // Send payment confirmation email
      const emailData = {
        to: orderDetails.client.email,
        subject: `Payment Confirmation - Invoice ${selectedInvoice.invoiceNumber}`,
        html: `
          <h2>Payment Confirmation</h2>
          <p>Dear ${orderDetails.client.name},</p>
          <p>Thank you for your payment. We have received the following payment:</p>
          <ul>
            <li>Invoice Number: ${selectedInvoice.invoiceNumber}</li>
            <li>Amount: $${selectedInvoice.amount.toFixed(2)}</li>
            <li>Payment Date: ${paymentData.paymentDate}</li>
            <li>Payment Method: ${paymentData.paymentMethod}</li>
            <li>Transaction ID: ${transactionId}</li>
          </ul>
          <p>A receipt has been attached to this email.</p>
          <p>If you have any questions, please don't hesitate to contact us.</p>
        `
      };
      
      // Here you would typically send the email using your email service
      console.log('Sending payment confirmation email:', emailData);
      
      setShowPaymentModal(false);
      alert('Payment recorded successfully!');
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('Failed to record payment. Please try again.');
    }
  };

  const handleSendReminder = async (invoice: any) => {
    try {
      // Here you would typically send the reminder through your backend
      const emailData = {
        to: orderDetails.client.email,
        subject: `Payment Reminder - Invoice ${invoice.invoiceNumber}`,
        html: `
          <h2>Payment Reminder</h2>
          <p>Dear ${orderDetails.client.name},</p>
          <p>This is a reminder that payment is due for the following invoice:</p>
          <ul>
            <li>Invoice Number: ${invoice.invoiceNumber}</li>
            <li>Amount: $${invoice.amount.toFixed(2)}</li>
            <li>Due Date: ${invoice.dueDate}</li>
          </ul>
          <p>Please process the payment as soon as possible to avoid any late fees.</p>
          <p>If you have already made the payment, please disregard this reminder.</p>
        `
      };
      
      // Here you would typically send the email using your email service
      console.log('Sending reminder email:', emailData);
      
      // Update reminder status
      setInvoices(prev => prev.map(inv => 
        inv.id === invoice.id 
          ? {
              ...inv,
              reminderSent: true,
              lastReminderDate: new Date().toISOString()
            }
          : inv
      ));
      
      alert('Reminder sent successfully!');
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert('Failed to send reminder. Please try again.');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!orderDetails) {
    return <div className="error">Order not found</div>;
  }

  return (
    <div className="order-details-page">
      <div className="order-details-container">
        <div className="order-header">
          <h1>Order Details</h1>
          <div className="order-actions">
            <button 
              className="create-invoice-btn"
              onClick={() => setShowInvoiceForm(true)}
            >
              Create Invoice
            </button>
            <Link href="/admin/orders" className="back-button">
              Back to Orders
            </Link>
          </div>
        </div>

        <div className="order-content">
          <div className="order-section">
            <h2>Order Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Order ID</label>
                <span>{orderDetails.id}</span>
              </div>
              <div className="info-item">
                <label>Service</label>
                <span>{orderDetails.service}</span>
              </div>
              <div className="info-item">
                <label>Status</label>
                <span className={`status-badge ${orderDetails.details.status.toLowerCase()}`}>
                  {orderDetails.details.status}
                </span>
              </div>
              <div className="info-item">
                <label>Date</label>
                <span>{orderDetails.details.date}</span>
              </div>
              <div className="info-item">
                <label>Budget</label>
                <span>${orderDetails.details.budget}</span>
              </div>
              <div className="info-item">
                <label>Timeline</label>
                <span>{orderDetails.details.timeline}</span>
              </div>
            </div>
          </div>

          <div className="order-section">
            <h2>Client Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Name</label>
                <span>{orderDetails.client.name}</span>
              </div>
              <div className="info-item">
                <label>Email</label>
                <span>{orderDetails.client.email}</span>
              </div>
              <div className="info-item">
                <label>Phone</label>
                <span>{orderDetails.client.phone}</span>
              </div>
              <div className="info-item">
                <label>Company</label>
                <span>{orderDetails.client.company}</span>
              </div>
            </div>
          </div>

          <div className="order-section">
            <h2>Project Details</h2>
            <p className="description">{orderDetails.details.description}</p>
          </div>

          <div className="order-section">
            <h2>Attached Files</h2>
            <div className="files-list">
              {orderDetails.details.files.map((file, index) => (
                <div key={index} className="file-item">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{file.size}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="order-section">
            <InvoiceHistory 
              invoices={invoices}
              onViewInvoice={handleViewInvoice}
              onMarkAsPaid={handleMarkAsPaid}
              onSendReminder={handleSendReminder}
              onViewReceipt={handleViewReceipt}
            />
          </div>
        </div>

        {showInvoiceForm && (
          <div className="invoice-form-overlay">
            <div className="invoice-form-container">
              <div className="invoice-form-header">
                <h2>Create Invoice</h2>
                <button 
                  className="close-button"
                  onClick={() => setShowInvoiceForm(false)}
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleInvoiceSubmit} className="invoice-form">
                <div className="form-group">
                  <label>Invoice Number</label>
                  <input
                    type="text"
                    value={invoiceData.invoiceNumber}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Issue Date</label>
                  <input
                    type="date"
                    value={invoiceData.issueDate}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, issueDate: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={invoiceData.dueDate}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, dueDate: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Items</label>
                  {invoiceData.items.map((item, index) => (
                    <div key={index} className="invoice-item">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => {
                          const newItems = [...invoiceData.items];
                          newItems[index] = { ...item, description: e.target.value };
                          setInvoiceData(prev => ({ ...prev, items: newItems }));
                        }}
                        placeholder="Description"
                      />
                      <input
                        type="number"
                        value={item.amount}
                        onChange={(e) => {
                          const newItems = [...invoiceData.items];
                          newItems[index] = { ...item, amount: parseFloat(e.target.value) };
                          setInvoiceData(prev => ({ ...prev, items: newItems }));
                        }}
                        placeholder="Amount"
                      />
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const newItems = [...invoiceData.items];
                          newItems[index] = { ...item, quantity: parseInt(e.target.value) };
                          setInvoiceData(prev => ({ ...prev, items: newItems }));
                        }}
                        placeholder="Quantity"
                      />
                      <button
                        type="button"
                        className="remove-item-btn"
                        onClick={() => removeLineItem(index)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="add-item-btn"
                    onClick={addLineItem}
                  >
                    Add Line Item
                  </button>
                </div>
                <div className="form-group">
                  <label>Tax Rate (%)</label>
                  <input
                    type="number"
                    value={invoiceData.taxRate}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, taxRate: parseFloat(e.target.value) }))}
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    value={invoiceData.notes}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={4}
                  />
                </div>
                <div className="invoice-summary">
                  <div className="summary-item">
                    <span>Subtotal:</span>
                    <span>${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="summary-item">
                    <span>Tax ({invoiceData.taxRate}%):</span>
                    <span>${calculateTax().toFixed(2)}</span>
                  </div>
                  <div className="summary-item total">
                    <span>Total:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    className="preview-button"
                    onClick={() => setShowPreview(true)}
                  >
                    Preview Invoice
                  </button>
                  <button
                    type="submit"
                    className="submit-button"
                    disabled={isSending}
                  >
                    {isSending ? 'Sending...' : 'Send Invoice'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showPreview && (
          <div className="invoice-preview-overlay">
            <div className="invoice-preview-container">
              <div className="invoice-preview-header">
                <h2>Invoice Preview</h2>
                <button 
                  className="close-button"
                  onClick={() => setShowPreview(false)}
                >
                  ×
                </button>
              </div>
              <div className="invoice-preview-content">
                <div className="preview-header">
                  <h1>INVOICE</h1>
                  <div className="invoice-details">
                    <p><strong>Invoice Number:</strong> {invoiceData.invoiceNumber}</p>
                    <p><strong>Issue Date:</strong> {invoiceData.issueDate}</p>
                    <p><strong>Due Date:</strong> {invoiceData.dueDate}</p>
                  </div>
                </div>
                <div className="preview-client">
                  <h3>Bill To:</h3>
                  <p>{orderDetails.client.name}</p>
                  <p>{orderDetails.client.company}</p>
                  <p>{orderDetails.client.email}</p>
                </div>
                <table className="preview-items">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Quantity</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.description}</td>
                        <td>${item.amount.toFixed(2)}</td>
                        <td>{item.quantity}</td>
                        <td>${(item.amount * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="preview-summary">
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <span>${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Tax ({invoiceData.taxRate}%):</span>
                    <span>${calculateTax().toFixed(2)}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
                {invoiceData.notes && (
                  <div className="preview-notes">
                    <h3>Notes:</h3>
                    <p>{invoiceData.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showPaymentModal && (
          <div className="payment-modal-overlay">
            <div className="payment-modal-container">
              <div className="payment-modal-header">
                <h2>Record Payment</h2>
                <button 
                  className="close-button"
                  onClick={() => setShowPaymentModal(false)}
                >
                  ×
                </button>
              </div>
              <form onSubmit={handlePaymentSubmit} className="payment-form">
                <div className="form-group">
                  <label>Payment Date</label>
                  <input
                    type="date"
                    value={paymentData.paymentDate}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, paymentDate: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Payment Method</label>
                  <select
                    value={paymentData.paymentMethod}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    required
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="paypal">PayPal</option>
                    <option value="crypto">Cryptocurrency</option>
                  </select>
                </div>
                <div className="payment-summary">
                  <div className="summary-item">
                    <span>Invoice Number:</span>
                    <span>{selectedInvoice?.invoiceNumber}</span>
                  </div>
                  <div className="summary-item">
                    <span>Amount:</span>
                    <span>${selectedInvoice?.amount.toFixed(2)}</span>
                  </div>
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => setShowPaymentModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="submit-button"
                  >
                    Record Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showReceiptModal && selectedPayment && (
          <div className="receipt-modal-overlay">
            <div className="receipt-modal-container">
              <div className="receipt-modal-header">
                <h2>Payment Receipt</h2>
                <button 
                  className="close-button"
                  onClick={() => setShowReceiptModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="receipt-content">
                <div className="receipt-details">
                  <div className="receipt-item">
                    <span className="label">Receipt Number:</span>
                    <span className="value">RCP-{selectedPayment.id}</span>
                  </div>
                  <div className="receipt-item">
                    <span className="label">Date:</span>
                    <span className="value">{selectedPayment.date}</span>
                  </div>
                  <div className="receipt-item">
                    <span className="label">Transaction ID:</span>
                    <span className="value">{selectedPayment.transactionId}</span>
                  </div>
                  <div className="receipt-item">
                    <span className="label">Amount:</span>
                    <span className="value">${selectedPayment.amount.toFixed(2)}</span>
                  </div>
                  <div className="receipt-item">
                    <span className="label">Payment Method:</span>
                    <span className="value">{selectedPayment.method}</span>
                  </div>
                </div>
                <div className="receipt-actions">
                  <button
                    className="download-receipt-btn"
                    onClick={() => generateReceipt(selectedPayment)}
                  >
                    Download Receipt
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 