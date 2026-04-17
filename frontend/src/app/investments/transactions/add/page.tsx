'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import InvestmentTransactionForm from '@/components/InvestmentTransactionForm';
import { investmentTransactionApi } from '@/lib/api';

export default function AddInvestmentTransactionPage() {
  const router = useRouter();
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleSubmit = async (data: any) => {
    try {
      await investmentTransactionApi.createTransaction(data);
      setMessage({ text: 'Transaction added successfully!', type: 'success' });
      setTimeout(() => {
        router.push('/investments/transactions');
      }, 1500);
    } catch (error) {
      console.error('Error adding transaction:', error);
      setMessage({ text: 'Failed to add transaction. Please try again.', type: 'error' });
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/investments/transactions" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-sky-600 font-medium">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Transactions
      </Link>

      <section className="editorial-panel">
        <p className="eyebrow">Add Transaction</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-slate-900 md:text-4xl">New Transaction</h1>
      </section>

      {message.text && (
        <div className={`p-4 mb-6 rounded-xl ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="editorial-panel">
        <InvestmentTransactionForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
