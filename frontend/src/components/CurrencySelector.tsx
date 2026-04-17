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
    <div className="relative z-[120] shrink-0 isolate">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full bg-white/84 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-white focus:outline-none"
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
          <div className="absolute right-0 top-full z-[140] mt-2 w-52 rounded-[1.25rem] border border-slate-200/60 bg-white py-2 shadow-[0_18px_40px_rgba(25,28,29,0.12)]">
            {availableCurrencies.map((currencyOption) => (
              <button
                key={currencyOption}
                onClick={() => handleCurrencyChange(currencyOption)}
                className={`block w-full px-4 py-3 text-left text-sm transition-colors ${
                  currency === currencyOption
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
                role="menuitem"
              >
                <span className="font-medium">{CURRENCY_SYMBOLS[currencyOption]} {currencyOption}</span>
                <span className="ml-2 block text-xs text-slate-400">{CURRENCY_LABELS[currencyOption]}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
