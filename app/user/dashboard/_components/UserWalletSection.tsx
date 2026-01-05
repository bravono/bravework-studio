"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Wallet,
  TrendingUp,
  Monitor,
  ChevronRight,
  Info,
  ArrowUpRight,
  History,
  CreditCard,
} from "lucide-react";
import { toast } from "react-toastify";
import Loader from "@/app/components/Loader";
import { motion } from "framer-motion";

interface WalletData {
  balance: number;
  breakdown: {
    referral: number;
    rental: number;
    used: number;
  };
}

export default function UserWalletSection() {
  const { data: session } = useSession();
  const [walletData, setWalletData] = useState<WalletData>({
    balance: 0,
    breakdown: { referral: 0, rental: 0, used: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await fetch("/api/user/wallet");
        const data = await res.json();
        setWalletData(data);
      } catch (error) {
        console.error("Error fetching wallet data:", error);
        toast.error("Failed to load wallet data.");
      } finally {
        setLoading(false);
      }
    };

    if (session) fetchWallet();
  }, [session]);

  const totalEarnings =
    walletData.breakdown.referral + walletData.breakdown.rental;
  const referralPercent =
    totalEarnings > 0
      ? (walletData.breakdown.referral / totalEarnings) * 100
      : 0;
  const rentalPercent =
    totalEarnings > 0 ? (walletData.breakdown.rental / totalEarnings) * 100 : 0;

  return loading ? (
    <Loader user={"user"} />
  ) : (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">
            Financial Hub
          </h1>
          <p className="text-gray-500 font-medium">
            Manage your earnings, balance, and payouts.
          </p>
        </div>
        <button className="px-8 py-4 bg-green-600 text-white rounded-2xl font-black hover:bg-green-700 transition-all shadow-lg shadow-green-600/30 active:scale-95">
          Request Payout
        </button>
      </div>

      {/* Main Balance Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl p-8 md:p-12 text-white shadow-2xl">
        <div className="relative z-10">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">
            Total Withdrawable Balance
          </p>
          <h2 className="text-5xl md:text-6xl font-black flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-bold text-green-500">
              ₦
            </span>
            {(walletData.balance / 100).toLocaleString()}
          </h2>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 border-t border-white/10">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                Referral Income
              </p>
              <p className="text-xl font-black">
                ₦{(walletData.breakdown.referral / 100).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                Rental Income
              </p>
              <p className="text-xl font-black">
                ₦{(walletData.breakdown.rental / 100).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                Total Used
              </p>
              <p className="text-xl font-black text-red-400">
                ₦{(walletData.breakdown.used / 100).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-green-500/10 rounded-full blur-3xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Earnings Breakdown */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tight">
              Earnings Distribution
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <TrendingUp size={16} />
                    </div>
                    <span className="font-bold text-gray-700">
                      Referral Commissions
                    </span>
                  </div>
                  <span className="text-sm font-black text-blue-600">
                    {referralPercent.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${referralPercent}%` }}
                    className="bg-blue-500 h-full"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                      <Monitor size={16} />
                    </div>
                    <span className="font-bold text-gray-700">
                      Hardware Rental Earnings
                    </span>
                  </div>
                  <span className="text-sm font-black text-purple-600">
                    {rentalPercent.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${rentalPercent}%` }}
                    className="bg-purple-500 h-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payout History Placeholder */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                  Recent Activity
                </h2>
                <p className="text-sm text-gray-500 font-medium">
                  History of your earnings and payouts.
                </p>
              </div>
              <History className="text-gray-300" />
            </div>
            <div className="p-20 text-center">
              <History size={48} className="mx-auto mb-4 text-gray-200" />
              <p className="text-gray-400 font-bold">
                No recent transactions yet.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 rounded-3xl text-white shadow-lg">
            <CreditCard size={32} className="mb-4 opacity-50" />
            <h3 className="text-lg font-black uppercase mb-2">Bank Details</h3>
            <p className="text-sm text-blue-100 mb-6">
              Your earnings will be paid to the bank account linked to your
              profile.
            </p>
            <button className="w-full py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl font-bold transition-all">
              Update Bank Account
            </button>
          </div>

          <div className="bg-amber-50 border border-amber-100 p-8 rounded-3xl">
            <div className="flex items-center gap-2 text-amber-600 mb-4">
              <Info size={20} />
              <h3 className="font-black uppercase tracking-tight">
                Payout Rules
              </h3>
            </div>
            <ul className="space-y-4">
              <li className="text-xs text-amber-800 font-medium leading-relaxed">
                • Minimum payout request: ₦5,000
              </li>
              <li className="text-xs text-amber-800 font-medium leading-relaxed">
                • Processing time: 24-48 business hours
              </li>
              <li className="text-xs text-amber-800 font-medium leading-relaxed">
                • Flat withdrawal fee: ₦100
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
