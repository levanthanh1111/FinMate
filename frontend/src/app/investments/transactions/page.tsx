'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { investmentAssetApi, investmentPortfolioApi, investmentReportApi, investmentTransactionApi } from '@/lib/api';
import { formatCurrency } from '@/lib/currencyService';

export default function InvestmentTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [reportSummary, setReportSummary] = useState<any | null>(null);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    portfolioId: '',
    assetId: '',
    type: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    const preload = async () => {
      try {
        const [portfolioData, assetData] = await Promise.all([
          investmentPortfolioApi.getAllPortfolios(),
          investmentAssetApi.getAllAssets()
        ]);
        setPortfolios(portfolioData);
        setAssets(assetData);
      } catch (error) {
        console.error('Error loading filter data:', error);
      }
    };

    preload();
    fetchTransactions();
  }, []);

  const fetchTransactions = async (nextFilter = filter) => {
    try {
      setLoading(true);
      const request: { portfolioId?: number; assetId?: number; type?: string; startDate?: string; endDate?: string } = {};

      if (nextFilter.portfolioId) {
        request.portfolioId = parseInt(nextFilter.portfolioId, 10);
      }

      if (nextFilter.assetId) {
        request.assetId = parseInt(nextFilter.assetId, 10);
      }

      if (nextFilter.type) {
        request.type = nextFilter.type;
      }

      if (nextFilter.startDate) {
        request.startDate = nextFilter.startDate;
      }

      if (nextFilter.endDate) {
        request.endDate = nextFilter.endDate;
      }

      const [rows, summary] = await Promise.all([
        investmentReportApi.getTransactionReportRows(request),
        investmentReportApi.getTransactionReportSummary(request)
      ]);
      setTransactions(rows);
      setReportSummary(summary);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      try {
        await investmentTransactionApi.deleteTransaction(id);
        setTransactions((prev) => prev.filter((item) => item.transactionId !== id));
        fetchTransactions();
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTransactions();
  };

  const resetFilters = () => {
    const reset = {
      portfolioId: '',
      assetId: '',
      type: '',
      startDate: '',
      endDate: ''
    };
    setFilter(reset);
    fetchTransactions(reset);
  };

  const portfolioById = useMemo(() => Object.fromEntries(portfolios.map((item: any) => [item.id, item])), [portfolios]);
  const assetById = useMemo(() => Object.fromEntries(assets.map((item: any) => [item.id, item])), [assets]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Investment Transactions</h1>
          <p className="text-slate-500 mt-1">Track buy and sell activity</p>
        </div>
        <Link href="/investments/transactions/add" className="btn btn-primary shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Transaction
        </Link>
      </div>

      <div className="card-static">
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-500">Transactions</p>
            <p className="text-lg font-semibold text-slate-900">{reportSummary?.transactionCount ?? 0}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-500">Total Buy</p>
            <p className="text-lg font-semibold text-slate-900 tabular-nums">{formatCurrency(parseFloat(reportSummary?.totalBuyAmount || 0), 'VND')}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-500">Total Sell</p>
            <p className="text-lg font-semibold text-slate-900 tabular-nums">{formatCurrency(parseFloat(reportSummary?.totalSellAmount || 0), 'VND')}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-500">Fees</p>
            <p className="text-lg font-semibold text-slate-900 tabular-nums">{formatCurrency(parseFloat(reportSummary?.totalFees || 0), 'VND')}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-500">Taxes</p>
            <p className="text-lg font-semibold text-slate-900 tabular-nums">{formatCurrency(parseFloat(reportSummary?.totalTaxes || 0), 'VND')}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-500">Realized P/L</p>
            <p className={`text-lg font-semibold tabular-nums ${parseFloat(reportSummary?.totalRealizedProfitLoss || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatCurrency(parseFloat(reportSummary?.totalRealizedProfitLoss || 0), 'VND')}
            </p>
          </div>
        </div>
      </div>

      <div className="card-static">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Filter</h2>
        <form onSubmit={applyFilters} className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <label htmlFor="portfolioId" className="form-label">Portfolio</label>
            <select id="portfolioId" name="portfolioId" className="form-input" value={filter.portfolioId} onChange={handleFilterChange}>
              <option value="">All</option>
              {portfolios.map((portfolio: any) => (
                <option key={portfolio.id} value={portfolio.id}>{portfolio.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="assetId" className="form-label">Asset</label>
            <select id="assetId" name="assetId" className="form-input" value={filter.assetId} onChange={handleFilterChange}>
              <option value="">All</option>
              {assets.map((asset: any) => (
                <option key={asset.id} value={asset.id}>{asset.symbol}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="type" className="form-label">Type</label>
            <select id="type" name="type" className="form-input" value={filter.type} onChange={handleFilterChange}>
              <option value="">All</option>
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
            </select>
          </div>

          <div>
            <label htmlFor="startDate" className="form-label">Start Date</label>
            <input id="startDate" name="startDate" type="date" className="form-input" value={filter.startDate} onChange={handleFilterChange} />
          </div>

          <div>
            <label htmlFor="endDate" className="form-label">End Date</label>
            <input id="endDate" name="endDate" type="date" className="form-input" value={filter.endDate} onChange={handleFilterChange} />
          </div>

          <div className="flex items-end gap-2">
            <button type="submit" className="btn btn-primary">Apply</button>
            <button type="button" className="btn btn-secondary" onClick={resetFilters}>Reset</button>
          </div>
        </form>
      </div>

      <div className="card-static">
        {loading ? (
          <div className="space-y-3 py-8">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="skeleton h-12 w-full" />
            ))}
          </div>
        ) : transactions.length > 0 ? (
          <div className="table-container">
            <table className="table-default">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Date</th>
                  <th className="table-header-cell">Portfolio</th>
                  <th className="table-header-cell">Asset</th>
                  <th className="table-header-cell">Type</th>
                  <th className="table-header-cell text-right">Quantity</th>
                  <th className="table-header-cell text-right">Unit Price</th>
                  <th className="table-header-cell text-right">Net Cash Flow</th>
                  <th className="table-header-cell text-right">Realized P/L</th>
                  <th className="table-header-cell text-right">Total</th>
                  <th className="table-header-cell text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {transactions.map((transaction: any) => {
                  const asset = assetById[transaction.assetId];
                  const total = (parseFloat(transaction.quantity) || 0) * (parseFloat(transaction.unitPrice) || 0);
                  return (
                    <tr key={transaction.transactionId} className="table-row">
                      <td className="table-cell">{new Date(transaction.transactionDate).toLocaleDateString()}</td>
                      <td className="table-cell">{portfolioById[transaction.portfolioId]?.name || `Portfolio ${transaction.portfolioId}`}</td>
                      <td className="table-cell font-medium text-slate-800">{asset?.symbol || `Asset ${transaction.assetId}`}</td>
                      <td className="table-cell">
                        <span className={`inline-flex px-2 py-1 rounded-md text-xs font-semibold ${transaction.type === 'BUY' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className="table-cell text-right tabular-nums">{Number(transaction.quantity || 0).toLocaleString()}</td>
                      <td className="table-cell text-right tabular-nums">{formatCurrency(parseFloat(transaction.unitPrice || 0), transaction.currency || 'VND')}</td>
                      <td className={`table-cell text-right tabular-nums ${parseFloat(transaction.netCashFlow || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatCurrency(parseFloat(transaction.netCashFlow || 0), transaction.currency || 'VND')}
                      </td>
                      <td className={`table-cell text-right tabular-nums ${parseFloat(transaction.realizedProfitLoss || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatCurrency(parseFloat(transaction.realizedProfitLoss || 0), transaction.currency || 'VND')}
                      </td>
                      <td className="table-cell text-right tabular-nums">{formatCurrency(total, transaction.currency || 'VND')}</td>
                      <td className="table-cell text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/investments/transactions/edit/${transaction.transactionId}`} className="btn btn-ghost py-1.5 px-2 text-sm">Edit</Link>
                          <button
                            onClick={() => handleDeleteTransaction(transaction.transactionId)}
                            className="btn btn-ghost py-1.5 px-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-slate-600 font-medium">No transactions found</p>
            <p className="text-slate-500 text-sm mt-1">Record buy/sell activity to build your investment history</p>
            <Link href="/investments/transactions/add" className="btn btn-primary mt-4 inline-flex">Add Transaction</Link>
          </div>
        )}
      </div>
    </div>
  );
}
