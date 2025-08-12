// app/dashboard/payment/page.tsx
"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { fetchExchangeRates } from "@/lib/utils/fetchExchangeRate";
import { getCurrencySymbol } from "@/lib/utils/getCurrencySymbol";
import { convertCurrency } from "@/lib/utils/convertCurrency";
import { ExchangeRates } from "@/app/types/app";
import { cn } from "@/lib/utils/cn"; // Assuming this utility exists

// Define the amount of kobo in a Naira
const KOBO_PER_NAIRA = 100;

// Create a separate component that uses useSearchParams
function PaymentContent() {
  const searchParams = useSearchParams();
  const offerId = searchParams.get("offerId");
  const { data: session } = useSession();

  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

  const [offerAmountInKobo, setOfferAmountInKobo] = useState<number | null>(
    null
  );
  const [serviceName, setServiceName] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState("NGN");
  const [convertedAmountToPay, setConvertedAmountToPay] = useState<
    number | null
  >(null);
  const [convertedOriginalAmount, setConvertedOriginalAmount] = useState<
    number | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [PaystackPop, setPaystackPop] = useState<any>(null);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(
    null
  );
  const [ratesLoading, setRatesLoading] = useState(true);
  const [ratesError, setRatesError] = useState<string | null>(null);
  const [offerLoading, setOfferLoading] = useState(true);
  const [offerError, setOfferError] = useState<string | null>(null);

  type PaymentOption =
    | "full_100_discount"
    | "deposit_70_discount"
    | "deposit_50";
  const [paymentOption, setPaymentOption] =
    useState<PaymentOption>("full_100_discount");

  const calculateFinalAmountKobo = useCallback(() => {
    if (offerAmountInKobo === null) return null;

    let calculatedAmount = offerAmountInKobo;
    let discountPercentage = 0;
    let paymentPercentage = 100;

    switch (paymentOption) {
      case "deposit_50":
        calculatedAmount = offerAmountInKobo * 0.5;
        paymentPercentage = 50;
        break;
      case "deposit_70_discount":
        calculatedAmount = offerAmountInKobo * 0.7;
        discountPercentage = 5;
        calculatedAmount *= 1 - discountPercentage / 100;
        paymentPercentage = 70;
        break;
      case "full_100_discount":
        calculatedAmount = offerAmountInKobo;
        discountPercentage = 10;
        calculatedAmount *= 1 - discountPercentage / 100;
        paymentPercentage = 100;
        break;
    }

    return {
      amount: Math.round(calculatedAmount),
      calculatedAmount,
      discountPercentage,
      paymentPercentage,
    };
  }, [offerAmountInKobo, paymentOption]);

  // Effect to dynamically import PaystackPop only on the client
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("@paystack/inline-js")
        .then((module) => setPaystackPop(() => module.default))
        .catch((error) => {
          console.error("Failed to load PaystackPop:", error);
          toast.error("Failed to load payment gateway. Please try again.");
        });
    }
  }, []);

  // Effect to fetch offer details securely from backend
  useEffect(() => {
    const fetchOfferDetails = async () => {
      if (!offerId || !session?.user?.id) {
        setOfferError("Offer ID or user session missing.");
        setOfferLoading(false);
        return;
      }
      setOfferLoading(true);
      setOfferError(null);
      try {
        const res = await fetch(`/api/user/custom-offers/${offerId}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(
            errorData.error || "Failed to fetch offer details securely."
          );
        }
        const data = await res.json();
        setOfferAmountInKobo(data.offerAmount);
        setServiceName(data.categoryName);
        setOrderId(data.orderId);
      } catch (err: any) {
        console.error("Error fetching offer details:", err);
        setOfferError(err.message || "Failed to load offer details.");
      } finally {
        setOfferLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchOfferDetails();
    }
  }, [offerId, session?.user?.id]);

  // Effect to fetch exchange rates
  useEffect(() => {
    const getRates = async () => {
      setRatesLoading(true);
      try {
        const rates = await fetchExchangeRates();
        setExchangeRates(rates);
        setRatesError(null);
      } catch (err) {
        console.error("Error fetching exchange rates:", err);
        setRatesError("Failed to load exchange rates.");
      } finally {
        setRatesLoading(false);
      }
    };
    getRates();
  }, []);

  // Effect to convert amount when final amount in kobo or selectedCurrency changes
  useEffect(() => {
    const finalKoboDetails = calculateFinalAmountKobo();
    if (finalKoboDetails && exchangeRates && offerAmountInKobo !== null) {
      // Calculate the original amount and the amount to pay, both in NGN
      const originalAmountNGN = offerAmountInKobo / KOBO_PER_NAIRA;
      const amountToPayNGN = finalKoboDetails.amount / KOBO_PER_NAIRA;
      const originalAmountUSD = originalAmountNGN / exchangeRates["NGN"];
      const amountToPayUSD = amountToPayNGN / exchangeRates["NGN"];

      // Convert the NGN amounts to the selected display currency
      const convertedOriginal = Number(
        convertCurrency(
          originalAmountUSD,
          exchangeRates[selectedCurrency],
          "NGN"
        ).replace(/,/g, "")
      );
      const convertedPayment = Number(
        convertCurrency(
          amountToPayUSD,
          exchangeRates[selectedCurrency],
          "NGN"
        ).replace(/,/g, "")
      );

      setConvertedOriginalAmount(convertedOriginal);
      setConvertedAmountToPay(convertedPayment);
    }
  }, [
    calculateFinalAmountKobo,
    selectedCurrency,
    exchangeRates,
    offerAmountInKobo,
  ]);

  const handlePaystackPayment = useCallback(async () => {
    setIsLoading(true);
    const finalKoboDetails = calculateFinalAmountKobo();

    if (!publicKey) {
      toast.error("Payment gateway not configured. Please contact support.");
      setIsLoading(false);
      return;
    }

    if (!PaystackPop) {
      toast.warn(
        "Payment gateway is still loading. Please try again in a moment."
      );
      setIsLoading(false);
      return;
    }

    if (finalKoboDetails === null || finalKoboDetails.amount <= 0) {
      toast.error("Invalid amount for payment. Please refresh the page.");
      setIsLoading(false);
      return;
    }

    const email = session?.user?.email || "customer@example.com";
    const customerName = session?.user?.name || "Bravework Customer";

    try {
      const handler = PaystackPop.setup({
        key: publicKey,
        email: email,
        amount: finalKoboDetails.amount,
        currency: "NGN",
        ref: `offer_${offerId}_${new Date().getTime()}_${paymentOption}`,
        metadata: {
          orderId: orderId,
          service: serviceName,
          customer_name: customerName,
          payment_option: paymentOption,
          payment_percentage: finalKoboDetails.paymentPercentage,
          discount_applied: finalKoboDetails.discountPercentage,
          original_amount_kobo: offerAmountInKobo,
        },
        onClose: () => {
          toast.info("Payment window closed.");
          setIsLoading(false);
        },
        callback: async (response: any) => {
          console.log("Paystack callback received:", response);
          try {
            const res = await fetch("/api/paystack-verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                reference: response.reference,
                offerId,
                paymentOption,
              }),
            });
            const data = await res.json();
            if (data.success) {
              toast.success("Payment confirmed and service granted!");
            } else {
              toast.error(
                "Payment could not be confirmed. Please contact support."
              );
              console.error("Backend verification failed:", data.message);
            }
          } catch (error) {
            toast.error(
              "Error during payment confirmation. Please contact support."
            );
            console.error("Error calling backend verification:", error);
          } finally {
            setIsLoading(false);
          }
        },
      });
      handler.openIframe();
    } catch (setupError: any) {
      console.error(
        "Error during Paystack setup or opening iframe:",
        setupError
      );
      toast.error("Failed to initiate payment. Please check your console.");
      setIsLoading(false);
    }
  }, [
    publicKey,
    PaystackPop,
    offerId,
    serviceName,
    session?.user?.email,
    session?.user?.name,
    calculateFinalAmountKobo,
    paymentOption,
    offerAmountInKobo,
    orderId,
  ]);

  if (offerLoading || ratesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg text-gray-700">
        Loading payment details...
      </div>
    );
  }

  if (offerError || ratesError) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg text-red-600">
        Error: {offerError || ratesError}
      </div>
    );
  }

  if (offerAmountInKobo === null) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg text-red-600">
        Could not retrieve offer amount. Please ensure the offer ID is valid.
      </div>
    );
  }

  const finalKoboDetails = calculateFinalAmountKobo();
  const balanceToPay =
    (convertedOriginalAmount ?? 0) - (convertedAmountToPay ?? 0);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 flex items-center justify-center font-sans">
      <div className="max-w-xl w-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 sm:p-10 transition-colors duration-200">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 dark:text-gray-100 mb-8">
          Complete Your Payment
        </h1>

        <div className="space-y-6">
          {/* Service Details Card */}
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-2xl p-6 text-center shadow-inner">
            <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-2">
              Service: {serviceName || "Loading..."}
            </h2>
            <p className="text-lg text-blue-700 dark:text-blue-300">
              Original Amount:{" "}
              <span className="font-extrabold text-blue-900 dark:text-blue-100">
                {getCurrencySymbol(selectedCurrency)}
                {(convertedOriginalAmount ?? 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </p>
            {offerId && (
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                For Custom Offer ID: {offerId}
              </p>
            )}
          </div>

          {/* Payment Options Section */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6 shadow-md">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Select Payment Option
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setPaymentOption("deposit_50")}
                className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-2xl text-center transition-all duration-300 transform hover:scale-105",
                  paymentOption === "deposit_50"
                    ? "bg-purple-600 dark:bg-purple-700 text-white shadow-lg ring-4 ring-purple-300"
                    : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                )}
              >
                <span className="text-2xl font-bold">50%</span>
                <span className="text-sm">Deposit</span>
              </button>
              <button
                onClick={() => setPaymentOption("deposit_70_discount")}
                className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-2xl text-center transition-all duration-300 transform hover:scale-105 relative overflow-hidden group",
                  paymentOption === "deposit_70_discount"
                    ? "bg-purple-600 dark:bg-purple-700 text-white shadow-lg ring-4 ring-purple-300"
                    : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                )}
              >
                <span className="text-xs absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full font-semibold rotate-6 -translate-y-1 group-hover:scale-110 transition-transform">
                  5% Off
                </span>
                <span className="text-2xl font-bold">70%</span>
                <span className="text-sm">Discounted Deposit</span>
              </button>
              <button
                onClick={() => setPaymentOption("full_100_discount")}
                className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-2xl text-center transition-all duration-300 transform hover:scale-105 relative overflow-hidden group",
                  paymentOption === "full_100_discount"
                    ? "bg-purple-600 dark:bg-purple-700 text-white shadow-lg ring-4 ring-purple-300"
                    : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                )}
              >
                <span className="text-xs absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full font-semibold rotate-6 -translate-y-1 group-hover:scale-110 transition-transform">
                  10% Off
                </span>
                <span className="text-2xl font-bold">100%</span>
                <span className="text-sm">Discounted Full Payment</span>
              </button>
            </div>
          </div>

          {/* Payment Summary */}
          {finalKoboDetails && (
            <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-2xl p-6 text-center shadow-inner">
              <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-200 mb-3">
                Payment Summary
              </h3>
              <p className="text-lg text-yellow-700 dark:text-yellow-300 mb-1">
                Paying:{" "}
                <span className="font-extrabold">
                  {finalKoboDetails.paymentPercentage}%
                </span>{" "}
                of Original Amount
              </p>
              {finalKoboDetails.discountPercentage > 0 && (
                <p className="text-md text-yellow-700 dark:text-yellow-300 mb-1">
                  Discount Applied:{" "}
                  <span className="font-extrabold">
                    {finalKoboDetails.discountPercentage}%
                  </span>
                </p>
              )}
              <div className="mt-4 border-t border-yellow-200 dark:border-yellow-600 pt-4 space-y-2">
                <p className="text-xl font-bold text-yellow-800 dark:text-yellow-200">
                  Amount to Pay:{" "}
                  <span className="font-extrabold">
                    {getCurrencySymbol(selectedCurrency)}
                    {(convertedAmountToPay ?? 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </p>
                <p className="text-xl font-bold text-yellow-800 dark:text-yellow-200">
                  Balance to Pay:{" "}
                  <span className="font-extrabold">
                    {getCurrencySymbol(selectedCurrency)}
                    {paymentOption === "full_100_discount"
                      ? 0
                      : balanceToPay.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Currency Selector */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6 shadow-md">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Select Display Currency
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {["NGN", "USD", "GBP", "EUR"].map((currency) => (
                <button
                  key={currency}
                  onClick={() => setSelectedCurrency(currency)}
                  className={cn(
                    "py-3 px-2 rounded-xl text-sm font-semibold transition-all duration-200",
                    selectedCurrency === currency
                      ? "bg-blue-600 text-white shadow-lg ring-4 ring-blue-300 dark:ring-blue-500/50"
                      : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                  )}
                >
                  {currency}
                </button>
              ))}
            </div>
          </div>

          {/* Proceed to Payment Button */}
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-2xl p-6 text-center shadow-inner">
            <h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-4">
              Proceed to Payment
            </h3>
            <button
              onClick={handlePaystackPayment}
              disabled={
                isLoading || !PaystackPop || convertedAmountToPay === null
              }
              className="w-full py-4 px-6 rounded-xl font-extrabold text-white text-lg bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading
                ? "Processing Payment..."
                : !PaystackPop
                ? "Loading Payment Gateway..."
                : `Pay ${getCurrencySymbol(selectedCurrency)}${(
                    convertedAmountToPay ?? 0
                  ).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// The main export for the page, wrapped with Suspense
export default function PaymentPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen text-lg text-gray-700">
          Loading payment page...
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
