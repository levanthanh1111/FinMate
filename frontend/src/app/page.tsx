'use client';

import Dashboard from '@/components/Dashboard';
import { useCurrency } from '@/lib/CurrencyContext';
import { CURRENCY_SYMBOLS } from '@/lib/currencyService';

export default function Home() {
  const { currency } = useCurrency();
  
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Financial Dashboard</h1>
        <div className="text-sm text-gray-500 inline-block bg-gray-50 px-3 py-1.5 rounded-md">
          Currently displaying in: <span className="font-medium text-blue-600">{CURRENCY_SYMBOLS[currency]} {currency}</span>
        </div>
      </div>
      <Dashboard />
    </div>
  );
}