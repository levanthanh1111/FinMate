'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { investmentAssetApi, investmentPortfolioApi, investmentReportApi, investmentTransactionApi } from '@/lib/api';
import { convertCurrency, formatCompactCurrency, formatCurrency } from '@/lib/currencyService';
import { useCurrency } from '@/lib/CurrencyContext';

export default function InvestmentTransactionsPage() {
  const { currency } = useCurrency();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [reportSummary, setReportSummary] = useState<any | null>(null);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [convertedSummary, setConvertedSummary] = useState({
    totalBuyAmount: 0,
    totalSellAmount: 0,
    totalFees: 0,
    totalTaxes: 0,
    totalRealizedProfitLoss: 0,
  });
  const [convertedTransactionValues, setConvertedTransactionValues] = useState<Record<number, { unitPrice: number; netCashFlow: number; realizedProfitLoss: number; total: number }>>({});
  const [filter, setFilter] = useState({
    portfolioId: '',
    assetId: '',
    type: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    const preload = async () => {
      try {
        const [portfolioData, assetData] = await Promise.all([
          investmentPortfolioApi.getAllPortfolios(),
          investmentAssetApi.getAllAssets(),
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
        investmentReportApi.getTransactionReportSummary(request),
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

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = (event: React.FormEvent) => {
    event.preventDefault();
    fetchTransactions();
  };

  const resetFilters = () => {
    const reset = {
      portfolioId: '',
      assetId: '',
      type: '',
      startDate: '',
      endDate: '',
    };
    setFilter(reset);
    fetchTransactions(reset);
  };

  const portfolioById = useMemo(() => Object.fromEntries(portfolios.map((item: any) => [item.id, item])), [portfolios]);
  const assetById = useMemo(() => Object.fromEntries(assets.map((item: any) => [item.id, item])), [assets]);
  const latestTransaction = transactions[0];

  useEffect(() => {
    const convertTransactionValues = async () => {
      const nextSummary = {
        totalBuyAmount: await convertCurrency(parseFloat(reportSummary?.totalBuyAmount || 0), 'VND', currency),
        totalSellAmount: await convertCurrency(parseFloat(reportSummary?.totalSellAmount || 0), 'VND', currency),
        totalFees: await convertCurrency(parseFloat(reportSummary?.totalFees || 0), 'VND', currency),
        totalTaxes: await convertCurrency(parseFloat(reportSummary?.totalTaxes || 0), 'VND', currency),
        totalRealizedProfitLoss: await convertCurrency(parseFloat(reportSummary?.totalRealizedProfitLoss || 0), 'VND', currency),
      };

      const entries = await Promise.all(
        transactions.map(async (transaction: any) => {
          const total = (parseFloat(transaction.quantity) || 0) * (parseFloat(transaction.unitPrice) || 0);
          const sourceCurrency = transaction.currency || 'VND';
          return [
            transaction.transactionId,
            {
              unitPrice: await convertCurrency(parseFloat(transaction.unitPrice || 0), sourceCurrency, currency),
              netCashFlow: await convertCurrency(parseFloat(transaction.netCashFlow || 0), sourceCurrency, currency),
              realizedProfitLoss: await convertCurrency(parseFloat(transaction.realizedProfitLoss || 0), sourceCurrency, currency),
              total: await convertCurrency(total, sourceCurrency, currency),
            },
          ] as const;
        }),
      );

      setConvertedSummary(nextSummary);
      setConvertedTransactionValues(Object.fromEntries(entries));
    };

    convertTransactionValues();
  }, [reportSummary, transactions, currency]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="editorial-panel">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Transactions</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">Transactions</h2>
            </div>
            <Link href="/investments/transactions/add" className="btn btn-primary">New Trade</Link>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="editorial-subpanel">
              <p className="eyebrow">Total Buy</p>
              <p className="mt-4 whitespace-nowrap font-[family:var(--font-manrope)] text-2xl font-semibold tracking-[-0.05em] text-slate-900 tabular-nums lg:text-3xl">{formatCompactCurrency(convertedSummary.totalBuyAmount, currency)}</p>
            </div>
            <div className="editorial-subpanel">
              <p className="eyebrow">Total Sell</p>
              <p className="mt-4 whitespace-nowrap font-[family:var(--font-manrope)] text-2xl font-semibold tracking-[-0.05em] text-slate-900 tabular-nums lg:text-3xl">{formatCompactCurrency(convertedSummary.totalSellAmount, currency)}</p>
            </div>
            <div className="editorial-subpanel">
              <p className="eyebrow">Fees</p>
              <p className="mt-4 whitespace-nowrap font-[family:var(--font-manrope)] text-2xl font-semibold tracking-[-0.05em] text-slate-900 tabular-nums lg:text-3xl">{formatCompactCurrency(convertedSummary.totalFees, currency)}</p>
            </div>
            <div className="editorial-subpanel">
              <p className="eyebrow">Taxes</p>
              <p className="mt-4 whitespace-nowrap font-[family:var(--font-manrope)] text-2xl font-semibold tracking-[-0.05em] text-slate-900 tabular-nums lg:text-3xl">{formatCompactCurrency(convertedSummary.totalTaxes, currency)}</p>
            </div>
            <div className="editorial-subpanel xl:col-span-2">
              <p className="eyebrow">Realized P/L</p>
              <p className={`mt-4 whitespace-nowrap font-[family:var(--font-manrope)] text-3xl font-semibold tracking-[-0.05em] tabular-nums lg:text-4xl ${convertedSummary.totalRealizedProfitLoss >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatCompactCurrency(convertedSummary.totalRealizedProfitLoss, currency)}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="editorial-panel">
            <p className="eyebrow">Filters</p>
            <form onSubmit={applyFilters} className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
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

          <div className="editorial-panel bg-[linear-gradient(180deg,rgba(243,244,245,0.92)_0%,rgba(255,255,255,0.92)_100%)]">
            <p className="eyebrow">Latest Entry</p>
            {latestTransaction ? (
              <div className="mt-3 space-y-2">
                <p className="text-xl font-semibold text-slate-900">{assetById[latestTransaction.assetId]?.symbol || `Asset ${latestTransaction.assetId}`}</p>
                <p className="text-sm text-slate-500">{portfolioById[latestTransaction.portfolioId]?.name || `Portfolio ${latestTransaction.portfolioId}`} • {latestTransaction.type}</p>
                <p className="font-[family:var(--font-manrope)] text-2xl font-semibold tracking-[-0.04em] text-slate-900">
                  {formatCurrency(convertedTransactionValues[latestTransaction.transactionId]?.total ?? 0, currency)}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">No transaction activity yet.</p>
            )}
          </div>
        </div>
      </section>

      <section className="editorial-panel">
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
                      <td className="table-cell text-right tabular-nums">{formatCurrency(convertedTransactionValues[transaction.transactionId]?.unitPrice ?? 0, currency)}</td>
                      <td className={`table-cell text-right tabular-nums ${parseFloat(transaction.netCashFlow || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatCurrency(convertedTransactionValues[transaction.transactionId]?.netCashFlow ?? 0, currency)}
                      </td>
                      <td className={`table-cell text-right tabular-nums ${parseFloat(transaction.realizedProfitLoss || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatCurrency(convertedTransactionValues[transaction.transactionId]?.realizedProfitLoss ?? 0, currency)}
                      </td>
                      <td className="table-cell text-right tabular-nums">{formatCurrency(convertedTransactionValues[transaction.transactionId]?.total ?? 0, currency)}</td>
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
            <Link href="/investments/transactions/add" className="btn btn-primary mt-4 inline-flex">Add Transaction</Link>
          </div>
        )}
      </section>
    </div>
  );
}
