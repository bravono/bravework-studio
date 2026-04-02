"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
  ExternalLink,
  Clock,
  User as UserIcon,
  Search,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { toast } from "react-toastify";
import Modal from "@/app/components/Modal";

interface PendingUser {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  verification_submitted_at: string;
  id_type: string;
  id_card_front_url: string;
  id_card_back_url: string | null;
  selfie_with_id_url: string;
}

export default function AdminVerificationReview() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      // In a real scenario, you'd have an API specifically for pending verifications
      // or filter the general users API. For now, we'll assume there's a way to get them.
      const res = await fetch("/api/admin/users?pendingVerification=true");
      if (!res.ok) throw new Error("Failed to fetch pending verifications");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load pending verifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleAction = async (userId: number, action: "approve" | "reject") => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) throw new Error(`Failed to ${action} user`);

      toast.success(`User ${action}d successfully`);
      setSelectedUser(null);
      fetchPendingUsers();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      `${user.first_name} ${user.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
            <ShieldCheck className="text-green-600" />
            Verification Requests
          </h2>
          <p className="text-sm text-gray-500 font-medium">
            Review and validate user identity documents
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none w-full md:w-64 transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-20 text-center">
            <Clock className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-black uppercase tracking-widest text-xs">
              No pending requests found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    User
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    ID Type
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Submitted
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.user_id}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center font-bold text-sm">
                          {user.first_name[0]}
                          {user.last_name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-md border border-blue-100">
                        {user.id_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-medium text-gray-600">
                        {new Date(
                          user.verification_submitted_at,
                        ).toLocaleDateString()}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {new Date(
                          user.verification_submitted_at,
                        ).toLocaleTimeString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedUser && (
        <Modal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          title="Review Identity Documents"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
              <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center text-green-600 shadow-sm">
                <UserIcon size={24} />
              </div>
              <div>
                <p className="text-sm font-black text-gray-900 uppercase tracking-tight">
                  {selectedUser.first_name} {selectedUser.last_name}
                </p>
                <p className="text-xs text-gray-500 font-medium">
                  {selectedUser.email}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  ID Document ({selectedUser.id_type})
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <p className="text-[9px] font-bold text-gray-500 uppercase">
                      Front
                    </p>
                    <a
                      href={selectedUser.id_card_front_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block relative rounded-xl overflow-hidden border border-gray-100 aspect-video group"
                    >
                      <img
                        src={selectedUser.id_card_front_url}
                        alt="ID Front"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ExternalLink className="text-white h-6 w-6" />
                      </div>
                    </a>
                  </div>
                  {selectedUser.id_card_back_url && (
                    <div className="space-y-2">
                      <p className="text-[9px] font-bold text-gray-500 uppercase">
                        Back
                      </p>
                      <a
                        href={selectedUser.id_card_back_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block relative rounded-xl overflow-hidden border border-gray-100 aspect-video group"
                      >
                        <img
                          src={selectedUser.id_card_back_url}
                          alt="ID Back"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ExternalLink className="text-white h-6 w-6" />
                        </div>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Selfie with ID
                </label>
                <a
                  href={selectedUser.selfie_with_id_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative rounded-xl overflow-hidden border border-gray-100 aspect-square md:aspect-video group max-w-sm mx-auto"
                >
                  <img
                    src={selectedUser.selfie_with_id_url}
                    alt="Selfie"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ExternalLink className="text-white h-6 w-6" />
                  </div>
                </a>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => handleAction(selectedUser.user_id, "reject")}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 font-extrabold text-[10px] uppercase tracking-widest rounded-xl hover:bg-red-100 transition-all disabled:opacity-50"
              >
                <XCircle size={14} /> Reject
              </button>
              <button
                onClick={() => handleAction(selectedUser.user_id, "approve")}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white font-extrabold text-[10px] uppercase tracking-widest rounded-xl hover:bg-green-700 shadow-lg shadow-green-100 transition-all disabled:opacity-50"
              >
                <CheckCircle size={14} /> Approve Verification
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
