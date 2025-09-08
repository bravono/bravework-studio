"use client";

import React, {
  useState,
  useEffect,
  Suspense,
  useCallback,
  useMemo,
} from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";

// Assuming these utility functions and hooks exist
import { getCurrencySymbol } from "@/lib/utils/getCurrencySymbol";
import { convertCurrency } from "@/lib/utils/convertCurrency";
import { cn } from "@/lib/utils/cn";
import useSelectedCurrency from "@/hooks/useSelectedCurrency";
import useExchangeRates from "@/hooks/useExchangeRates";

// Define the amount of kobo in a Naira
const KOBO_PER_NAIRA = 100;

// A separate component to handle useSearchParams due to Next.js constraints
function PaymentContent() {
  const searchParams = useSearchParams();
  const offerId = searchParams.get("offerId");
  const courseId = searchParams.get("courseId");
  const payingOfferBalance = searchParams.get("balance");
  const { data: session } = useSession();

  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
  const [PaystackPop, setPaystackPop] = useState(null);

  const { exchangeRates, ratesLoading, ratesError } = useExchangeRates();
  const [offerAmountInKobo, setOfferAmountInKobo] = useState(null);
  const [courseAmountInKobo, setCourseAmountInNGN] = useState(null);
  const [courseTitle, setCourseTitle] = useState(null);
  const [totalPaid, setTotalPaid] = useState(0); // in Kobo
  const [serviceName, setServiceName] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const { selectedCurrency, updateSelectedCurrency } = useSelectedCurrency();

  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState(null);

  const [paymentOption, setPaymentOption] = useState("full_100_discount");

  // Use a single memoized calculation for all payment details
  const paymentDetails = useMemo(() => {
    // Determine the base amount in Kobo based on whether it's a course or an offer
    const baseAmountInKobo = courseId
      ? (courseAmountInKobo ?? 0) * KOBO_PER_NAIRA
      : offerAmountInKobo ?? 0;

    let calculatedAmount = baseAmountInKobo;
    let discountPercentage = 0;
    let paymentPercentage = 100;

    if (offerId && !payingOfferBalance) {
      // Only apply discounts if it's an offer and not a balance payment
      switch (paymentOption) {
        case "deposit_50":
          calculatedAmount = baseAmountInKobo * 0.5;
          paymentPercentage = 50;
          break;
        case "deposit_70_discount":
          calculatedAmount = baseAmountInKobo * 0.7;
          discountPercentage = 5;
          calculatedAmount *= 1 - discountPercentage / 100;
          paymentPercentage = 70;
          break;
        case "full_100_discount":
          calculatedAmount = baseAmountInKobo;
          discountPercentage = 10;
          calculatedAmount *= 1 - discountPercentage / 100;
          paymentPercentage = 100;
          break;
      }
    }

    const amountAlreadyPaid = totalPaid;
    const amountToPay = Math.round(
      payingOfferBalance
        ? baseAmountInKobo - amountAlreadyPaid
        : calculatedAmount
    );

    // Convert NGN amounts to the selected display currency
    const originalAmountInNGN = baseAmountInKobo / KOBO_PER_NAIRA;

    if (exchangeRates) {
      const originalConverted = convertCurrency(
        originalAmountInNGN,
        exchangeRates[selectedCurrency],
        getCurrencySymbol(selectedCurrency)
      );

      const amountToPayInNGN = amountToPay / KOBO_PER_NAIRA;
      const amountToPayConverted = convertCurrency(
        amountToPayInNGN,
        exchangeRates[selectedCurrency],
        getCurrencySymbol(selectedCurrency)
      );

      // Balance to be paid in the future
      const balanceToPayInNGN =
        (originalAmountInNGN * paymentPercentage) / 100 - amountToPayInNGN;
      const balanceToPayConverted = convertCurrency(
        balanceToPayInNGN,
        exchangeRates[selectedCurrency],
        getCurrencySymbol(selectedCurrency)
      );

      return {
        amountToPayInKobo: amountToPay,
        amountToPayInNGN,
        amountToPayConverted,
        originalConverted,
        balanceToPayConverted,
        discountPercentage,
        paymentPercentage,
      };
    }
  }, [
    offerAmountInKobo,
    courseAmountInKobo,
    totalPaid,
    courseId,
    offerId,
    payingOfferBalance,
    paymentOption,
    exchangeRates,
    selectedCurrency,
  ]);

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

  // Effect to fetch offer or course details securely from backend
  useEffect(() => {
    const fetchPaymentDataDetails = async () => {
      if (!offerId && !courseId) {
        setDataError("Offer/Course ID or user session missing.");
        setDataLoading(false);
        return;
      }
      setDataLoading(true);
      setDataError(null);

      if (offerId) {
        try {
          const res = await fetch(`/api/user/custom-offers/${offerId}`);
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(
              errorData.error || "Failed to fetch offer details securely."
            );
          }
          const offer = await res.json();
          setOfferAmountInKobo(offer.offerAmount);
          setTotalPaid(offer.totalPaid);
          setServiceName(offer.categoryName);
          setOrderId(offer.orderId);
        } catch (err: any) {
          console.error("Error fetching offer details:", err);
          setDataError(err.message || "Failed to load offer details.");
        } finally {
          setDataLoading(false);
        }
      }

      if (courseId) {
        try {
          const res = await fetch(`/api/user/courses/${courseId}`);
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(
              errorData.error || "Failed to fetch course details securely."
            );
          }
          const course = await res.json();
          setCourseAmountInNGN(course[0].price / KOBO_PER_NAIRA);
          setCourseTitle(course[0].title);
        } catch (err: any) {
          console.error("Error fetching course details:", err);
          setDataError(err.message || "Failed to load course details.");
        } finally {
          setDataLoading(false);
        }
      }
    };
    fetchPaymentDataDetails();
  }, [offerId, courseId]);

  const handlePaystackPayment = useCallback(async () => {
    setIsLoading(true);

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

    if (paymentDetails.amountToPayInKobo <= 0) {
      toast.error("Invalid amount for payment. Please refresh the page.");
      setIsLoading(false);
      return;
    }

    const email = session?.user?.email;
    const customerName = session?.user?.name;
    const servicePayingFor = offerId ? "offer" : "course";
    const serviceMetadataInfo = {
      orderId: orderId,
      service: "project",
      customer_name: customerName,
      payment_option: paymentOption,
      payment_percentage: paymentDetails.paymentPercentage,
      discount_applied: paymentDetails.discountPercentage,
      original_amount_kobo: offerAmountInKobo,
    };
    const courseMetadataInfo = {
      orderId: orderId,
      service: "course",
      customer_name: customerName,
      payment_option: paymentOption,
    };

    try {
      const handler = PaystackPop.setup({
        key: publicKey,
        email: email,
        amount: paymentDetails.amountToPayInKobo,
        currency: "NGN",
        ref: `${servicePayingFor}_${offerId}_${new Date().getTime()}_${paymentOption}`,
        metadata: offerId ? serviceMetadataInfo : courseMetadataInfo,
        onClose: () => {
          toast.info("Payment window closed.");
          setIsLoading(false);
        },
        callback: async (response: any) => {
          console.log("Paystack callback received:", response);

          try {
            const id = offerId ? offerId : courseId;
            const res = await fetch("/api/paystack-verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                reference: response.reference,
                id,
                paymentOption,
              }),
            });
            const data = await res.json();

            if (data.success) {
              toast.success("Payment confirmed and service granted!");
              // Optionally redirect to orders or another page
              window.location.href = "/user/dashboard";
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
  }, [publicKey, PaystackPop, session?.user?.email, paymentDetails]);
  if (dataLoading || ratesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg text-gray-700">
        Loading payment details...
      </div>
    );
  }

  if (dataError || ratesError) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg text-red-600">
        Error: {dataError || ratesError}
      </div>
    );
  }

  if (paymentDetails.amountToPayInKobo === null) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg text-red-600">
        Could not retrieve payment amount. Please ensure the offer ID is valid.
      </div>
    );
  }

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
              {offerId ? "Service:" : "Course:"}{" "}
              {offerId ? serviceName : courseTitle}
            </h2>
            <p className="text-lg text-blue-700 dark:text-blue-300">
              {payingOfferBalance ? "Balance To Pay: " : "Original Amount: "}
              <span className="font-extrabold text-blue-900 dark:text-blue-100">
                {getCurrencySymbol(selectedCurrency)}
                {paymentDetails.originalConverted}
              </span>
            </p>
            {offerId && (
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                For Custom Offer ID: {offerId}
              </p>
            )}
          </div>

          {/* Payment Options Section */}
          {!payingOfferBalance && !courseId && (
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
          )}

          {/* Payment Summary */}
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-2xl p-6 text-center shadow-inner">
            <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-200 mb-3">
              Payment Summary
            </h3>
            <p className="text-lg text-yellow-700 dark:text-yellow-300 mb-1">
              Paying:{" "}
              <span className="font-extrabold">
                {paymentDetails.paymentPercentage}%
              </span>{" "}
              of Original Amount
            </p>
            {paymentDetails.discountPercentage > 0 && (
              <p className="text-md text-yellow-700 dark:text-yellow-300 mb-1">
                Discount Applied:{" "}
                <span className="font-extrabold">
                  {paymentDetails.discountPercentage}%
                </span>
              </p>
            )}
            <div className="mt-4 border-t border-yellow-200 dark:border-yellow-600 pt-4 space-y-2">
              <p className="text-xl font-bold text-yellow-800 dark:text-yellow-200">
                Amount to Pay:{" "}
                <span className="font-extrabold">
                  {getCurrencySymbol(selectedCurrency)}
                  {paymentDetails.amountToPayConverted}
                </span>
              </p>
              <p className="text-xl font-bold text-yellow-800 dark:text-yellow-200">
                Balance to Pay:{" "}
                <span className="font-extrabold">
                  {paymentDetails.paymentPercentage === 100
                    ? getCurrencySymbol(selectedCurrency) + "0.00"
                    : paymentDetails.balanceToPayConverted}
                </span>
              </p>
            </div>
          </div>

          {/* Currency Selector */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6 shadow-md">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Select Display Currency
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {["NGN", "USD", "GBP", "EUR"].map((currency) => (
                <button
                  key={currency}
                  onClick={() => updateSelectedCurrency(currency as any)}
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
                isLoading ||
                !PaystackPop ||
                paymentDetails.amountToPayInKobo <= 0
              }
              className="w-full py-4 px-6 rounded-xl font-extrabold text-white text-lg bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading
                ? "Processing Payment..."
                : !PaystackPop
                ? "Loading Payment Gateway..."
                : `Pay ${getCurrencySymbol(selectedCurrency)}${
                    paymentDetails.amountToPayConverted
                  }`}
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
