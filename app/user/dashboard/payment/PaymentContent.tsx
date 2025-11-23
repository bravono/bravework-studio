"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import PaystackPop from "@paystack/inline-js";
import { toast } from "react-toastify";
import {
  CreditCard,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle,
  Wallet,
} from "lucide-react";
import useExchangeRates from "@/hooks/useExchangeRates";
import { convertCurrency } from "@/lib/utils/convertCurrency";

interface Course {
  id: number;
  title: string;
  price: number; // in Kobo
  description: string;
  startDate: string;
  endDate: string;
}

interface CustomOffer {
  id: number;
  description: string;
  amount: number; // in Kobo
  status: string;
  projectDurationDays: number;
}

export default function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { exchangeRates, ratesLoading, ratesError } = useExchangeRates();

  // Helper to format amount using exchange rates (NGN)
  const convertAmount = (amount: number): string => {
    const rate = exchangeRates?.NGN ?? 1; // default to 1 if rates not loaded
    return convertCurrency(amount, rate, "₦");
  };

  const offerId = searchParams.get("offerId");
  const courseId = searchParams.get("courseId");
  const KOBO_PER_NAIRA = 100;

  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<{
    type: "course" | "custom-offer";
    data: Course | CustomOffer;
    orderId: number;
  } | null>(null);

  const [paymentOption, setPaymentOption] = useState<
    "full" | "deposit_50" | "deposit_70"
  >("full");

  // Wallet State
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [useWallet, setUseWallet] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (sessionStatus !== "authenticated") return;

      try {
        // Fetch Wallet Balance
        const walletRes = await fetch("/api/user/wallet");
        const walletData = await walletRes.json();
        setWalletBalance(walletData.balance || 0);

        let url = "";
        if (offerId) {
          url = `/api/user/custom-offers/${offerId}/payment-details`;
        } else if (courseId) {
          url = `/api/courses/${courseId}/payment-details`;
        } else {
          setError("Invalid payment link.");
          setLoading(false);
          return;
        }

        const res = await fetch(url);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to load payment details.");
        }

        const data = await res.json();
        setOrderData(data);
        console.log("Data", data)
      } catch (err: any) {
        console.error("Error loading payment details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (sessionStatus === "authenticated") {
      fetchOrderDetails();
    } else if (sessionStatus === "unauthenticated") {
      if (typeof window !== "undefined") {
        router.push(`/auth/login?callbackUrl=${window.location.href}`);
      }
    }
  }, [sessionStatus, offerId, courseId, router]);

  const paymentDetails = useMemo(() => {
    if (!orderData) return null;

    const baseAmount =
      orderData.type === "course"
        ? (orderData.data as Course).price
        : (orderData.data as CustomOffer).amount;

    let amountToPay = baseAmount;
    let discount = 0;
    let label = "Full Payment";

    if (orderData.type === "custom-offer") {
      switch (paymentOption) {
        case "deposit_50":
          amountToPay = Math.round(baseAmount * 0.5);
          label = "50% Deposit";
          break;
        case "deposit_70":
          amountToPay = Math.round(baseAmount * 0.7 * 0.95); // 5% discount on 70%
          discount = 5;
          label = "70% Deposit (5% Discount)";
          break;
        case "full":
          amountToPay = Math.round(baseAmount * 0.9); // 10% discount
          discount = 10;
          label = "Full Payment (10% Discount)";
          break;
      }
    }

    // Wallet Logic
    let walletDeduction = 0;
    let finalPaystackAmount = amountToPay;

    if (useWallet) {
      walletDeduction = Math.min(walletBalance, amountToPay);
      finalPaystackAmount = amountToPay - walletDeduction;
    }

    return {
      baseAmount,
      amountToPay, // Total expected for this transaction
      discount,
      label,
      walletDeduction,
      finalPaystackAmount,
    };
  }, [orderData, paymentOption, useWallet, walletBalance]);

  const handlePayment = async () => {
    if (!orderData || !paymentDetails || !session?.user?.email) return;

    setProcessingPayment(true);

    try {
      // Scenario 1: Full Payment via Wallet
      if (paymentDetails.finalPaystackAmount === 0) {
        const res = await fetch("/api/user/wallet/pay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: orderData.orderId,
            amountKobo: paymentDetails.walletDeduction,
            serviceType: orderData.type,
            productId: orderData.data.id,
            orderTitle:
              orderData.type === "course"
                ? (orderData.data as Course).title
                : (orderData.data as CustomOffer).description,
            projectDurationDays:
              orderData.type === "custom-offer"
                ? (orderData.data as CustomOffer).projectDurationDays
                : null,
            totalExpectedAmount: paymentDetails.amountToPay,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Wallet payment failed");

        toast.success("Payment successful!");
        router.push("/user/dashboard?tab=orders");
        return;
      }

      // Scenario 2: Paystack (Partial or Full)
      const paystack = new PaystackPop();
      paystack.newTransaction({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY as string,
        email: session.user.email,
        amount: paymentDetails.finalPaystackAmount, // Amount in Kobo
        currency: "NGN",
        ref: `BW_${Math.floor(Math.random() * 1000000000 + 1)}`,
        metadata: {
          service: orderData.type,
          orderId: orderData.orderId,
          productId: orderData.data.id,
          customer_name: session.user.name,
          payment_option:
            orderData.type === "custom-offer"
              ? paymentOption === "deposit_70"
              ? "deposit_70_discount"
              : paymentOption === "full"
              ? "full_100_discount"
              : paymentOption
              : "full",
          payment_percentage:
            orderData.type === "custom-offer"
              ? paymentOption === "deposit_50"
              ? 0.5
              : paymentOption === "deposit_70"
              ? 0.7
              : 1.0
              : 1.0,
          discount_applied: paymentDetails.discount.toString(),
          original_amount_kobo: paymentDetails.baseAmount.toString(),
          wallet_usage_kobo: paymentDetails.walletDeduction.toString(),
        },
        onSuccess: async (transaction: any) => {
          try {
            const verifyRes = await fetch("/api/paystack-verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(transaction),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              toast.success("Payment successful!");
              router.push("/user/dashboard?tab=orders");
            } else {
              toast.error(
                "Payment verification failed: " + verifyData.message
              );
            }
          } catch (err) {
            console.error("Verification error:", err);
            toast.error("Error verifying payment.");
          }
        },
        onCancel: () => {
          toast.info("Payment cancelled.");
          setProcessingPayment(false);
        },
      });
    } catch (err: any) {
      console.error("Payment initialization error:", err);
      toast.error(err.message || "Failed to initialize payment.");
      setProcessingPayment(false);
    }
  };

  if (loading || ratesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
        <p className="text-gray-600 mb-6">{error || "Order not found."}</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-green-600 px-8 py-6 text-white">
            <h1 className="text-2xl font-bold">Secure Checkout</h1>
            <p className="opacity-90 mt-1">Complete your payment securely</p>
          </div>

          <div className="p-8">
            {/* Order Summary */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Order Summary
              </h2>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {orderData.type === "course"
                        ? (orderData.data as Course).title
                        : "Custom Project Offer"}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">
                      {orderData.type === "course"
                        ? "Course Enrollment"
                        : (orderData.data as CustomOffer).description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-xl">
                      {convertAmount(
                        orderData.type === "course"
                          ? (orderData.data as Course).price / KOBO_PER_NAIRA
                          : (orderData.data as CustomOffer).amount / KOBO_PER_NAIRA
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Options (Only for Custom Offers) */}
            {orderData.type === "custom-offer" && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Payment Plan
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      id: "deposit_50",
                      label: "50% Deposit",
                      desc: "Pay half now, half later",
                    },
                    {
                      id: "deposit_70",
                      label: "70% Deposit",
                      desc: "Get 5% discount",
                    },
                    {
                      id: "full",
                      label: "Full Payment",
                      desc: "Get 10% discount",
                    },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setPaymentOption(opt.id as any)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        paymentOption === opt.id
                          ? "border-green-600 bg-green-50"
                          : "border-gray-200 hover:border-green-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`font-bold ${
                            paymentOption === opt.id
                              ? "text-green-700"
                              : "text-gray-700"
                          }`}
                        >
                          {opt.label}
                        </span>
                        {paymentOption === opt.id && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Wallet Option */}
            {walletBalance > 0 && (
              <div className="mb-8">
                 <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Wallet
                </h2>
                <div className={`p-4 rounded-xl border transition-all ${useWallet ? 'border-green-600 bg-green-50' : 'border-gray-200'}`}>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useWallet}
                      onChange={(e) => setUseWallet(e.target.checked)}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500 border-gray-300"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-900">Use Wallet Balance</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Available: ₦{(walletBalance / 100).toLocaleString()}
                      </p>
                    </div>
                    {useWallet && (
                      <span className="font-bold text-green-700">
                        -₦{(paymentDetails?.walletDeduction! / 100).toLocaleString()}
                      </span>
                    )}
                  </label>
                </div>
              </div>
            )}

            {/* Total & Pay Button */}
            <div className="border-t border-gray-100 pt-8">
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-600">Total to Pay</span>
                <div className="text-right">
                  <span className="text-3xl font-bold text-gray-900">
                    {paymentDetails?.finalPaystackAmount === 0 
                      ? "₦0.00" 
                      : convertAmount(paymentDetails?.finalPaystackAmount / KOBO_PER_NAIRA || 0)}
                  </span>
                  {paymentDetails?.discount! > 0 && (
                    <p className="text-sm text-green-600 font-medium mt-1">
                      {paymentDetails?.discount}% discount applied
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={processingPayment}
                className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processingPayment ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {paymentDetails?.finalPaystackAmount === 0 ? (
                      <>
                        <Wallet className="w-5 h-5" />
                        Pay with Wallet
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Pay Now
                      </>
                    )}
                  </>
                )}
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-gray-400 text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>Secured by Paystack</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
