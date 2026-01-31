"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Plus, Pencil, Trash2, Tag, CheckSquare, Search } from "lucide-react";

// Import the new Pagination component
import Pagination from "../../../components/Pagination";

// These modal components are assumed to exist and are kept as is.
import CustomOfferModal from "./CustomOfferModal";
import OrderFormModal from "./OrderFormModal";
import ConfirmationModal from "@/app/components/ConfirmationModal";
import { Order } from "../../../types/app";

// Constant for items per page
const ITEMS_PER_PAGE = 10;

export default function AdminOrdersSection() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
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
    if (order.status !== "paid") {
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
        },
      );
      if (!res.ok) throw new Error("Failed to update portfolio status.");
      toast.success(
        `Order ${orderToTogglePortfolio.id} portfolio status updated!`,
      );
      fetchOrders();
    } catch (err: any) {
      console.error("Error marking as portfolio:", err);
      toast.error(
        "Error updating portfolio status: " + (err.message || "Unknown error."),
      );
    } finally {
      setLoading(false);
      setOrderToTogglePortfolio(null);
    }
  };

  const handleCreateCustomOffer = (order: Order) => {
    if (order.amount !== 0 || order.amountPaid !== 0) {
      toast.error(
        "Custom offers can only be created for orders with 0 total expected amount and 0 amount paid.",
      );
      return;
    }
    setSelectedOrder(order);
    setIsOfferModalOpen(true);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        order.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.clientName || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        order.id.toString().includes(searchQuery),
    );
  }, [orders, searchQuery]);

  const activeProjects = useMemo(() => {
    return filteredOrders.filter((order) => order.status === "partially_paid");
  }, [filteredOrders]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded-full text-xs font-bold">
            Paid
          </span>
        );
      case "pending":
        return (
          <span className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 px-2 py-1 rounded-full text-xs font-bold">
            Pending
          </span>
        );
      case "partially_paid":
        return (
          <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded-full text-xs font-bold">
            Partial
          </span>
        );
      case "expired":
        return (
          <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 px-2 py-1 rounded-full text-xs font-bold">
            Expired
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300 px-2 py-1 rounded-full text-xs font-bold">
            {status}
          </span>
        );
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentOrders = filteredOrders.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Orders & Projects
        </h2>
        <button
          onClick={handleCreateOrder}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 transition-all font-semibold"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Order
        </button>
      </div>

      {/* Active Projects Quick View */}
      {activeProjects.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                    {project.serviceName}
                  </h4>
                  {getStatusBadge(project.status)}
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Client:{" "}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {project.clientName || "N/A"}
                  </span>
                </p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Started:</span>
                  <span className="font-medium">
                    {project.dateStarted
                      ? format(new Date(project.dateStarted), "MMM dd, yyyy")
                      : "N/A"}
                  </span>
                </div>
              </div>
              <Link
                href={`/admin/orders/${project.id}`}
                className="mt-6 w-full text-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-semibold"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by ID, service, or client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Order Info
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Finances
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td
                      colSpan={5}
                      className="px-6 py-4 h-16 bg-gray-50/50 dark:bg-gray-800/50"
                    ></td>
                  </tr>
                ))
              ) : currentOrders.length > 0 ? (
                currentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {order.serviceName}
                        </p>
                        <p className="text-xs text-gray-500">
                          ID: #{order.id} |{" "}
                          {format(new Date(order.date), "MMM dd, yyyy")}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {order.clientName || "N/A"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs space-y-1">
                        <p className="text-gray-600 dark:text-gray-400">
                          Total:{" "}
                          <span className="font-bold text-gray-900 dark:text-white">
                            ₦{(order.amount / kobo).toLocaleString()}
                          </span>
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Paid:{" "}
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">
                            ₦{(order.amountPaid / kobo).toLocaleString()}
                          </span>
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="p-2 text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg hover:bg-blue-100 transition-colors"
                          title="View/Edit Details"
                        >
                          <Pencil size={16} />
                        </Link>
                        {order.status === "paid" && (
                          <button
                            onClick={() => handleMarkAsPortfolio(order)}
                            className={`p-2 rounded-lg transition-colors ${
                              order.isPortfolio
                                ? "text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-300"
                                : "text-gray-400 bg-gray-50 dark:bg-gray-700/50"
                            }`}
                            title={
                              order.isPortfolio
                                ? "Unmark from Portfolio"
                                : "Mark as Portfolio"
                            }
                          >
                            <CheckSquare size={16} />
                          </button>
                        )}
                        {order.status === "pending" && (
                          <button
                            onClick={() => handleCreateCustomOffer(order)}
                            className="p-2 text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-300 rounded-lg hover:bg-purple-100 transition-colors"
                            title="Create Custom Offer"
                          >
                            <Tag size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteOrder(order.id.toString())}
                          className="p-2 text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-300 rounded-lg hover:bg-red-100 transition-colors"
                          title="Delete Order"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No orders found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {isOfferModalOpen && selectedOrder && (
        <CustomOfferModal
          offer={null}
          orders={orders}
          isOpen={isOfferModalOpen}
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
          isOpen={isConfirmModalOpen}
          message={
            orderToDeleteId
              ? `Are you sure you want to delete order ${orderToDeleteId}?`
              : orderToTogglePortfolio
                ? `Are you sure you want to ${
                    orderToTogglePortfolio.isPortfolio ? "unmark" : "mark"
                  } order ${orderToTogglePortfolio.id} as a portfolio piece?`
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
