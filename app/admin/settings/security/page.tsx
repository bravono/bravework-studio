"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { Loader2, ShieldCheck, ShieldAlert, Copy } from "lucide-react";
import Image from "next/image";

export default function SecuritySettings() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false); // Ideally fetch from API on load
  const [step, setStep] = useState<"initial" | "setup" | "verify">("initial");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  // Need to know if MFA is already enabled.
  // For now, we assume false or check via a new API endpoint if available.
  // Ideally, session user object should have this info, but it might be stale.
  // We can add a simple GET endpoint or just rely on session if we update it.

  // Checking session for a flag would be best if we added it to the session type.
  // In auth-options.ts we added user.two_factor_enabled to the session.
  // Let's check session.user.two_factor_enabled (requires type extension update on client side if not strictly typed there)

  useEffect(() => {
    // @ts-ignore
    if (session?.user?.two_factor_enabled) {
      setMfaEnabled(true);
    }
  }, [session]);

  const startSetup = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/mfa/setup", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setQrCodeUrl(data.qrCodeUrl);
        setSecret(data.secret);
        setStep("setup");
      } else {
        toast.error(data.error || "Failed to start setup");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const verifyAndEnable = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/mfa/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: verificationCode }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("MFA Enabled Successfully");
        setMfaEnabled(true);
        setStep("initial");
        // Force session update? NextAuth specific
      } else {
        toast.error(data.error || "Verification failed");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const disableMfa = async () => {
    if (!confirm("Are you sure you want to disable MFA?")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/mfa/disable", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success("MFA Disabled");
        setMfaEnabled(false);
      } else {
        toast.error(data.error || "Failed to disable MFA");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    toast.success("Secret copied to clipboard");
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <a
          href="/admin/dashboard"
          className="text-gray-500 hover:text-gray-700 flex items-center"
        >
          &larr; Back to Dashboard
        </a>
      </div>
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        Security Settings
      </h1>

      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div
              className={`p-3 rounded-full ${mfaEnabled ? "bg-green-100" : "bg-gray-100"}`}
            >
              {mfaEnabled ? (
                <ShieldCheck className="w-8 h-8 text-green-600" />
              ) : (
                <ShieldAlert className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Multi-Factor Authentication (MFA)
              </h2>
              <p className="text-gray-500 text-sm">
                Add an extra layer of security to your account by using a unique
                code from an app like Google Authenticator.
              </p>
            </div>
          </div>

          <div>
            {mfaEnabled ? (
              <button
                onClick={disableMfa}
                disabled={loading}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
              >
                {loading ? "Processing..." : "Disable MFA"}
              </button>
            ) : step === "initial" ? (
              <button
                onClick={startSetup}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                {loading ? "Processing..." : "Enable MFA"}
              </button>
            ) : (
              <button
                onClick={() => setStep("initial")}
                className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {step === "setup" && (
          <div className="mt-8 border-t pt-8 animate-in fade-in slide-in-from-top-4 duration-300">
            <h3 className="text-lg font-semibold mb-4">
              Setup Authenticator App
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <p className="text-gray-600">
                  1. Download an authenticator app like Google Authenticator or
                  Authy.
                </p>
                <p className="text-gray-600">
                  2. Scan the QR code or enter the setup key manually.
                </p>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">
                    Setup Key
                  </p>
                  <div className="flex items-center justify-between">
                    <code className="text-sm font-mono text-gray-800">
                      {secret}
                    </code>
                    <button
                      onClick={copySecret}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center space-y-4">
                {qrCodeUrl && (
                  <div className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <Image
                      src={qrCodeUrl}
                      alt="QR Code"
                      width={200}
                      height={200}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8">
              <p className="text-gray-600 mb-2">
                3. Enter the 6-digit code from your app to verify configuration.
              </p>
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) =>
                    setVerificationCode(
                      e.target.value.replace(/\D/g, "").slice(0, 6),
                    )
                  }
                  placeholder="000 000"
                  className="w-48 px-4 py-2 text-center text-lg tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
                <button
                  onClick={verifyAndEnable}
                  disabled={loading || verificationCode.length !== 6}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Verifying..." : "Verify & Enable"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
