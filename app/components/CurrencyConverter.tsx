import React, { useState, useEffect } from "react";
import { getCurrencySymbol } from "@/lib/utils/getCurrencySymbol";
import useExchangeRates from "@/hooks/useExchangeRates";

const App = () => {
  const [amount, setAmount] = useState(1);
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [convertedAmount, setConvertedAmount] = useState(0);
  const exchangeRates = useExchangeRates;

  useEffect(() => {
    const rateFrom = exchangeRates[fromCurrency];
    const rateTo = exchangeRates[toCurrency];

    if (rateFrom && rateTo) {
      const result = (amount / rateFrom) * rateTo;
      setConvertedAmount(Number(result.toFixed(2)));
    }
  }, [amount, fromCurrency, toCurrency, exchangeRates]);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === "" || !isNaN(value)) {
      setAmount(value === "" ? 0 : parseFloat(value));
    }
  };

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const currencies = Object.keys(exchangeRates);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Simple Currency Converter
        </h1>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Amount
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={amount}
              onChange={handleAmountChange}
              placeholder="Enter amount"
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-gray-700 font-medium mb-1">
                From
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
              >
                {currencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSwap}
              className="p-3 bg-blue-500 text-white rounded-lg self-end hover:bg-blue-600 transition-colors duration-200 shadow-md transform hover:scale-105"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
            </button>

            <div className="flex-1">
              <label className="block text-gray-700 font-medium mb-1">To</label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
              >
                {currencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-xl font-semibold text-blue-800">Result:</h2>
          <p className="text-3xl font-bold text-blue-700 mt-2">
            {getCurrencySymbol(toCurrency)} {convertedAmount}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            (Based on hardcoded exchange rates)
          </p>
        </div>
      </div>
    </div>
  );
};
