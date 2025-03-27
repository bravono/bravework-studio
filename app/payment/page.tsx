'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

// Mock exchange rates - replace with actual API calls
const mockRates = {
  USD: 1,
  NGN: 1200,
  USDT: 1,
  USDC: 1
};

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const service = searchParams.get('service');
  const amount = searchParams.get('amount');

  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cryptoAddress, setCryptoAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (amount) {
      convertAmount(parseFloat(amount), selectedCurrency);
    }
  }, [amount, selectedCurrency]);

  const convertAmount = (value: number, toCurrency: string) => {
    const usdAmount = value / mockRates.NGN; // Convert from NGN to USD first
    const converted = usdAmount * mockRates[toCurrency as keyof typeof mockRates];
    setConvertedAmount(converted);
  };

  const handlePaystackPayment = async () => {
    setIsLoading(true);
    try {
      // Initialize Paystack payment
      const handler = (window as any).PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: 'customer@example.com',
        amount: convertedAmount * 100, // Convert to kobo
        currency: selectedCurrency,
        ref: `TRX-${Date.now()}`,
        callback: function(response: any) {
          // Handle successful payment
          console.log('Payment successful:', response);
          setIsLoading(false);
        },
        onClose: function() {
          setIsLoading(false);
        }
      });
      handler.openIframe();
    } catch (error) {
      console.error('Payment error:', error);
      setIsLoading(false);
    }
  };

  const handleCryptoPayment = async () => {
    setIsLoading(true);
    try {
      // Generate crypto payment address
      const address = await generateCryptoAddress();
      setCryptoAddress(address);
      setIsLoading(false);
    } catch (error) {
      console.error('Crypto payment error:', error);
      setIsLoading(false);
    }
  };

  const generateCryptoAddress = async () => {
    // Mock function - replace with actual crypto payment gateway integration
    return '0x1234...5678';
  };

  return (
    <div className="payment-page">
      <div className="payment-container">
        <h1>Complete Your Payment</h1>
        
        <div className="payment-details">
          <div className="service-info">
            <h2>Service: {service}</h2>
            <p>Amount: {amount} NGN</p>
          </div>

          <div className="currency-converter">
            <h3>Convert Amount</h3>
            <div className="converter-inputs">
              <div className="form-group">
                <label>From</label>
                <select 
                  value="NGN" 
                  disabled
                  className="currency-select"
                >
                  <option value="NGN">NGN - Nigerian Naira</option>
                </select>
              </div>
              <div className="form-group">
                <label>To</label>
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
            </div>
            <div className="converted-amount">
              <h4>Converted Amount:</h4>
              <p>{convertedAmount.toFixed(2)} {selectedCurrency}</p>
            </div>
          </div>

          <div className="payment-methods">
            <h3>Select Payment Method</h3>
            <div className="method-options">
              <button 
                className={`method-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('card')}
              >
                Card Payment (Paystack)
              </button>
              <button 
                className={`method-btn ${paymentMethod === 'crypto' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('crypto')}
              >
                Cryptocurrency
              </button>
            </div>

            {paymentMethod === 'card' ? (
              <button 
                className="pay-btn"
                onClick={handlePaystackPayment}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Pay with Card'}
              </button>
            ) : (
              <div className="crypto-payment">
                <button 
                  className="pay-btn"
                  onClick={handleCryptoPayment}
                  disabled={isLoading}
                >
                  {isLoading ? 'Generating Address...' : 'Pay with Crypto'}
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