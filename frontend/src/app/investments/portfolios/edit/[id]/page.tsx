'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import InvestmentPortfolioForm from '@/components/InvestmentPortfolioForm';
import { investmentPortfolioApi } from '@/lib/api';

export default function EditInvestmentPortfolioPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const data = await investmentPortfolioApi.getPortfolioById(parseInt(params.id, 10));
        setPortfolio(data);
      } catch (error) {
        console.error('Error loading portfolio:', error);
        setMessage({ text: 'Failed to load portfolio.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [params.id]);

  const handleSubmit = async (data: any) => {
    try {
      await investmentPortfolioApi.updatePortfolio(parseInt(params.id, 10), data);
      setMessage({ text: 'Portfolio updated successfully!', type: 'success' });
      setTimeout(() => {
        router.push('/investments/portfolios');
      }, 1500);
    } catch (error) {
      console.error('Error updating portfolio:', error);
      setMessage({ text: 'Failed to update portfolio. Please try again.', type: 'error' });
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/investments/portfolios" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-sky-600 font-medium">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Portfolios
      </Link>

      <section className="editorial-panel">
        <p className="eyebrow">Edit Portfolio</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-slate-900 md:text-4xl">{loading ? 'Portfolio' : portfolio?.name || 'Portfolio'}</h1>
      </section>

      {message.text && (
        <div className={`p-4 mb-6 rounded-xl ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="editorial-panel">
        {loading ? (
          <div className="space-y-4 py-8">
            <div className="skeleton h-10 w-full" />
            <div className="skeleton h-10 w-full" />
            <div className="skeleton h-10 w-full" />
          </div>
        ) : portfolio ? (
          <InvestmentPortfolioForm initialData={portfolio} onSubmit={handleSubmit} isEditing={true} />
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-600 mb-2">Portfolio not found</p>
            <Link href="/investments/portfolios" className="link">Return to portfolios</Link>
          </div>
        )}
      </div>
    </div>
  );
}
