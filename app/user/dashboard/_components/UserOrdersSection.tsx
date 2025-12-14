"use client";

import React, { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { toast } from "react-toastify";
import { Loader, XCircle } from "lucide-react";

// Import the new Pagination component
import Pagination from "../../../components/Pagination";

// These modal components are assumed to exist and are kept as is.
import { Order } from "../../../types/app";

// Constant for items per page
const ITEMS_PER_PAGE = 10;

export default function UserOrdersSection() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);

  const KOBO_PER_NAIRA = 100;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/user/orders");
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


  const activeProjects = orders.filter(
    (order) => order.status === "partially_paid"
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
    return <Loader/>;
  if (error)
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-red-600 font-medium">
        <XCircle className="w-6 h-6 mr-2" /> Error: {error}
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 rounded-xl shadow-lg border border-gray-200">
      <div className="flex justify-between items-center mb-6 mt-10">
        <h2 className="text-3xl font-bold text-gray-800">Orders & Projects</h2>
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
                        project.status
                      )}`}
                    >
                      {project.status}
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {currentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {order.id}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {order.serviceName}
                    </td>
                    
                    <td className="px-4 py-3 text-sm text-gray-800">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      ₦{(order.amount / KOBO_PER_NAIRA).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      ₦{(order.amountPaid / KOBO_PER_NAIRA).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {format(new Date(order.date), "MMM dd, yyyy")}
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
    </div>
  );
}
