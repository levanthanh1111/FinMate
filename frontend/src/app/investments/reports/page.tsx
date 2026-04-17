'use client';

import { useEffect, useMemo, useState } from 'react';
import { investmentAssetApi, investmentPortfolioApi, investmentReportApi } from '@/lib/api';
import { useCurrency } from '@/lib/CurrencyContext';
import { convertCurrency, formatCompactCurrency, formatCurrency } from '@/lib/currencyService';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function InvestmentReportsPage() {
  const { currency } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [monthlyRows, setMonthlyRows] = useState<any[]>([]);
  const [convertedRows, setConvertedRows] = useState<any[]>([]);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [filter, setFilter] = useState({
    portfolioId: '',
    assetId: '',
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
        console.error('Error loading investment report filters:', error);
      }
    };

    preload();
    fetchMonthlyProfitLoss();
  }, []);

  const fetchMonthlyProfitLoss = async (nextFilter = filter) => {
    try {
      setLoading(true);
      const request: { portfolioId?: number; assetId?: number; startDate?: string; endDate?: string } = {};

      if (nextFilter.portfolioId) request.portfolioId = parseInt(nextFilter.portfolioId, 10);
      if (nextFilter.assetId) request.assetId = parseInt(nextFilter.assetId, 10);
      if (nextFilter.startDate) request.startDate = nextFilter.startDate;
      if (nextFilter.endDate) request.endDate = nextFilter.endDate;

      const rows = await investmentReportApi.getMonthlyProfitLoss(request);
      setMonthlyRows(rows);
    } catch (error) {
      console.error('Error loading monthly profit/loss:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = (event: React.FormEvent) => {
    event.preventDefault();
    fetchMonthlyProfitLoss();
  };

  const resetFilters = () => {
    const reset = { portfolioId: '', assetId: '', startDate: '', endDate: '' };
    setFilter(reset);
    fetchMonthlyProfitLoss(reset);
  };

  const totals = useMemo(() => {
    return convertedRows.reduce((acc, row) => {
      acc.realized += parseFloat(row.realizedProfitLoss || 0);
      acc.buy += parseFloat(row.buyAmount || 0);
      acc.sell += parseFloat(row.sellAmount || 0);
      return acc;
    }, { realized: 0, buy: 0, sell: 0 });
  }, [convertedRows]);

  useEffect(() => {
    const convertRows = async () => {
      const rows = await Promise.all(
        monthlyRows.map(async (row: any) => ({
          ...row,
          buyAmount: await convertCurrency(parseFloat(row.buyAmount || 0), 'VND', currency),
          sellAmount: await convertCurrency(parseFloat(row.sellAmount || 0), 'VND', currency),
          fees: await convertCurrency(parseFloat(row.fees || 0), 'VND', currency),
          taxes: await convertCurrency(parseFloat(row.taxes || 0), 'VND', currency),
          realizedProfitLoss: await convertCurrency(parseFloat(row.realizedProfitLoss || 0), 'VND', currency),
        })),
      );
      setConvertedRows(rows);
    };

    convertRows();
  }, [monthlyRows, currency]);

  const lineData = {
    labels: convertedRows.map((row: any) => `${row.month}/${row.year}`),
    datasets: [
      {
        label: 'Monthly Realized P/L',
        data: convertedRows.map((row: any) => parseFloat(row.realizedProfitLoss || 0)),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.18)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const latestMonthlyValue = convertedRows.length > 0 ? parseFloat(convertedRows[convertedRows.length - 1].realizedProfitLoss || 0) : 0;

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-6">
          <div className="editorial-panel">
            <p className="eyebrow">Investment Reports</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Investment Reports</h2>
            <form onSubmit={applyFilters} className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
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
                <label htmlFor="startDate" className="form-label">Start Date</label>
                <input id="startDate" name="startDate" type="date" className="form-input" value={filter.startDate} onChange={handleFilterChange} />
              </div>

              <div>
                <label htmlFor="endDate" className="form-label">End Date</label>
                <input id="endDate" name="endDate" type="date" className="form-input" value={filter.endDate} onChange={handleFilterChange} />
              </div>

              <div className="md:col-span-2 flex gap-3">
                <button type="submit" className="btn btn-primary">Apply</button>
                <button type="button" className="btn btn-secondary" onClick={resetFilters}>Reset</button>
              </div>
            </form>
          </div>

          <div className="editorial-panel bg-[linear-gradient(180deg,rgba(243,244,245,0.92)_0%,rgba(255,255,255,0.92)_100%)]">
            <p className="eyebrow">Totals</p>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
              <div className="editorial-subpanel">
                <p className="eyebrow">Buy</p>
                <p className="mt-4 break-words font-[family:var(--font-manrope)] text-xl font-semibold leading-tight tracking-[-0.05em] text-slate-900 tabular-nums lg:text-2xl 2xl:text-3xl">{formatCompactCurrency(totals.buy, currency)}</p>
              </div>
              <div className="editorial-subpanel">
                <p className="eyebrow">Sell</p>
                <p className="mt-4 break-words font-[family:var(--font-manrope)] text-xl font-semibold leading-tight tracking-[-0.05em] text-slate-900 tabular-nums lg:text-2xl 2xl:text-3xl">{formatCompactCurrency(totals.sell, currency)}</p>
              </div>
              <div className="editorial-subpanel">
                <p className="eyebrow">Months</p>
                <p className="mt-4 font-[family:var(--font-manrope)] text-xl font-semibold leading-tight tracking-[-0.05em] text-slate-900 tabular-nums lg:text-2xl 2xl:text-3xl">{monthlyRows.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="editorial-panel">
          <p className="eyebrow">Trend Canvas</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">Monthly realized P/L trend</h2>
          {loading ? (
            <div className="mt-6 skeleton h-80 rounded-[1.5rem]" />
          ) : convertedRows.length > 0 ? (
            <div className="mt-6 h-80 rounded-[1.5rem] bg-white p-4">
              <Line data={lineData} options={{ maintainAspectRatio: false }} />
            </div>
          ) : (
            <div className="mt-6 rounded-[1.5rem] bg-slate-100/70 px-5 py-16 text-center text-slate-500">No monthly profit/loss data found.</div>
          )}
        </div>
      </section>

      <section className="editorial-panel">
        <div>
          <p className="eyebrow">Monthly Details</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">Expanded monthly breakdown</h2>
        </div>

        {loading ? (
          <div className="mt-6 space-y-3 py-8">
            {[1, 2, 3, 4].map((item) => <div key={item} className="skeleton h-12 w-full" />)}
          </div>
        ) : monthlyRows.length > 0 ? (
          <div className="mt-6 table-container">
            <table className="table-default">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Month</th>
                  <th className="table-header-cell text-right">Buy</th>
                  <th className="table-header-cell text-right">Sell</th>
                  <th className="table-header-cell text-right">Fees</th>
                  <th className="table-header-cell text-right">Taxes</th>
                  <th className="table-header-cell text-right">Realized P/L</th>
                  <th className="table-header-cell text-right">Transactions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {convertedRows.map((row: any) => (
                  <tr key={`${row.year}-${row.month}`} className="table-row">
                    <td className="table-cell">{row.month}/{row.year}</td>
                    <td className="table-cell text-right tabular-nums">{formatCurrency(parseFloat(row.buyAmount || 0), currency)}</td>
                    <td className="table-cell text-right tabular-nums">{formatCurrency(parseFloat(row.sellAmount || 0), currency)}</td>
                    <td className="table-cell text-right tabular-nums">{formatCurrency(parseFloat(row.fees || 0), currency)}</td>
                    <td className="table-cell text-right tabular-nums">{formatCurrency(parseFloat(row.taxes || 0), currency)}</td>
                    <td className={`table-cell text-right tabular-nums ${parseFloat(row.realizedProfitLoss || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatCurrency(parseFloat(row.realizedProfitLoss || 0), currency)}
                    </td>
                    <td className="table-cell text-right">{row.transactionCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-6 text-center py-16 text-slate-500">No monthly data available.</div>
        )}
      </section>
    </div>
  );
}
