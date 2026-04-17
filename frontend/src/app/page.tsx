'use client';

import Dashboard from '@/components/Dashboard';
import { useCurrency } from '@/lib/CurrencyContext';
import { getCurrencyDisplay } from '@/lib/currencyService';

export default function Home() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <Dashboard />
    </div>
  );
}
