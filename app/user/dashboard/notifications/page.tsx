"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Bell,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ChevronRight,
  Trash2,
  Inbox,
  AlertCircle,
  MoreVertical,
  CheckCheck,
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Notification {
  id: number;
  title: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string;
  offerId?: number;
  offerAmount?: number;
  offerDescription?: string;
  offerStatus?: string;
  offerExpiresAt?: string;
}

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/user/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchNotifications();
    }
  }, [status]);

  const markAsRead = async (id: number) => {
    try {
      const res = await fetch(`/api/user/notifications?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
    if (unreadIds.length === 0) return;

    try {
      // For simplicity, we loop through PATCH calls or we could add a bulk-mark API
      await Promise.all(
        unreadIds.map((id) =>
          fetch(`/api/user/notifications?id=${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isRead: true }),
          })
        )
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const filteredNotifications = notifications
    .filter((n) => {
      if (filter === "unread") return !n.isRead;
      if (filter === "read") return n.isRead;
      return true;
    })
    .filter(
      (n) =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (status === "loading" || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 font-medium animate-pulse">
          Loading your notifications...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bell className="text-green-600" size={32} />
            Notifications
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2.5 py-1 rounded-full animate-bounce">
                {unreadCount} New
              </span>
            )}
          </h1>
          <p className="text-gray-500 mt-1">
            Stay updated with your activities and offers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCheck size={18} />
            Mark all as read
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center bg-gray-50 rounded-xl px-3 py-1 p-1 w-full md:w-auto">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              filter === "all"
                ? "bg-white text-green-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              filter === "unread"
                ? "bg-white text-green-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => setFilter("read")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              filter === "read"
                ? "bg-white text-green-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Read
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-500 transition-all text-sm"
          />
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {filteredNotifications.map((notif) => (
              <motion.div
                key={notif.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`group relative bg-white rounded-2xl border transition-all duration-300 ${
                  notif.isRead
                    ? "border-gray-100 grayscale-[0.5] opacity-80"
                    : "border-green-100 shadow-md shadow-green-500/5 ring-1 ring-green-600/5 lg:hover:scale-[1.01]"
                }`}
              >
                <div className="flex items-start gap-4 p-5">
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${
                      notif.isRead
                        ? "bg-gray-100 text-gray-400"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {notif.isRead ? (
                      <Inbox size={24} />
                    ) : (
                      <AlertCircle size={24} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3
                        className={`font-bold text-lg truncate ${
                          notif.isRead ? "text-gray-600" : "text-gray-900"
                        }`}
                      >
                        {notif.title}
                      </h3>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={12} />
                        {format(new Date(notif.createdAt), "MMM d, h:mm a")}
                      </span>
                    </div>
                    <p
                      className={`text-sm leading-relaxed ${
                        notif.isRead ? "text-gray-500" : "text-gray-700"
                      }`}
                    >
                      {notif.message}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      {notif.link && (
                        <Link
                          href={notif.link}
                          onClick={() => markAsRead(notif.id)}
                          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                            notif.isRead
                              ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              : "bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/20"
                          }`}
                        >
                          View Details
                          <ChevronRight size={14} />
                        </Link>
                      )}

                      {!notif.isRead && (
                        <button
                          onClick={() => markAsRead(notif.id)}
                          className="text-xs font-bold text-gray-400 hover:text-green-600 transition-colors"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center gap-2">
                    {!notif.isRead && (
                      <div className="w-2.5 h-2.5 rounded-full bg-green-600" />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="bg-white rounded-3xl border border-dashed border-gray-200 py-20 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
              <Inbox size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">All caught up!</h3>
            <p className="text-gray-500 max-w-xs mt-2">
              {searchQuery
                ? "No notifications matching your search."
                : "You don't have any notifications at the moment."}
            </p>
            {filter !== "all" && (
              <button
                onClick={() => setFilter("all")}
                className="mt-6 text-green-600 font-bold hover:underline"
              >
                Show all notifications
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
