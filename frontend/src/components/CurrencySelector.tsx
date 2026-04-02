'use client';

import { useState } from 'react';
import { useCurrency } from '@/lib/CurrencyContext';
import { CurrencyCode, CURRENCY_SYMBOLS, CURRENCY_LABELS, getCurrencyDisplay } from '@/lib/currencyService';

export default function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);

  // Available currencies (VND default first)
  const availableCurrencies: CurrencyCode[] = ['VND', 'USD', 'EUR', 'JPY', 'KRW', 'HKD', 'CNY'];

  const handleCurrencyChange = (newCurrency: CurrencyCode) => {
    setCurrency(newCurrency);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-colors"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span>{getCurrencyDisplay(currency)}</span>
        <svg className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} aria-hidden />
          <div className="absolute right-0 mt-1.5 w-44 rounded-xl shadow-lg bg-white border border-slate-200 py-1 z-20">
            {availableCurrencies.map((currencyOption) => (
              <button
                key={currencyOption}
                onClick={() => handleCurrencyChange(currencyOption)}
                className={`block w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  currency === currencyOption
                    ? 'bg-sky-50 text-sky-700 font-medium'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
                role="menuitem"
              >
                <span className="font-medium">{CURRENCY_SYMBOLS[currencyOption]} {currencyOption}</span>
                <span className="ml-2 text-xs text-slate-400">{CURRENCY_LABELS[currencyOption]}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
