"use client";

import React, { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  Plus,
  Pencil,
  Trash2,
  Tag,
  CheckSquare,
  XCircle,
} from "lucide-react";

// Import the new Pagination component
import Pagination from "../../../components/Pagination";

// These modal components are assumed to exist and are kept as is.
import CustomOfferModal from "./CustomOfferModal";
import OrderFormModal from "./OrderFormModal";
import { Order } from "../../../types/app";

// --- Custom Confirmation Modal Component ---
// This is a simple modal to replace the native `confirm()` function.
// It's defined here to keep the file self-contained, but it's a good candidate for its own component file.
const ConfirmationModal = ({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full mx-4">
        <p className="text-lg font-semibold text-gray-800 mb-4">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

// Constant for items per page
const ITEMS_PER_PAGE = 10;

export default function AdminOrdersSection() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isOrderFormModalOpen, setIsOrderFormModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);

  // State for custom confirmation modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [orderToDeleteId, setOrderToDeleteId] = useState<string | null>(null);
  const [orderToTogglePortfolio, setOrderToTogglePortfolio] =
    useState<Order | null>(null);

  const kobo = 100;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/orders");
      if (!res.ok) throw new Error("Failed to fetch orders.");
      const data: Order[] = await res.json();
      setOrders(data);
      setCurrentPage(1); // Reset to the first page when new data is fetched
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      setError(err.message || "Failed to load orders.");
      toast.error(err.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCreateOrder = () => {
    setSelectedOrder(null);
    setIsOrderFormModalOpen(true);
  };

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderFormModalOpen(true);
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrderToDeleteId(orderId);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!orderToDeleteId) return;

    setLoading(true);
    setIsConfirmModalOpen(false); // Close the modal
    try {
      const res = await fetch(`/api/admin/orders/${orderToDeleteId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete order.");
      toast.success(`Order ${orderToDeleteId} deleted successfully!`);
      fetchOrders();
    } catch (err: any) {
      console.error("Error deleting order:", err);
      toast.error(err.message || "Error deleting order.");
    } finally {
      setLoading(false);
      setOrderToDeleteId(null);
    }
  };

  const handleMarkAsPortfolio = (order: Order) => {
    if (order.statusName !== "paid") {
      toast.error("Only paid orders can be marked as portfolio.");
      return;
    }
    setOrderToTogglePortfolio(order);
    setIsConfirmModalOpen(true); // Re-using the same modal for a different action.
  };

  const handleConfirmPortfolioToggle = async () => {
    if (!orderToTogglePortfolio) return;

    setLoading(true);
    setIsConfirmModalOpen(false); // Close the modal
    try {
      const res = await fetch(
        `/api/admin/orders/${orderToTogglePortfolio.id}/portfolio`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            isPortfolio: !orderToTogglePortfolio.isPortfolio,
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to update portfolio status.");
      toast.success(
        `Order ${orderToTogglePortfolio.id} portfolio status updated!`
      );
      fetchOrders();
    } catch (err: any) {
      console.error("Error marking as portfolio:", err);
      toast.error(
        "Error updating portfolio status: " + (err.message || "Unknown error.")
      );
    } finally {
      setLoading(false);
      setOrderToTogglePortfolio(null);
    }
  };

  const handleCreateCustomOffer = (order: Order) => {
    if (order.amount !== 0 || order.amountPaid !== 0) {
      toast.error(
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500 text-white";
      case "pending":
        return "bg-yellow-400 text-yellow-900";
      case "partially_paid":
        return "bg-blue-500 text-white";
      case "expired":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-400 text-gray-800";
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentOrders = orders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-gray-600">
        <svg
          className="animate-spin h-8 w-8 mr-3 text-blue-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        Loading orders...
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-red-600 font-medium">
        <XCircle className="w-6 h-6 mr-2" /> Error: {error}
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 rounded-xl shadow-lg border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Orders & Projects</h2>
        <button
          onClick={handleCreateOrder}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Order
        </button>
      </div>

      {/* Active Projects */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          Active Projects ({activeProjects.length})
        </h3>
        {activeProjects.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeProjects.map((project) => (
              <div
                key={project.id}
                className="bg-gray-50 p-4 rounded-lg shadow-inner flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-lg font-bold text-blue-800">
                    {project.service}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Client: {project.clientName}
                  </p>
                  <div className="mt-2 flex items-center">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(
                        project.statusName
                      )}`}
                    >
                      {project.statusName}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Started:{" "}
                    {project.dateStarted
                      ? format(new Date(project.dateStarted), "MMM dd, yyyy")
                      : "N/A"}
                  </p>
                </div>
                <div className="mt-4">
                  <Link
                    href={`/admin/orders/${project.id}`}
                    className="inline-block w-full text-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">
            No active projects at the moment.
          </p>
        )}
      </div>

      {/* All Orders Table */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">All Orders</h3>
        {orders.length > 0 ? (
          <div className="overflow-x-auto rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Paid
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {currentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {order.id}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {order.serviceName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {order.clientName || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(
                          order.statusName
                        )}`}
                      >
                        {order.statusName}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      ₦{(order.amount / kobo).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      ₦{(order.amountPaid / kobo).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {format(new Date(order.date), "MMM dd, yyyy")}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 space-y-1 sm:space-y-0 sm:space-x-1 flex flex-col sm:flex-row">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="flex items-center justify-center px-2 py-1 text-xs text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Pencil className="w-4 h-4 mr-1" />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="flex items-center justify-center px-2 py-1 text-xs text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </button>
                      {order.statusName === "paid" && (
                        <button
                          onClick={() => handleMarkAsPortfolio(order)}
                          className={`flex items-center justify-center px-2 py-1 text-xs rounded-lg transition-colors ${
                            order.isPortfolio
                              ? "bg-green-600 text-white hover:bg-green-700"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          <CheckSquare className="w-4 h-4 mr-1" />
                          {order.isPortfolio
                            ? "Unmark Portfolio"
                            : "Mark Portfolio"}
                        </button>
                      )}
                      {order.statusName === "pending" && (
                        <button
                          onClick={() => handleCreateCustomOffer(order)}
                          className="flex items-center justify-center px-2 py-1 text-xs text-purple-600 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors"
                        >
                          <Tag className="w-4 h-4 mr-1" />
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
          <p className="text-gray-500 italic">No orders found.</p>
        )}
        {/* Render the Pagination component */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
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
          order={selectedOrder}
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

      {isConfirmModalOpen && (
        <ConfirmationModal
          message={
            orderToDeleteId
              ? `Are you sure you want to delete order ${orderToDeleteId}?`
              : orderToTogglePortfolio
              ? `Are you sure you want to ${
                  orderToTogglePortfolio.isPortfolio ? "unmark" : "mark"
                } order ${
                  orderToTogglePortfolio.id
                } as a portfolio piece?`
              : "Are you sure?"
          }
          onConfirm={
            orderToDeleteId ? handleConfirmDelete : handleConfirmPortfolioToggle
          }
          onCancel={() => {
            setIsConfirmModalOpen(false);
            setOrderToDeleteId(null);
            setOrderToTogglePortfolio(null);
          }}
        />
      )}
    </div>
  );
}
