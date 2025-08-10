// app/dashboard/payment/page.tsx
"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify"; 
import { useSession } from "next-auth/react"; 
import { fetchExchangeRates } from "lib/utils/fetchExchangeRate";
import { ExchangeRates } from "app/types/app";
import { getCurrencySymbol } from "lib/utils/getCurrencySymbol";



// Create a separate component that uses useSearchParams
function PaymentContent() {
  const searchParams = useSearchParams();
  const offerId = searchParams.get("offerId"); // Get offerId from URL
  const { data: session } = useSession(); // Get user session for email/name

  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

  const [offerAmountInKobo, setOfferAmountInKobo] = useState<number | null>(
    null
  ); // Securely fetched original amount in kobo
  const [serviceName, setServiceName] = useState<string | null>(null); // Securely fetched service name
  const [orderId, setOrderId] = useState<number | null>(null); // Securely fetched orderId, if needed for metadata
  const [selectedCurrency, setSelectedCurrency] = useState("NGN"); // Default to NGN
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null); // Amount after percentage/discount, in selected display currency
  const [isLoading, setIsLoading] = useState(false); // For Paystack payment processing
  const [PaystackPop, setPaystackPop] = useState<any>(null);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(
    null
  );
  const [ratesLoading, setRatesLoading] = useState(true);
  const [ratesError, setRatesError] = useState<string | null>(null);
  const [offerLoading, setOfferLoading] = useState(true); // State for offer fetch
  const [offerError, setOfferError] = useState<string | null>(null); // State for offer fetch error

  // State for payment option
  type PaymentOption =
    | "full_100_discount"
    | "deposit_70_discount"
    | "deposit_50";
  const [paymentOption, setPaymentOption] =
    useState<PaymentOption>("full_100_discount"); // Default to 100% with 10% discount

  // Calculate final amount in kobo based on option and original offer amount
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
        calculatedAmount = offerAmountInKobo * 0.7; // 70% of original
        discountPercentage = 5;
        calculatedAmount *= 1 - discountPercentage / 100; // Apply 5% discount
        paymentPercentage = 70;
        break;
      case "full_100_discount":
        calculatedAmount = offerAmountInKobo; // Start with 100%
        discountPercentage = 10;
        calculatedAmount *= 1 - discountPercentage / 100; // Apply 10% discount
        paymentPercentage = 100;
        break;
    }

    return {
      amount: Math.round(calculatedAmount), // Round to nearest kobo (integer)
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
        console.log("Fetched offer details:", data);
        setOfferAmountInKobo(data.offerAmount);
        setServiceName(data.orderService || "Custom Offer");
        setOrderId(data.orderId); // Set orderId from fetched data
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
        console.log("Rates", rates)
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
    if (finalKoboDetails && exchangeRates) {
      const baseAmountNaira = finalKoboDetails.amount / 100; // Convert kobo to Naira
      let converted = 0;

      if (selectedCurrency === "NGN") {
        converted = baseAmountNaira;
      } else if (exchangeRates[selectedCurrency]) {
        converted = baseAmountNaira * exchangeRates[selectedCurrency];
      } else {
        console.warn(`Exchange rate for ${selectedCurrency} not found.`);
        converted = baseAmountNaira;
      }
      setConvertedAmount(converted);
    }
  }, [calculateFinalAmountKobo, selectedCurrency, exchangeRates]);

  const handlePaystackPayment = useCallback(async () => {
    setIsLoading(true);

    // Debugging checks

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
        amount: finalKoboDetails.amount, // Use the calculated final amount in kobo
        currency: "NGN", // Paystack currency (usually NGN for kobo amounts)
        ref: `offer_${offerId}_${new Date().getTime()}_${paymentOption}`, // Unique reference with option
        metadata: {
          orderId: orderId, // Pass orderId from fetched offer details
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
                offerId: offerId,
                paymentOption: paymentOption,
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
      console.log("Paystack handler setup. Opening iframe...");
      handler.openIframe(); // This is the call that opens the modal
    } catch (setupError: any) {
      console.error(
        "Error during Paystack setup or opening iframe:",
        setupError
      );
      console.error(
        "Failed to initiate payment. Please check your browser console for details."
      );
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
    orderId, // Added orderId to dependencies
    convertedAmount, // Added convertedAmount to dependencies for logging
  ]);


  const finalKoboDetails = calculateFinalAmountKobo();
  const originalAmountDisplay =
    offerAmountInKobo !== null
      ? (offerAmountInKobo / 100).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : "N/A";
  // This calculation for discountAmountDisplay seems problematic if paymentPercentage is 0 (which it isn't here)
  // or if it's meant to show the *absolute* discount amount.
  // Let's simplify it to show the percentage discount if applicable.
  // const discountAmountDisplay =
  //   finalKoboDetails && offerAmountInKobo !== null
  //     ? (
  //         (offerAmountInKobo -
  //           finalKoboDetails.amount /
  //             (finalKoboDetails.paymentPercentage / 100)) /
  //         100
  //       ).toLocaleString(undefined, {
  //         minimumFractionDigits: 2,
  //         maximumFractionDigits: 2,
  //       })
  //     : "0.00";

  // Overall loading state
  if (offerLoading || ratesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg text-gray-700">
        Loading payment details...
      </div>
    );
  }

  // Overall error state
  if (offerError || ratesError) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg text-red-600">
        Error: {offerError || ratesError}
      </div>
    );
  }

  // If no offer amount is loaded after loading, it means something went wrong or offerId was invalid
  if (offerAmountInKobo === null) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg text-red-600">
        Could not retrieve offer amount. Please ensure the offer ID is valid.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-6 sm:p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Make Your Payment
        </h1>

        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <h2 className="text-xl font-semibold text-blue-800 mb-2">
              Service: {serviceName}
            </h2>
            <p className="text-lg text-blue-700">
              Original Offer Amount:{" "}
              <span className="font-bold">₦{originalAmountDisplay}</span> NGN
            </p>
            {offerId && (
              <p className="text-sm text-blue-600 mt-1">
                For Custom Offer ID: {offerId}
              </p>
            )}
          </div>

          {/* Payment Options Section */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Select Payment Option
            </h3>
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => setPaymentOption("deposit_50")}
                className={`py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200
                  ${
                    paymentOption === "deposit_50"
                      ? "bg-purple-600 text-white shadow-md"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                  }`}
              >
                Pay 50% Deposit
              </button>
              <button
                onClick={() => setPaymentOption("deposit_70_discount")}
                className={`py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200
                  ${
                    paymentOption === "deposit_70_discount"
                      ? "bg-purple-600 text-white shadow-md"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                  }`}
              >
                Pay 70% (Get 5% Discount!)
              </button>
              <button
                onClick={() => setPaymentOption("full_100_discount")}
                className={`py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200
                  ${
                    paymentOption === "full_100_discount"
                      ? "bg-purple-600 text-white shadow-md"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                  }`}
              >
                Pay 100% (Get 10% Discount!)
              </button>
            </div>
          </div>

          {finalKoboDetails && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <h3 className="text-xl font-semibold text-yellow-800 mb-2">
                Summary
              </h3>
              <p className="text-lg text-yellow-700">
                Paying:{" "}
                <span className="font-bold">
                  {finalKoboDetails.paymentPercentage}%
                </span>{" "}
                of Original Amount
              </p>
              {finalKoboDetails.discountPercentage > 0 && (
                <p className="text-md text-yellow-700">
                  Discount Applied:{" "}
                  <span className="font-bold">
                    {finalKoboDetails.discountPercentage}%
                  </span>
                </p>
              )}
              <p className="text-xl font-bold text-yellow-800 mt-2">
                Final Amount to Pay: {getCurrencySymbol(selectedCurrency)}
                {convertedAmount?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                {selectedCurrency}
              </p>
            </div>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Select Display Currency
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {["NGN", "USD", "GBP", "EUR"].map((currency) => (
                <button
                  key={currency}
                  onClick={() => setSelectedCurrency(currency)}
                  className={`py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200
                    ${
                      selectedCurrency === currency
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                    }`}
                >
                  {currency} - {getCurrencySymbol(currency)}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <h3 className="text-lg font-semibold text-green-800 mb-3">
              Proceed to Payment
            </h3>
            <button
              onClick={handlePaystackPayment}
              disabled={isLoading || !PaystackPop || convertedAmount === null}
              className="w-full py-3 px-6 rounded-lg font-bold text-white bg-green-600 hover:bg-green-700 transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? "Processing Payment..."
                : !PaystackPop
                ? "Loading Payment Gateway..."
                : `Pay ${getCurrencySymbol(
                    selectedCurrency
                  )}${convertedAmount?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} ${selectedCurrency} with Paystack`}
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
