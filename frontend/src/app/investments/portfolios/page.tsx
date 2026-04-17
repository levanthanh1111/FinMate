'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { investmentPortfolioApi } from '@/lib/api';

export default function InvestmentPortfoliosPage() {
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        setLoading(true);
        const data = await investmentPortfolioApi.getAllPortfolios();
        setPortfolios(data);
      } catch (error) {
        console.error('Error fetching portfolios:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolios();
  }, []);

  const handleDeletePortfolio = async (id: number) => {
    if (confirm('Are you sure you want to delete this portfolio?')) {
      try {
        await investmentPortfolioApi.deletePortfolio(id);
        setPortfolios((prev) => prev.filter((item) => item.id !== id));
      } catch (error) {
        console.error('Error deleting portfolio:', error);
      }
    }
  };

  const portfoliosWithInstitution = portfolios.filter((portfolio) => portfolio.institution);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="editorial-panel">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Portfolios</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">Portfolios</h2>
            </div>
            <Link href="/investments/portfolios/add" className="btn btn-primary">New Portfolio</Link>
          </div>

          {loading ? (
            <div className="mt-6 space-y-3 py-8">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="skeleton h-16 rounded-[1.5rem]" />
              ))}
            </div>
          ) : portfolios.length > 0 ? (
            <div className="mt-6 space-y-3">
              {portfolios.map((portfolio: any) => (
                <div key={portfolio.id} className="grid gap-4 rounded-[1.5rem] bg-white px-5 py-5 shadow-[0_10px_30px_rgba(25,28,29,0.04)] md:grid-cols-[0.9fr_1fr_0.6fr_1.2fr_0.7fr] md:items-center">
                  <div>
                    <p className="eyebrow text-[10px] text-slate-400">Name</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{portfolio.name}</p>
                  </div>
                  <div>
                    <p className="eyebrow text-[10px] text-slate-400">Institution</p>
                    <p className="mt-2 text-sm text-slate-500">{portfolio.institution || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="eyebrow text-[10px] text-slate-400">Currency</p>
                    <p className="mt-2 text-sm text-slate-600">{portfolio.baseCurrency}</p>
                  </div>
                  <div>
                    <p className="eyebrow text-[10px] text-slate-400">Description</p>
                    <p className="mt-2 text-sm text-slate-500">{portfolio.description || 'No description added.'}</p>
                  </div>
                  <div className="flex items-center gap-2 md:justify-end">
                    <Link href={`/investments/portfolios/edit/${portfolio.id}`} className="btn btn-ghost px-3 py-2 text-sm">Edit</Link>
                    <button
                      onClick={() => handleDeletePortfolio(portfolio.id)}
                      className="rounded-full px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-slate-600 font-medium">No portfolios yet</p>
              <Link href="/investments/portfolios/add" className="btn btn-primary mt-4 inline-flex">Add Portfolio</Link>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="editorial-panel bg-[linear-gradient(180deg,rgba(243,244,245,0.92)_0%,rgba(255,255,255,0.92)_100%)]">
            <p className="eyebrow">Overview</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="editorial-subpanel">
                <p className="eyebrow">With Institution</p>
                <p className="mt-4 font-[family:var(--font-manrope)] text-4xl font-semibold tracking-[-0.05em] text-slate-900">{portfoliosWithInstitution.length}</p>
              </div>
              <div className="editorial-subpanel">
                <p className="eyebrow">Standalone</p>
                <p className="mt-4 font-[family:var(--font-manrope)] text-4xl font-semibold tracking-[-0.05em] text-slate-900">{portfolios.length - portfoliosWithInstitution.length}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
