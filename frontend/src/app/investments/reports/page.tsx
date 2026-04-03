'use client';

import { useEffect, useMemo, useState } from 'react';
import { investmentAssetApi, investmentPortfolioApi, investmentReportApi } from '@/lib/api';
import { useCurrency } from '@/lib/CurrencyContext';
import { formatCurrency } from '@/lib/currencyService';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function InvestmentReportsPage() {
  const { currency } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [monthlyRows, setMonthlyRows] = useState<any[]>([]);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [filter, setFilter] = useState({
    portfolioId: '',
    assetId: '',
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

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMonthlyProfitLoss();
  };

  const resetFilters = () => {
    const reset = { portfolioId: '', assetId: '', startDate: '', endDate: '' };
    setFilter(reset);
    fetchMonthlyProfitLoss(reset);
  };

  const totals = useMemo(() => {
    return monthlyRows.reduce((acc, row) => {
      acc.realized += parseFloat(row.realizedProfitLoss || 0);
      acc.buy += parseFloat(row.buyAmount || 0);
      acc.sell += parseFloat(row.sellAmount || 0);
      return acc;
    }, { realized: 0, buy: 0, sell: 0 });
  }, [monthlyRows]);

  const lineData = {
    labels: monthlyRows.map((row: any) => `${row.month}/${row.year}`),
    datasets: [
      {
        label: 'Monthly Realized P/L',
        data: monthlyRows.map((row: any) => parseFloat(row.realizedProfitLoss || 0)),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.3)',
        tension: 0.3,
      }
    ]
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Investment Reports</h1>
        <p className="text-slate-500 mt-1">Track monthly realized profit and loss trends</p>
      </div>

      <div className="card-static">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Filters</h2>
        <form onSubmit={applyFilters} className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

          <div className="flex items-end gap-2">
            <button type="submit" className="btn btn-primary">Apply</button>
            <button type="button" className="btn btn-secondary" onClick={resetFilters}>Reset</button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-static">
          <p className="text-sm text-slate-500">Total Realized P/L</p>
          <p className={`text-2xl font-bold mt-1 ${totals.realized >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatCurrency(totals.realized, currency)}
          </p>
        </div>
        <div className="card-static">
          <p className="text-sm text-slate-500">Total Buy Amount</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(totals.buy, currency)}</p>
        </div>
        <div className="card-static">
          <p className="text-sm text-slate-500">Total Sell Amount</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(totals.sell, currency)}</p>
        </div>
      </div>

      <div className="card-static">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Monthly Realized P/L Trend</h2>
        {loading ? (
          <div className="skeleton h-72 w-full" />
        ) : monthlyRows.length > 0 ? (
          <div className="h-72">
            <Line data={lineData} options={{ maintainAspectRatio: false }} />
          </div>
        ) : (
          <div className="text-center py-16 text-slate-500">No monthly profit/loss data found.</div>
        )}
      </div>

      <div className="card-static">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Monthly Details</h2>
        {loading ? (
          <div className="space-y-3 py-8">
            {[1, 2, 3, 4].map((item) => <div key={item} className="skeleton h-12 w-full" />)}
          </div>
        ) : monthlyRows.length > 0 ? (
          <div className="table-container">
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
                {monthlyRows.map((row: any) => (
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
          <div className="text-center py-16 text-slate-500">No monthly data available.</div>
        )}
      </div>
    </div>
  );
}
