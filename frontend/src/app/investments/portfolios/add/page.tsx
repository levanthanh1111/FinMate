'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import InvestmentPortfolioForm from '@/components/InvestmentPortfolioForm';
import { investmentPortfolioApi } from '@/lib/api';

export default function AddInvestmentPortfolioPage() {
  const router = useRouter();
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleSubmit = async (data: any) => {
    try {
      await investmentPortfolioApi.createPortfolio(data);
      setMessage({ text: 'Portfolio added successfully!', type: 'success' });
      setTimeout(() => {
        router.push('/investments/portfolios');
      }, 1500);
    } catch (error) {
      console.error('Error adding portfolio:', error);
      setMessage({ text: 'Failed to add portfolio. Please try again.', type: 'error' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/investments/portfolios" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-sky-600 font-medium mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Portfolios
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-2">Add Portfolio</h1>
      <p className="text-slate-500 mb-6">Create a new investment portfolio</p>

      {message.text && (
        <div className={`p-4 mb-6 rounded-xl ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="card-static">
        <InvestmentPortfolioForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
