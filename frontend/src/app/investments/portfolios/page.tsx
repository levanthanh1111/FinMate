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

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Investment Portfolios</h1>
          <p className="text-slate-500 mt-1">Organize investments by account or strategy</p>
        </div>
        <Link href="/investments/portfolios/add" className="btn btn-primary shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Portfolio
        </Link>
      </div>

      <div className="card-static">
        {loading ? (
          <div className="space-y-3 py-8">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="skeleton h-12 w-full" />
            ))}
          </div>
        ) : portfolios.length > 0 ? (
          <div className="table-container">
            <table className="table-default">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Name</th>
                  <th className="table-header-cell">Institution</th>
                  <th className="table-header-cell">Base Currency</th>
                  <th className="table-header-cell">Description</th>
                  <th className="table-header-cell text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {portfolios.map((portfolio: any) => (
                  <tr key={portfolio.id} className="table-row">
                    <td className="table-cell font-medium text-slate-800">{portfolio.name}</td>
                    <td className="table-cell">{portfolio.institution || '—'}</td>
                    <td className="table-cell">{portfolio.baseCurrency}</td>
                    <td className="table-cell text-slate-500">{portfolio.description || '—'}</td>
                    <td className="table-cell text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/investments/portfolios/edit/${portfolio.id}`} className="btn btn-ghost py-1.5 px-2 text-sm">Edit</Link>
                        <button
                          onClick={() => handleDeletePortfolio(portfolio.id)}
                          className="btn btn-ghost py-1.5 px-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-slate-600 font-medium">No portfolios yet</p>
            <p className="text-slate-500 text-sm mt-1">Add your first portfolio to start tracking investments</p>
            <Link href="/investments/portfolios/add" className="btn btn-primary mt-4 inline-flex">Add Portfolio</Link>
          </div>
        )}
      </div>
    </div>
  );
}
