'use client';

import Dashboard from '@/components/Dashboard';
import { useCurrency } from '@/lib/CurrencyContext';
import { CURRENCY_SYMBOLS } from '@/lib/currencyService';

export default function Home() {
  const { currency } = useCurrency();
  
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Financial Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of your spending and categories</p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-sm text-slate-600">
          Displaying in <span className="font-semibold text-sky-600">{CURRENCY_SYMBOLS[currency]} {currency}</span>
        </div>
      </div>
      <Dashboard />
    </div>
  );
}