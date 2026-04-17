'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { investmentAssetApi, investmentHoldingApi, investmentPortfolioApi, investmentReportApi, investmentTransactionApi } from '@/lib/api';
import { convertCurrency, formatCompactCurrency, formatCurrency } from '@/lib/currencyService';
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
  const [convertedSummary, setConvertedSummary] = useState({
    totalMarketValue: 0,
    totalCost: 0,
    totalUnrealizedGainLoss: 0,
    realizedProfitLossInPeriod: 0,
  });
  const [convertedHoldingValues, setConvertedHoldingValues] = useState<Record<string, { unrealizedGainLoss: number; marketValue: number }>>({});
  const [convertedTransactionTotals, setConvertedTransactionTotals] = useState<Record<number, number>>({});

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
          investmentReportApi.getOverview({ startDate: monthStart, endDate: monthEnd }),
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
  const latestTransaction = recentTransactions[0];

  useEffect(() => {
    const convertInvestmentValues = async () => {
      const nextSummary = {
        totalMarketValue: await convertCurrency(parseFloat(summary?.totalMarketValue || 0), 'VND', currency),
        totalCost: await convertCurrency(parseFloat(summary?.totalCost || 0), 'VND', currency),
        totalUnrealizedGainLoss: await convertCurrency(parseFloat(summary?.totalUnrealizedGainLoss || 0), 'VND', currency),
        realizedProfitLossInPeriod: await convertCurrency(parseFloat(overviewReport?.realizedProfitLossInPeriod || 0), 'VND', currency),
      };

      const holdingEntries = await Promise.all(
        holdings.map(async (holding: any) => {
          const key = `${holding.portfolioId}-${holding.assetId}`;
          return [
            key,
            {
              unrealizedGainLoss: await convertCurrency(parseFloat(holding.unrealizedGainLoss || 0), 'VND', currency),
              marketValue: await convertCurrency(parseFloat(holding.marketValue || 0), 'VND', currency),
            },
          ] as const;
        }),
      );

      const transactionEntries = await Promise.all(
        recentTransactions.map(async (transaction: any) => {
          const total = (parseFloat(transaction.quantity) || 0) * (parseFloat(transaction.unitPrice) || 0);
          const converted = await convertCurrency(total, transaction.currency || 'VND', currency);
          return [transaction.id, converted] as const;
        }),
      );

      setConvertedSummary(nextSummary);
      setConvertedHoldingValues(Object.fromEntries(holdingEntries));
      setConvertedTransactionTotals(Object.fromEntries(transactionEntries));
    };

    convertInvestmentValues();
  }, [currency, summary, overviewReport, holdings, recentTransactions]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="editorial-panel">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Investments</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">Investments</h2>
            </div>
            <Link href="/investments/transactions/add" className="btn btn-primary">New Trade</Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-[1.75rem] bg-[linear-gradient(145deg,rgba(0,64,161,0.98)_0%,rgba(0,86,210,0.96)_100%)] p-6 text-white shadow-[0_22px_50px_rgba(0,86,210,0.24)] xl:col-span-2">
              <p className="eyebrow !text-blue-100">Investment Net Worth</p>
              <p className="mt-4 whitespace-nowrap font-[family:var(--font-manrope)] text-4xl font-semibold tracking-[-0.06em] tabular-nums md:text-5xl xl:text-6xl">
                {formatCompactCurrency(convertedSummary.totalMarketValue, currency)}
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-blue-100/80">Total Cost</p>
                  <p className="mt-2 whitespace-nowrap text-lg font-semibold tabular-nums">{formatCompactCurrency(convertedSummary.totalCost, currency)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-blue-100/80">This Month Realized P/L</p>
                  <p className="mt-2 whitespace-nowrap text-lg font-semibold tabular-nums">{formatCompactCurrency(convertedSummary.realizedProfitLossInPeriod, currency)}</p>
                </div>
              </div>
            </div>

            <div className="editorial-subpanel">
              <p className="eyebrow">Open Holdings</p>
              <p className="mt-4 font-[family:var(--font-manrope)] text-4xl font-semibold tracking-[-0.05em] text-slate-900">
                {summary?.holdingsCount ?? 0}
              </p>
            </div>

            <div className="editorial-subpanel">
              <p className="eyebrow">Unrealized Gain/Loss</p>
              <p className={`mt-4 whitespace-nowrap font-[family:var(--font-manrope)] text-2xl font-semibold tracking-[-0.05em] tabular-nums lg:text-3xl ${convertedSummary.totalUnrealizedGainLoss >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatCompactCurrency(convertedSummary.totalUnrealizedGainLoss, currency)}
              </p>
            </div>

            <div className="editorial-subpanel">
              <p className="eyebrow">Portfolios</p>
              <p className="mt-4 font-[family:var(--font-manrope)] text-4xl font-semibold tracking-[-0.05em] text-slate-900">
                {portfolios.length}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="editorial-panel bg-[linear-gradient(180deg,rgba(243,244,245,0.92)_0%,rgba(255,255,255,0.92)_100%)]">
            <p className="eyebrow">Quick Links</p>
            <div className="mt-4 grid gap-3">
              <Link href="/investments/portfolios" className="editorial-subpanel transition-transform hover:translate-y-[-1px]">
                <p className="text-lg font-semibold text-slate-900">Portfolios</p>
              </Link>
              <Link href="/investments/assets" className="editorial-subpanel transition-transform hover:translate-y-[-1px]">
                <p className="text-lg font-semibold text-slate-900">Assets</p>
              </Link>
              <Link href="/investments/prices" className="editorial-subpanel transition-transform hover:translate-y-[-1px]">
                <p className="text-lg font-semibold text-slate-900">Latest Prices</p>
              </Link>
              <Link href="/investments/reports" className="editorial-subpanel transition-transform hover:translate-y-[-1px]">
                <p className="text-lg font-semibold text-slate-900">Reports</p>
              </Link>
            </div>
          </div>

          <div className="editorial-panel">
            <p className="eyebrow">Latest Trade</p>
            {latestTransaction ? (
              <div className="mt-3 space-y-2">
                <p className="text-xl font-semibold text-slate-900">{assetById[latestTransaction.assetId]?.symbol || `Asset ${latestTransaction.assetId}`}</p>
                <p className="text-sm text-slate-500">
                  {portfolioById[latestTransaction.portfolioId]?.name || `Portfolio ${latestTransaction.portfolioId}`} • {latestTransaction.type} • {new Date(latestTransaction.transactionDate).toLocaleDateString()}
                </p>
                <p className="font-[family:var(--font-manrope)] text-2xl font-semibold tracking-[-0.04em] text-slate-900">
                  {formatCurrency(convertedTransactionTotals[latestTransaction.id] ?? 0, currency)}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">No recent trade activity yet.</p>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="editorial-panel">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Current Holdings</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">Positions snapshot</h2>
            </div>
            <Link href="/investments/transactions" className="btn btn-secondary">
              Manage
            </Link>
          </div>

          {loading ? (
            <div className="mt-6 space-y-3">
              {[1, 2, 3, 4].map((item) => <div key={item} className="skeleton h-16 rounded-[1.5rem]" />)}
            </div>
          ) : holdings.length === 0 ? (
            <div className="mt-6 rounded-[1.5rem] bg-slate-100/70 px-5 py-12 text-center text-slate-500">
              No holdings yet. Add a buy transaction to start tracking.
            </div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-[1.5rem] bg-white">
              {holdings.slice(0, 8).map((holding: any) => {
                const asset = assetById[holding.assetId];
                const symbol = asset?.symbol || `Asset ${holding.assetId}`;
                return (
                  <div key={`${holding.portfolioId}-${holding.assetId}`} className="grid gap-3 border-b border-slate-100/80 px-5 py-4 last:border-b-0 md:grid-cols-[0.95fr_0.8fr_0.9fr_0.9fr] md:items-center">
                    <div>
                      <p className="font-medium text-slate-900">{symbol}</p>
                      <p className="mt-1 text-sm text-slate-500">{portfolioById[holding.portfolioId]?.name || `Portfolio ${holding.portfolioId}`}</p>
                    </div>
                    <p className="text-sm text-slate-600 md:text-right">{Number(holding.quantityHeld || 0).toLocaleString()}</p>
                    <p className={`font-medium md:text-right ${parseFloat(holding.unrealizedGainLoss || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatCurrency(convertedHoldingValues[`${holding.portfolioId}-${holding.assetId}`]?.unrealizedGainLoss ?? 0, currency)}
                    </p>
                    <p className="font-[family:var(--font-manrope)] font-semibold text-slate-900 md:text-right">
                      {formatCurrency(convertedHoldingValues[`${holding.portfolioId}-${holding.assetId}`]?.marketValue ?? 0, currency)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="editorial-panel">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Recent Transactions</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">Latest trade activity</h2>
            </div>
            <Link href="/investments/transactions/add" className="btn btn-secondary">
              Add transaction
            </Link>
          </div>

          {loading ? (
            <div className="mt-6 space-y-3">
              {[1, 2, 3, 4].map((item) => <div key={item} className="skeleton h-16 rounded-[1.5rem]" />)}
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="mt-6 rounded-[1.5rem] bg-slate-100/70 px-5 py-12 text-center text-slate-500">
              No transactions yet.
            </div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-[1.5rem] bg-white">
              {recentTransactions.map((transaction: any) => {
                const asset = assetById[transaction.assetId];
                const amount = (parseFloat(transaction.quantity) || 0) * (parseFloat(transaction.unitPrice) || 0);
                return (
                  <div key={transaction.id} className="grid gap-3 border-b border-slate-100/80 px-5 py-4 last:border-b-0 md:grid-cols-[0.8fr_1fr_0.7fr_0.8fr] md:items-center">
                    <p className="text-sm text-slate-500">{new Date(transaction.transactionDate).toLocaleDateString()}</p>
                    <p className="font-medium text-slate-900">{asset?.symbol || `Asset ${transaction.assetId}`}</p>
                    <p className={`text-sm font-semibold ${transaction.type === 'BUY' ? 'text-emerald-700' : 'text-amber-700'}`}>{transaction.type}</p>
                    <p className="font-[family:var(--font-manrope)] font-semibold text-slate-900 md:text-right">{formatCurrency(convertedTransactionTotals[transaction.id] ?? 0, currency)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
