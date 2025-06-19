"use client";

import React, { useState, useEffect, Suspense } from "react"; // Import Suspense
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

// Mock exchange rates - replace with actual API calls
const mockRates = {
  USD: 1,
  NGN: 1500,
  USDT: 1,
  USDC: 1,
};

// Create a separate component that uses useSearchParams
function PaymentContent() {
  const searchParams = useSearchParams();
  const service = searchParams.get("service");
  const amount = searchParams.get("amount");
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cryptoAddress, setCryptoAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [PaystackPop, setPaystackPop] = useState(null); // State to hold the dynamically imported module

  // Effect to dynamically import PaystackPop only on the client
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("@paystack/inline-js")
        .then((module) => setPaystackPop(() => module.default))
        .catch((error) => console.error("Failed to load PaystackPop:", error));
    }
  }, []);

  useEffect(() => {
    if (amount) {
      convertAmount(parseFloat(amount), selectedCurrency);
    }
  }, [amount, selectedCurrency]);

  const convertAmount = (value: number, toCurrency: string) => {
    const ngnAmount = value * mockRates.NGN; // Convert from USD to NGN first
    const converted =
      ngnAmount * mockRates[toCurrency as keyof typeof mockRates];
    setConvertedAmount(converted);
  };

  const handlePaystackPayment = async () => {
    setIsLoading(true);

    if (!publicKey) {
      toast("Payment gateway not configured. Please contact support.");
      setIsLoading(false);
      return;
    }

    if (!PaystackPop) {
      toast("Payment gateway is still loading. Please try again in a moment.");
      setIsLoading(false);
      return;
    }

    const reference = new Date().getTime().toString();
    const handler = new PaystackPop();

    try {
      const res = await fetch("/api/paystack-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Payment confirmed and service granted!");
        // Redirect user to success page or show success message
        // router.push('/success-page'); // Assuming you have Next.js router
      } else {
        toast.error("Payment could not be confirmed. Please contact support.");
        console.error("Backend verification failed:", data.message);
      }
    } catch (error) {
      toast.error("Error during payment confirmation. Please contact support.");
      console.error("Error calling backend verification:", error);
    }
  };

  const handleCryptoPayment = async () => {
    setIsLoading(true);
    try {
      const address = await generateCryptoAddress();
      setCryptoAddress(address);
      setIsLoading(false);
    } catch (error) {
      console.error("Crypto payment error:", error);
      toast("Crypto payment error: " + (error as Error).message);
      setIsLoading(false);
    }
  };

  const generateCryptoAddress = async () => {
    return "0x1234...5678";
  };

  return (
    <div className="payment-page">
      <div className="payment-container">
        <h1>Make Your Payment</h1>

        <div className="payment-details">
          <div className="service-info">
            <h2>Service: {service}</h2>
            <p>
              Amount: {amount} {selectedCurrency}
            </p>
          </div>

          <div className="currency-converter">
            <h3>Convert Amount</h3>
            <div className="converter-inputs">
              <div className="form-group">
                <label>From</label>
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="currency-select"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="USDT">USDT - Tether</option>
                  <option value="USDC">USDC - USD Coin</option>
                </select>
              </div>
              <div className="form-group">
                <label>To</label>
                <select value="NGN" className="currency-select" disabled>
                  <option value="NGN">NGN - Nigerian Naira</option>
                </select>
              </div>
            </div>
            <div className="converted-amount">
              <h4>Converted Amount:</h4>
              <p>{convertedAmount} NGN</p>
            </div>
          </div>

          <div className="payment-methods">
            <h3>Select Payment Method</h3>
            <div className="method-options">
              <button
                className={`method-btn ${
                  paymentMethod === "card" ? "active" : ""
                }`}
                onClick={() => setPaymentMethod("card")}
              >
                Card Payment (Paystack)
              </button>
              <button
                className={`method-btn ${
                  paymentMethod === "crypto" ? "active" : ""
                }`}
                onClick={() => setPaymentMethod("crypto")}
              >
                Cryptocurrency
              </button>
            </div>

            {paymentMethod === "card" ? (
              <button
                className="pay-btn"
                onClick={handlePaystackPayment}
                disabled={isLoading || !PaystackPop}
              >
                {isLoading
                  ? "Processing..."
                  : !PaystackPop
                  ? "Loading Payment..."
                  : "Pay with Paystack"}
              </button>
            ) : (
              <div className="crypto-payment">
                <button
                  className="pay-btn"
                  onClick={handleCryptoPayment}
                  disabled={isLoading}
                >
                  {isLoading ? "Generating Address..." : "Pay with Crypto"}
                </button>
                {cryptoAddress && (
                  <div className="crypto-address">
                    <p>Send payment to this address:</p>
                    <div className="address-box">
                      <code>{cryptoAddress}</code>
                      <button className="copy-btn">Copy</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// The main export for the page, wrapped with Suspense
export default function PaymentPageWrapper() {
  return (
    <Suspense fallback={<div>Loading payment details...</div>}>
      <PaymentContent />
    </Suspense>
  );
}
