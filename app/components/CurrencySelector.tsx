// components/CurrencySelector.tsx
import React from 'react';
import { currencies, Currency } from 'lib/utils/currencies';
import { getCurrencySymbol } from 'lib/utils/getCurrencySymbol';

interface CurrencySelectorProps {
  selectedCurrency: Currency;
  onSelect: (currency: Currency) => void;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({ selectedCurrency, onSelect }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {currencies.map((currency) => (
        <button
          key={currency}
          type="button"
          onClick={() => onSelect(currency)}
          className={`py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200
            ${
              selectedCurrency === currency
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
            }`}
        >
          {currency} - {getCurrencySymbol(currency)}
        </button>
      ))}
    </div>
  );
};

export default CurrencySelector;