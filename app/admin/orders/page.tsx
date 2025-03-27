'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { dataService } from '../../services/dataService';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const fetchedOrders = await dataService.getOrders();
        setOrders(fetchedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="orders-page">
      <div className="page-header">
        <h1>Orders</h1>
      </div>
      
      <div className="orders-grid">
        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <h2>Order #{order.id}</h2>
              <span className={`status-badge ${order.details.status.toLowerCase()}`}>
                {order.details.status}
              </span>
            </div>
            
            <div className="order-info">
              <div className="info-group">
                <label>Service</label>
                <span>{order.service}</span>
              </div>
              
              <div className="info-group">
                <label>Client</label>
                <span>{order.client.name}</span>
                <span className="sub-text">{order.client.company}</span>
              </div>
              
              <div className="info-group">
                <label>Budget</label>
                <span>${order.details.budget}</span>
              </div>
              
              <div className="info-group">
                <label>Timeline</label>
                <span>{order.details.timeline}</span>
              </div>
              
              <div className="info-group">
                <label>Date</label>
                <span>{order.details.date}</span>
              </div>
            </div>
            
            <div className="order-actions">
              <Link href={`/admin/orders/${order.id}`} className="view-button">
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 