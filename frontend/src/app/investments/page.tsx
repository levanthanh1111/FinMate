'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { investmentAssetApi, investmentHoldingApi, investmentPortfolioApi, investmentReportApi, investmentTransactionApi } from '@/lib/api';
import { formatCurrency } from '@/lib/currencyService';
import { useCurrency } from '@/lib/CurrencyContext';

export default function InvestmentsPage() {
  const { currency } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any | null>(null);
  const [holdings, setHoldings] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [overviewReport, setOverviewReport] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
        const [summaryData, holdingsData, transactionsData, portfolioData, assetData, overviewData] = await Promise.all([
          investmentHoldingApi.getHoldingsSummary(),
          investmentHoldingApi.getHoldings(),
          investmentTransactionApi.getAllTransactions(),
          investmentPortfolioApi.getAllPortfolios(),
          investmentAssetApi.getAllAssets(),
          investmentReportApi.getOverview({ startDate: monthStart, endDate: monthEnd })
        ]);

        setSummary(summaryData);
        setHoldings(holdingsData);
        setTransactions(transactionsData);
        setPortfolios(portfolioData);
        setAssets(assetData);
        setOverviewReport(overviewData);
      } catch (error) {
        console.error('Error loading investments data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
      .slice(0, 8);
  }, [transactions]);

  const portfolioById = useMemo(() => Object.fromEntries(portfolios.map((item: any) => [item.id, item])), [portfolios]);
  const assetById = useMemo(() => Object.fromEntries(assets.map((item: any) => [item.id, item])), [assets]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Investments</h1>
          <p className="text-slate-500 mt-1">Manage portfolios, assets, and transactions</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/investments/portfolios" className="btn btn-secondary">Portfolios</Link>
          <Link href="/investments/assets" className="btn btn-secondary">Assets</Link>
          <Link href="/investments/prices" className="btn btn-secondary">Latest Prices</Link>
          <Link href="/investments/reports" className="btn btn-secondary">Reports</Link>
          <Link href="/investments/transactions" className="btn btn-primary">Transactions</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <div className="card-static">
          <p className="text-sm text-slate-500">Total Cost</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {formatCurrency(parseFloat(summary?.totalCost || 0), currency)}
          </p>
        </div>
        <div className="card-static">
          <p className="text-sm text-slate-500">Market Value</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {formatCurrency(parseFloat(summary?.totalMarketValue || 0), currency)}
          </p>
        </div>
        <div className="card-static">
          <p className="text-sm text-slate-500">Unrealized Gain/Loss</p>
          <p className={`text-2xl font-bold mt-1 ${parseFloat(summary?.totalUnrealizedGainLoss || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatCurrency(parseFloat(summary?.totalUnrealizedGainLoss || 0), currency)}
          </p>
        </div>
        <div className="card-static">
          <p className="text-sm text-slate-500">Open Holdings</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{summary?.holdingsCount ?? 0}</p>
        </div>
        <div className="card-static">
          <p className="text-sm text-slate-500">Realized P/L (This Month)</p>
          <p className={`text-2xl font-bold mt-1 ${parseFloat(overviewReport?.realizedProfitLossInPeriod || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatCurrency(parseFloat(overviewReport?.realizedProfitLossInPeriod || 0), currency)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card-static">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Current Holdings</h2>
            <Link href="/investments/transactions" className="link text-sm">Manage</Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => <div key={item} className="skeleton h-10 w-full" />)}
            </div>
          ) : holdings.length === 0 ? (
            <p className="text-sm text-slate-500">No holdings yet. Add a buy transaction to start tracking.</p>
          ) : (
            <div className="table-container">
              <table className="table-default">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">Asset</th>
                    <th className="table-header-cell text-right">Quantity</th>
                    <th className="table-header-cell text-right">Average Cost</th>
                    <th className="table-header-cell text-right">Unrealized P/L</th>
                    <th className="table-header-cell text-right">Market Value</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {holdings.slice(0, 10).map((holding: any) => {
                    const asset = assetById[holding.assetId];
                    const symbol = asset?.symbol || `Asset ${holding.assetId}`;
                    return (
                      <tr key={`${holding.portfolioId}-${holding.assetId}`} className="table-row">
                        <td className="table-cell">
                          <div className="font-medium text-slate-800">{symbol}</div>
                          <div className="text-xs text-slate-500">{portfolioById[holding.portfolioId]?.name || `Portfolio ${holding.portfolioId}`}</div>
                        </td>
                        <td className="table-cell text-right tabular-nums">{Number(holding.quantityHeld || 0).toLocaleString()}</td>
                        <td className="table-cell text-right font-medium tabular-nums">{formatCurrency(parseFloat(holding.averageCost || 0), currency)}</td>
                        <td className={`table-cell text-right font-medium tabular-nums ${parseFloat(holding.unrealizedGainLoss || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {formatCurrency(parseFloat(holding.unrealizedGainLoss || 0), currency)}
                        </td>
                        <td className="table-cell text-right font-medium tabular-nums">{formatCurrency(parseFloat(holding.marketValue || 0), currency)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card-static">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Recent Transactions</h2>
            <Link href="/investments/transactions/add" className="link text-sm">Add transaction</Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => <div key={item} className="skeleton h-10 w-full" />)}
            </div>
          ) : recentTransactions.length === 0 ? (
            <p className="text-sm text-slate-500">No transactions yet.</p>
          ) : (
            <div className="table-container">
              <table className="table-default">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">Date</th>
                    <th className="table-header-cell">Asset</th>
                    <th className="table-header-cell">Type</th>
                    <th className="table-header-cell text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {recentTransactions.map((transaction: any) => {
                    const asset = assetById[transaction.assetId];
                    const amount = (parseFloat(transaction.quantity) || 0) * (parseFloat(transaction.unitPrice) || 0);
                    return (
                      <tr key={transaction.id} className="table-row">
                        <td className="table-cell">{new Date(transaction.transactionDate).toLocaleDateString()}</td>
                        <td className="table-cell font-medium text-slate-800">{asset?.symbol || `Asset ${transaction.assetId}`}</td>
                        <td className="table-cell">
                          <span className={`inline-flex px-2 py-1 rounded-md text-xs font-semibold ${transaction.type === 'BUY' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className="table-cell text-right tabular-nums">{formatCurrency(amount, currency)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
