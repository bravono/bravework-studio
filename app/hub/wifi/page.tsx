"use client";

import React, { useState, useEffect } from "react";
import {
  Wifi,
  Sparkles,
  Phone,
  Gift,
  Coffee,
  GraduationCap,
  Play,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ChevronRight,
  Zap,
} from "lucide-react";

export default function HubWifiPortalPage() {
  const [activeTab, setActiveTab] = useState<"claim" | "redeem" | "menu" | "academy">("claim");
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [segment, setSegment] = useState("ACADEMY_STUDENT");
  const [marketingConsent, setMarketingConsent] = useState(true);
  const [voucherCode, setVoucherCode] = useState("");
  const [macAddress, setMacAddress] = useState("");

  // Loading & session states
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeSession, setActiveSession] = useState<{
    remainingMinutes: number;
    expiresAt: string;
    voucherCode: string;
    rateLimit: string;
  } | null>(null);

  // Auto-generate or read pseudo MAC for browser
  useEffect(() => {
    let storedMac = localStorage.getItem("bws_hub_mac");
    if (!storedMac) {
      storedMac = "BW:" + Array.from({ length: 5 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, "0")).join(":");
      localStorage.setItem("bws_hub_mac", storedMac);
    }
    setMacAddress(storedMac);
    checkSessionStatus(storedMac);
  }, []);

  const checkSessionStatus = async (mac: string) => {
    try {
      const res = await fetch(`/api/hub/wifi?mac=${encodeURIComponent(mac)}`);
      const data = await res.json();
      if (data.active && data.session) {
        setActiveSession(data.session);
      }
    } catch {
      // Ignored
    }
  };

  const handleClaimWebLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setMessage({ type: "error", text: "Please enter your name and email address." });
      return;
    }
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/hub/wifi/claim-web-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          interestSegment: segment,
          macAddress,
          marketingConsent,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: "success", text: data.message });
        setStep(2);
        checkSessionStatus(macAddress);
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to claim web lead pass." });
    } finally {
      setLoading(false);
    }
  };

  const handleClaimContactBonus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setMessage({ type: "error", text: "Please provide a valid phone number." });
      return;
    }
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/hub/wifi/claim-contact-bonus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          fullName,
          macAddress,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: "success", text: data.message });
        setStep(3);
        checkSessionStatus(macAddress);
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to claim contact bonus." });
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCode.trim()) {
      setMessage({ type: "error", text: "Please enter a valid voucher code." });
      return;
    }
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/hub/wifi/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: voucherCode,
          macAddress,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: "success", text: data.message });
        setVoucherCode("");
        checkSessionStatus(macAddress);
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to redeem voucher." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-emerald-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Wifi className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight flex items-center gap-2">
                Bravework Hub <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-normal">Starlink Wi-Fi</span>
              </h1>
              <p className="text-xs text-slate-400">High-Speed Physical Lounge & Creative Hub</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-full">
            <Zap className="w-3.5 h-3.5" />
            <span>150+ Mbps Active</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Active Session Card if present */}
        {activeSession && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border border-emerald-500/40 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-lg">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Internet Access Active</span>
                  </div>
                  <h2 className="text-2xl font-black text-white mt-0.5">
                    {activeSession.remainingMinutes} Minutes Remaining
                  </h2>
                  <p className="text-xs text-slate-400">
                    Voucher Code: <span className="font-mono text-emerald-300 font-semibold">{activeSession.voucherCode}</span> • Speed: {activeSession.rateLimit}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab("menu")}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-sm transition shadow flex items-center justify-center gap-2"
              >
                <Coffee className="w-4 h-4" />
                <span>Extend with Snack</span>
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveTab("claim")}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition flex items-center justify-center gap-2 ${
              activeTab === "claim" ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>Get Free Wi-Fi</span>
          </button>
          <button
            onClick={() => setActiveTab("redeem")}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition flex items-center justify-center gap-2 ${
              activeTab === "redeem" ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Enter Voucher</span>
          </button>
          <button
            onClick={() => setActiveTab("academy")}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition flex items-center justify-center gap-2 ${
              activeTab === "academy" ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span className="hidden sm:inline">Free Video Zone</span>
            <span className="sm:hidden">Videos</span>
          </button>
          <button
            onClick={() => setActiveTab("menu")}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition flex items-center justify-center gap-2 ${
              activeTab === "menu" ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            <Coffee className="w-4 h-4" />
            <span>Lounge Bar</span>
          </button>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`p-4 rounded-xl text-sm flex items-start gap-3 border ${
              message.type === "success"
                ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-200"
                : "bg-red-950/60 border-red-500/40 text-red-200"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            )}
            <p className="flex-1 leading-relaxed">{message.text}</p>
          </div>
        )}

        {/* TAB 1: CLAIM FREE PASS (30m + 30m = 60m) */}
        {activeTab === "claim" && (
          <div className="space-y-6">
            <div className="text-center max-w-lg mx-auto space-y-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Welcome to Bravework Hub
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Get Up To 60 Minutes Free Wi-Fi</h2>
              <p className="text-sm text-slate-400">
                Claim 30 minutes instantly on the web, and sync your contact for an extra 30 minutes of high-speed Starlink internet.
              </p>
              <div className="pt-2 flex justify-center">
                <a
                  href="/download/bravework.apk"
                  download
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-emerald-400 font-semibold transition shadow"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Download Android App (.APK)</span>
                </a>
              </div>
            </div>

            {/* Step Indicators */}
            <div className="grid grid-cols-2 gap-4">
              <div
                className={`p-4 rounded-xl border transition ${
                  step >= 1
                    ? "bg-slate-900 border-emerald-500/40 text-white"
                    : "bg-slate-900/40 border-slate-800 text-slate-500"
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase">
                  <span>Step 1</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">+30 Mins</span>
                </div>
                <h3 className="font-bold text-base mt-1">Name & Email Signup</h3>
                <p className="text-xs text-slate-400 mt-1">Instant 30-min web pass</p>
              </div>

              <div
                className={`p-4 rounded-xl border transition ${
                  step >= 2
                    ? "bg-slate-900 border-emerald-500/40 text-white"
                    : "bg-slate-900/40 border-slate-800 text-slate-500"
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase">
                  <span>Step 2</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">+30 Mins</span>
                </div>
                <h3 className="font-bold text-base mt-1">Contact Verification</h3>
                <p className="text-xs text-slate-400 mt-1">Double your time to 60 mins</p>
              </div>
            </div>

            {/* Step 1 Form */}
            {step === 1 && (
              <form onSubmit={handleClaimWebLead} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Emmanuel Okon"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. emmanuel@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">What brings you to Bravework Hub?</label>
                  <select
                    value={segment}
                    onChange={(e) => setSegment(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white text-sm"
                  >
                    <option value="ACADEMY_STUDENT">🎓 Tech Academy & Mentorship Student</option>
                    <option value="SNACK_DISTRIBUTOR">🍿 Snack & Small Chops Distributorship / Reseller</option>
                    <option value="INVESTOR_CLIENT">💼 Creative Studio Client & Real Estate Investor</option>
                    <option value="GENERAL">☕ Casual Lounge Guest & Remote Worker</option>
                  </select>
                </div>

                <div className="flex items-start gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={marketingConsent}
                    onChange={(e) => setMarketingConsent(e.target.checked)}
                    className="mt-1 accent-emerald-500 rounded"
                  />
                  <label htmlFor="consent" className="text-xs text-slate-400 leading-relaxed cursor-pointer">
                    I agree to receive community mentorship tracks and updates (NDPA Compliant. Unsubscribe anytime).
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition shadow-lg flex items-center justify-center gap-2 mt-4"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{loading ? "Activating 30-Min Web Pass..." : "Claim 30 Minutes Free Wi-Fi"}</span>
                </button>
              </form>
            )}

            {/* Step 2 Form */}
            {step === 2 && (
              <form onSubmit={handleClaimContactBonus} className="p-6 rounded-2xl bg-slate-900 border border-emerald-500/40 space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 text-xs">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                  <span>Step 1 complete! Enter your WhatsApp/phone number below to claim your <strong>extra 30 minutes</strong> (60 mins total).</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">WhatsApp / Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 08012345678"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition shadow-lg flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>{loading ? "Adding Bonus..." : "Claim Extra +30 Mins (Total 60 Mins)"}</span>
                </button>
              </form>
            )}

            {/* Step 3 Complete */}
            {step === 3 && (
              <div className="p-8 rounded-2xl bg-slate-900 border border-emerald-500/40 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Full 60 Minutes Free Wi-Fi Activated!</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  You are now fully connected to the Starlink high-speed physical lounge network.
                </p>
                <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => setActiveTab("academy")}
                    className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition flex items-center justify-center gap-2"
                  >
                    <GraduationCap className="w-4 h-4 text-emerald-400" />
                    <span>Watch Free Academy Videos</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("menu")}
                    className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition flex items-center justify-center gap-2"
                  >
                    <Coffee className="w-4 h-4" />
                    <span>Order Snacks & Refreshments</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: REDEEM CODE */}
        {activeTab === "redeem" && (
          <div className="max-w-md mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">Redeem Wi-Fi Voucher</h2>
              <p className="text-xs text-slate-400">
                Enter the code printed on your food receipt or provided by the front desk.
              </p>
            </div>

            <form onSubmit={handleRedeemVoucher} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Voucher Code</label>
                <input
                  type="text"
                  required
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  placeholder="e.g. FOOD-98A1B2 or APP30-4C19"
                  className="w-full font-mono uppercase text-center text-lg tracking-widest px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white font-bold"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition shadow flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span>{loading ? "Authorizing Device..." : "Authorize High-Speed Session"}</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: ZERO-RATED FREE ACADEMY YOUTUBE ZONE */}
        {activeTab === "academy" && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/80 to-slate-900 border border-blue-500/30 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
                <GraduationCap className="w-4 h-4" />
                <span>Zero-Rated Learning Portal</span>
              </div>
              <h2 className="text-2xl font-black text-white">Free Video Streaming Zone</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Students and learners connected to Bravework Hub can watch all educational course videos on YouTube completely free without consuming paid Wi-Fi time or needing an active voucher token!
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Video Card 1 */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden group">
                <div className="relative aspect-video bg-slate-950 flex items-center justify-center">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"
                    title="Bravework Academy Lesson"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="text-emerald-400 font-semibold">Web Development Track</span>
                    <span>Free Stream</span>
                  </div>
                  <h3 className="font-bold text-base text-white">Introduction to Full-Stack Engineering & TypeScript</h3>
                  <p className="text-xs text-slate-400">Foundational coding session for hub academy students.</p>
                </div>
              </div>

              {/* Video Card 2 */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden group">
                <div className="relative aspect-video bg-slate-950 flex items-center justify-center">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube-nocookie.com/embed/L_LUpnjgPso"
                    title="Bravework 3D Animation Workshop"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="text-emerald-400 font-semibold">Creative 3D Design</span>
                    <span>Free Stream</span>
                  </div>
                  <h3 className="font-bold text-base text-white">3D Modeling & Animation with Blender</h3>
                  <p className="text-xs text-slate-400">Hands-on studio masterclass for creative artists.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: LOUNGE FOOD & BEVERAGE MENU */}
        {activeTab === "menu" && (
          <div className="space-y-6">
            <div className="text-center max-w-lg mx-auto space-y-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                Physical Lounge Menu
              </span>
              <h2 className="text-2xl font-bold text-white">Refreshments & Bonus Wi-Fi</h2>
              <p className="text-xs text-slate-400">
                Every snack and drink purchase grants instant high-speed Starlink Wi-Fi session tokens!
              </p>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { name: "Gourmet Salted Peanuts", price: "₦500", wifi: "+30 Mins", desc: "Crunchy roasted peanuts in pouch" },
                { name: "Chilled Natural Water", price: "₦300", wifi: "+30 Mins", desc: "75cl pure bottled spring water" },
                { name: "Crisp Small Chops Platter", price: "₦2,000", wifi: "+1 Hour", desc: "Samosas, spring rolls, puff puff" },
                { name: "Chilled Soda / Malt", price: "₦800", wifi: "+30 Mins", desc: "Assorted cold beverages" },
                { name: "Spicy Pepper Soup", price: "₦3,500", wifi: "+2 Hours", desc: "Hot catfish or goat meat soup" },
                { name: "Special Jollof Rice Combo", price: "₦5,000", wifi: "+3 Hours", desc: "Party jollof with grilled chicken" },
              ].map((item, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300">
                        {item.wifi}
                      </span>
                      <span className="font-bold text-white text-base">{item.price}</span>
                    </div>
                    <h3 className="font-bold text-base text-white mt-3">{item.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span>Order at counter</span>
                    <ChevronRight className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
