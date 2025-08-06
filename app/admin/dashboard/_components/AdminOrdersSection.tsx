"use client";

import React, { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";

import Link from "next/link";
import { useRouter } from "next/navigation";

import CustomOfferModal from "./CustomOfferModal"; // New modal component
import OrderFormModal from "./OrderFormModal"; // New modal component
import { Order } from "../../../types/app";

export default function AdminOrdersSection() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isOrderFormModalOpen, setIsOrderFormModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null); // For editing/creating offers

  const kobo = 100;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/orders"); // NEW API ROUTE (GET all orders)
      if (!res.ok) throw new Error("Failed to fetch orders.");
      const data: Order[] = await res.json();
      setOrders(data);
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      setError(err.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCreateOrder = () => {
    setSelectedOrder(null); // Clear any previously selected order
    setIsOrderFormModalOpen(true);
  };

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderFormModalOpen(true);
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm(`Are you sure you want to delete order ${orderId}?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
      }); // NEW API ROUTE
      if (!res.ok) throw new Error("Failed to delete order.");
      alert("Order deleted successfully!");
      fetchOrders(); // Re-fetch orders after deletion
    } catch (err: any) {
      console.error("Error deleting order:", err);
      alert("Error deleting order: " + (err.message || "Unknown error."));
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPortfolio = async (order: Order) => {
    if (order.statusName !== "paid") {
      alert("Only paid orders can be marked as portfolio.");
      return;
    }
    if (!confirm(`Mark order ${order.id} as portfolio?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/portfolio`, {
        // NEW API ROUTE (PATCH)
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPortfolio: !order.isPortfolio }), // Toggle status
      });
      if (!res.ok) throw new Error("Failed to update portfolio status.");
      alert(`Order ${order.id} portfolio status updated!`);
      fetchOrders();
    } catch (err: any) {
      console.error("Error marking as portfolio:", err);
      alert(
        "Error updating portfolio status: " + (err.message || "Unknown error.")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomOffer = (order: Order) => {
    if (order.amount !== 0 || order.amountPaid !== 0) {
      alert(
        "Custom offers can only be created for orders with 0 total expected amount and 0 amount paid."
      );
      return;
    }
    setSelectedOrder(order);
    setIsOfferModalOpen(true);
  };

  const activeProjects = orders.filter(
    (order) => order.statusName === "partially_paid"
  );

  if (loading) return <div className="loading-state">Loading orders...</div>;
  if (error) return <div className="error-state">Error: {error}</div>;

  return (
    <div className="dashboard-section">
      <h2>Orders & Projects</h2>
      <button onClick={handleCreateOrder} className="action-button mb-4">
        Create Portfolio
      </button>

      {/* Active Projects */}
      <div className="dashboard-card active-projects mt-4">
        <h3>Active Projects ({activeProjects.length})</h3>
        {activeProjects.length > 0 ? (
          <div className="orders-list">
            {activeProjects.map((project) => (
              <div key={project.id} className="order-item">
                <div className="order-info">
                  <h4>{project.service}</h4>
                  <p>Client: {project.clientName}</p>
                  <p>
                    Status:{" "}
                    <span className={`status-badge ${project.statusName}`}>
                      {project.statusName}
                    </span>
                  </p>
                  <p>
                    Started:{" "}
                    {project.dateStarted
                      ? format(new Date(project.dateStarted), "MMM dd, yyyy")
                      : "N/A"}
                  </p>
                </div>
                <div className="order-actions">
                  <Link
                    href={`/admin/orders/${project.id}`}
                    className="view-button"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No active projects at the moment.</p>
        )}
      </div>

      {/* All Orders Table */}
      <div className="dashboard-card all-orders mt-4">
        <h3>All Orders</h3>
        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">ID</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Service</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Client</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Amount</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Paid</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Created</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Started</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Completed</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-2 text-sm text-gray-800">{order.id}</td>
                    <td className="px-4 py-2 text-sm text-gray-800">{order.serviceName}</td>
                    <td className="px-4 py-2 text-sm text-gray-800">{order.clientName || "N/A"}</td>
                    <td className="px-4 py-2 text-sm text-gray-800">
                      <span className={`status-badge`}>
                        {order.statusName}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800">₦{(order.amount / kobo).toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm text-gray-800">₦{(order.amountPaid / kobo).toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm text-gray-800">{format(new Date(order.date), "MMM dd, yyyy")}</td>
                    <td className="px-4 py-2 text-sm text-gray-800">
                      {order.dateStarted
                        ? format(new Date(order.dateStarted), "MMM dd, yyyy")
                        : "N/A"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-800">
                      {order.dateCompleted
                        ? format(new Date(order.dateCompleted), "MMM dd, yyyy")
                        : "N/A"}
                    </td>
                    <td className="action-buttons">
                      <button
                        onClick={() => handleEditOrder(order)}
                        className="edit-button"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="delete-button"
                      >
                        Delete
                      </button>
                      {order.statusName === "paid" && (
                        <button
                          onClick={() => handleMarkAsPortfolio(order)}
                          className={`portfolio-button ${
                            order.isPortfolio ? "marked" : ""
                          }`}
                        >
                          {order.isPortfolio
                            ? "Unmark Portfolio"
                            : "Mark Portfolio"}
                        </button>
                      )}
                      {order.statusName === "pending" && (
                        <button
                          onClick={() => handleCreateCustomOffer(order)}
                          className="offer-button"
                        >
                          Create Offer
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No orders found.</p>
        )}
      </div>

      {isOfferModalOpen && selectedOrder && (
        <CustomOfferModal
          order={selectedOrder}
          onClose={() => {
            setIsOfferModalOpen(false);
            setSelectedOrder(null);
          }}
          onSave={() => {
            fetchOrders();
            setIsOfferModalOpen(false);
            setSelectedOrder(null);
          }}
        />
      )}

      {isOrderFormModalOpen && (
        <OrderFormModal
          order={selectedOrder} // Pass null for create, order for edit
          onClose={() => {
            setIsOrderFormModalOpen(false);
            setSelectedOrder(null);
          }}
          onSave={() => {
            fetchOrders();
            setIsOrderFormModalOpen(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
}
