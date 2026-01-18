"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Copy,
  Check,
  Users,
  Gift,
  ChevronRight,
  Share2,
  Twitter,
  MessageCircle,
  Trophy,
} from "lucide-react";
import { toast } from "react-toastify";
import Loader from "@/app/components/Loader";
import { motion } from "framer-motion";

interface Referral {
  name: string;
  date_joined: string;
  commission_earned: number;
}

export default function UserReferralsSection() {
  const { data: session } = useSession();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Referral Code
        const codeRes = await fetch("/api/user/referral-code");
        const codeData = await codeRes.json();
        if (codeData.referralCode) setReferralCode(codeData.referralCode);

        // Fetch Referrals
        const referralsRes = await fetch("/api/user/referrals");
        const referralsData = await referralsRes.json();
        if (Array.isArray(referralsData)) setReferrals(referralsData);
      } catch (error) {
        console.error("Error fetching referral data:", error);
        toast.error("Failed to load referral data.");
      } finally {
        setLoading(false);
      }
    };

    if (session) fetchData();
  }, [session]);

  const generateCode = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/user/referral-code", { method: "POST" });
      const data = await res.json();
      if (data.referralCode) {
        setReferralCode(data.referralCode);
        toast.success("Referral code generated!");
      } else {
        toast.error("Failed to generate code.");
      }
    } catch (error) {
      toast.error("Error generating code.");
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const referralLink = referralCode
    ? `${window.location.origin}/auth/signup?ref=${referralCode}`
    : "";

  return loading ? (
    <Loader user={"user"} />
  ) : (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Brand Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-700 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6">
              <Trophy size={14} /> Partner Program
            </span>
            <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
              Grow with us. <br />
              <span className="text-indigo-200">Earn together.</span>
            </h1>
            <p className="text-indigo-50/80 text-lg font-medium leading-relaxed">
              Invite your friends to Bravework Studio. You earn passive income
              for every successful transaction they make on our platform.
            </p>
          </div>
          <div className="hidden lg:block">
            <Users size={180} className="text-white/10" />
          </div>
        </div>
        <div className="absolute top-0 left-0 -ml-20 -mt-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Share Link Section */}
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-black text-gray-900 mb-8 uppercase tracking-tight">
              Your Custom Invitation
            </h2>

            {!referralCode ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <Gift size={48} className="mx-auto mb-4 text-purple-400" />
                <p className="text-gray-600 font-bold mb-6">
                  Start your journey as a Bravework Partner today.
                </p>
                <button
                  onClick={generateCode}
                  disabled={generating}
                  className="px-8 py-4 bg-purple-600 text-white rounded-2xl font-black hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/30 disabled:opacity-50"
                >
                  {generating ? "Activating..." : "Generate My Partner Link"}
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                    Copy Link
                  </label>
                  <div className="flex items-center gap-2 p-5 bg-gray-50 rounded-2xl border-2 border-gray-100 focus-within:border-purple-200 transition-all">
                    <input
                      type="text"
                      readOnly
                      value={referralLink}
                      className="bg-transparent border-none focus:ring-0 w-full text-gray-700 font-bold selection:bg-purple-100"
                    />
                    <button
                      onClick={() => copyToClipboard(referralLink)}
                      className="p-3 bg-white hover:bg-purple-50 rounded-xl transition-all border border-gray-100 shadow-sm active:scale-90"
                    >
                      {copied ? (
                        <Check size={20} className="text-green-600" />
                      ) : (
                        <Copy size={20} className="text-purple-600" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button className="flex items-center justify-center gap-3 p-4 bg-[#1DA1F2] text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg shadow-[#1DA1F2]/20">
                    <Twitter size={20} /> Share on X
                  </button>
                  <button className="flex items-center justify-center gap-3 p-4 bg-[#25D366] text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg shadow-[#25D366]/20">
                    <MessageCircle size={20} /> Send via WhatsApp
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Network Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                  Your Network
                </h2>
                <p className="text-sm text-gray-500 font-medium">
                  People who joined via your link.
                </p>
              </div>
            </div>

            {referrals.length === 0 ? (
              <div className="p-20 text-center text-gray-400">
                <Users size={64} className="mx-auto mb-4 opacity-10" />
                <p className="font-bold">
                  No partners have joined your network yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-[10px] text-gray-400 font-black uppercase tracking-widest">
                    <tr>
                      <th className="px-8 py-5">User</th>
                      <th className="px-8 py-5">Joined At</th>
                      <th className="px-8 py-5 text-right">
                        Commission History
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {referrals.map((ref, index) => (
                      <tr
                        key={index}
                        className="hover:bg-purple-50/30 transition-colors group"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                              {ref.name.charAt(0)}
                            </div>
                            <span className="font-bold text-gray-900">
                              {ref.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-sm text-gray-500 font-medium">
                          {new Date(ref.date_joined).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-5 text-right font-black text-green-600">
                          {ref.commission_earned > 0
                            ? `₦${(
                                ref.commission_earned / 100
                              ).toLocaleString()}`
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-black text-gray-900 mb-6 uppercase tracking-tight">
              Earning Rules
            </h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                  10%
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Course Sales</h4>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">
                    Earn 10% on your friend's first course purchase.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                  5%
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">
                    Rental Services
                  </h4>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">
                    Earn 5% on every hardware rental transaction.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 p-8 rounded-3xl border border-indigo-100">
            <h3 className="text-lg font-black text-indigo-900 mb-4 flex items-center gap-2">
              <Share2 size={20} /> Spread the word
            </h3>
            <p className="text-sm text-indigo-700 font-medium leading-relaxed mb-6">
              Invite your friends and colleagues to the best edutainment
              platform in Africa and grow your income.
            </p>
            <div className="p-4 bg-white rounded-2xl flex items-center justify-between">
              <span className="text-xs font-black text-gray-400 flex items-center gap-2">
                <ChevronRight size={14} className="text-indigo-400" /> Active
                Partners
              </span>
              <span className="text-lg font-black text-indigo-600">
                {referrals.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
