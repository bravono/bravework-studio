"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Copy, Check, Users, Wallet, TrendingUp } from "lucide-react";
import { toast } from "react-toastify";

interface Referral {
  name: string;
  date_joined: string;
  commission_earned: number;
}

export default function UserReferralsSection() {
  const { data: session } = useSession();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(0);
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

        // Fetch Wallet Balance
        const walletRes = await fetch("/api/user/wallet");
        const walletData = await walletRes.json();
        setWalletBalance(walletData.balance || 0);

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

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading referral data...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Refer & Earn</h1>
        <p className="text-green-100 text-lg max-w-2xl">
          Share your unique link with friends. You'll earn 10% commission on their first purchase, and they get a discount too!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Referrals</p>
              <h3 className="text-2xl font-bold text-gray-800">{referrals.length}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Earnings</p>
              <h3 className="text-2xl font-bold text-gray-800">
                ₦{(referrals.reduce((acc, curr) => acc + curr.commission_earned, 0) / 100).toLocaleString()}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Wallet Balance</p>
              <h3 className="text-2xl font-bold text-gray-800">
                ₦{(walletBalance / 100).toLocaleString()}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Link Section */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Your Referral Link</h2>
        
        {!referralCode ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">You haven't generated a referral code yet.</p>
            <button
              onClick={generateCode}
              disabled={generating}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {generating ? "Generating..." : "Generate Referral Code"}
            </button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Share this link
              </label>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <input
                  type="text"
                  readOnly
                  value={referralLink}
                  className="bg-transparent border-none focus:ring-0 w-full text-gray-600 font-medium"
                />
                <button
                  onClick={() => copyToClipboard(referralLink)}
                  className="p-2 hover:bg-gray-200 rounded-md transition-colors text-gray-600"
                >
                  {copied ? <Check size={20} className="text-green-600" /> : <Copy size={20} />}
                </button>
              </div>
            </div>
            <div className="w-full md:w-auto">
               <label className="block text-sm font-medium text-gray-700 mb-2">
                Referral Code
              </label>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 font-mono font-bold text-center min-w-[150px]">
                {referralCode}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Referrals List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Your Referrals</h2>
        </div>
        
        {referrals.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Users size={48} className="mx-auto mb-4 text-gray-300" />
            <p>You haven't referred anyone yet. Share your link to get started!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                <tr>
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Date Joined</th>
                  <th className="px-6 py-4 font-semibold">Commission Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {referrals.map((ref, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{ref.name}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(ref.date_joined).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-green-600">
                      {ref.commission_earned > 0 ? `₦${(ref.commission_earned / 100).toLocaleString()}` : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
