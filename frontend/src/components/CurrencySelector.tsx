'use client';

import { useState } from 'react';
import { useCurrency } from '@/lib/CurrencyContext';
import { CurrencyCode, CURRENCY_SYMBOLS } from '@/lib/currencyService';

export default function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);

  // Available currencies
  const availableCurrencies: CurrencyCode[] = ['VND', 'USD', 'EUR', 'JPY'];

  const handleCurrencyChange = (newCurrency: CurrencyCode) => {
    setCurrency(newCurrency);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white border border-gray-300 rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span>{CURRENCY_SYMBOLS[currency]} {currency}</span>
        <span className="ml-1">▼</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 border border-gray-100">
          <div
            className="py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="currency-menu"
          >
            {availableCurrencies.map((currencyOption) => (
              <button
                key={currencyOption}
                onClick={() => handleCurrencyChange(currencyOption)}
                className={`block w-full text-left px-4 py-2 text-sm ${currency === currencyOption ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                role="menuitem"
              >
                {CURRENCY_SYMBOLS[currencyOption]} {currencyOption}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}