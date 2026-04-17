'use client';

import { useState, useEffect } from 'react';
import { expenseApi } from '@/lib/api';
import { useCurrency } from '@/lib/CurrencyContext';
import { convertCurrency, convertVndAmounts, formatCompactCurrency, formatCurrency, getCurrencyDisplay } from '@/lib/currencyService';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

export default function ReportsPage() {
  const { currency, rateSource, rateUpdatedAt } = useCurrency();
  const [activeTab, setActiveTab] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<any>({
    categories: [],
    amounts: [],
    total: 0,
  });
  const [trendData, setTrendData] = useState<any>({
    labels: [],
    amounts: [],
  });
  const [convertedMonthly, setConvertedMonthly] = useState<{ amounts: number[]; total: number }>({ amounts: [], total: 0 });
  const [convertedTrend, setConvertedTrend] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [trendPeriod, setTrendPeriod] = useState(6);

  useEffect(() => {
    if (activeTab === 'monthly') {
      fetchMonthlySummary();
    } else {
      fetchTrendData();
    }
  }, [activeTab, selectedYear, selectedMonth, trendPeriod]);

  useEffect(() => {
    const convertAmounts = async () => {
      const amounts = await convertVndAmounts(monthlyData.amounts, currency);
      const total = await convertCurrency(monthlyData.total, 'VND', currency);
      setConvertedMonthly({ amounts, total });
      const trendAmounts = await convertVndAmounts(trendData.amounts, currency);
      setConvertedTrend(trendAmounts);
    };

    if (monthlyData.amounts.length > 0 || trendData.amounts.length > 0) {
      convertAmounts();
    }
  }, [monthlyData, trendData, currency]);

  const fetchMonthlySummary = async () => {
    try {
      setLoading(true);
      const data = await expenseApi.getMonthlySummary(selectedYear, selectedMonth);

      const categories: string[] = [];
      const amounts: number[] = [];
      let total = 0;

      data.forEach((item: any) => {
        categories.push(item[0]);
        const amount = parseFloat(item[1]);
        amounts.push(amount);
        total += amount;
      });

      setMonthlyData({
        categories,
        amounts,
        total,
      });
    } catch (error) {
      console.error('Error fetching monthly summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendData = async () => {
    try {
      setLoading(true);
      const data = await expenseApi.getSpendingTrends();

      const sortedData = [...data].sort((a, b) => {
        if (a[0] !== b[0]) return a[0] - b[0];
        return a[1] - b[1];
      });

      const filteredData = sortedData.slice(-trendPeriod);

      setTrendData({
        labels: filteredData.map((item: any) => `${item[1]}/${item[0]}`),
        amounts: filteredData.map((item: any) => parseFloat(item[2])),
      });
    } catch (error) {
      console.error('Error fetching trend data:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasConvertedMonthly = convertedMonthly.amounts.length === monthlyData.amounts.length && monthlyData.amounts.length > 0;
  const hasConvertedTrend = convertedTrend.length === trendData.amounts.length && trendData.amounts.length > 0;
  const displayMonthlyAmounts = hasConvertedMonthly ? convertedMonthly.amounts : monthlyData.amounts;
  const displayMonthlyTotal = hasConvertedMonthly ? convertedMonthly.total : monthlyData.total;
  const displayTrendAmounts = hasConvertedTrend ? convertedTrend : trendData.amounts;
  const topMonthlyItems = monthlyData.categories.slice(0, 4).map((category: string, index: number) => ({
    category,
    amount: displayMonthlyAmounts[index] ?? 0,
  }));
  const leadingTrendAmount = displayTrendAmounts.length > 0 ? displayTrendAmounts[displayTrendAmounts.length - 1] : 0;

  const monthlyChartData = {
    labels: monthlyData.categories,
    datasets: [
      {
        label: `Spending (${currency})`,
        data: displayMonthlyAmounts,
        backgroundColor: ['#0056D2', '#2A6B2C', '#B91D20', '#6C7AA8', '#A66D1F', '#4A5F7A'],
        borderWidth: 0,
      },
    ],
  };

  const trendChartData = {
    labels: trendData.labels,
    datasets: [
      {
        label: `Monthly Spending (${currency})`,
        data: displayTrendAmounts,
        borderColor: '#0056D2',
        backgroundColor: 'rgba(0, 86, 210, 0.12)',
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointHoverRadius: 5,
      },
    ],
  };

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, index) => currentYear - index);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      {rateSource === 'default' && (
        <div className="rounded-[1.5rem] bg-blue-50 px-5 py-4 text-sm text-blue-900">
          Using default exchange rates right now. Values may slightly differ from live market rates.
          {rateUpdatedAt && <span className="ml-1 text-blue-700">Last updated: {new Date(rateUpdatedAt).toLocaleString()}</span>}
        </div>
      )}

      <div className="inline-flex w-fit rounded-full bg-slate-100/85 p-2">
        <button
          className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${activeTab === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          onClick={() => setActiveTab('monthly')}
        >
          Monthly Summary
        </button>
        <button
          className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${activeTab === 'trends' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          onClick={() => setActiveTab('trends')}
        >
          Spending Trends
        </button>
      </div>

      {activeTab === 'monthly' ? (
        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <div className="editorial-panel">
              <p className="eyebrow">Reports</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">Reports</h2>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="year" className="form-label">Year</label>
                  <select id="year" className="form-input" value={selectedYear} onChange={(event) => setSelectedYear(parseInt(event.target.value, 10))}>
                    {years.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="month" className="form-label">Month</label>
                  <select id="month" className="form-input" value={selectedMonth} onChange={(event) => setSelectedMonth(parseInt(event.target.value, 10))}>
                    {months.map((month, index) => (
                      <option key={month} value={index + 1}>{month}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="editorial-panel bg-[linear-gradient(180deg,rgba(243,244,245,0.9)_0%,rgba(255,255,255,0.9)_100%)]">
              <p className="eyebrow">Monthly Summary</p>
              <p className="mt-4 whitespace-nowrap font-[family:var(--font-manrope)] text-4xl font-semibold tracking-[-0.05em] text-slate-900 tabular-nums md:text-5xl">
                {formatCompactCurrency(displayMonthlyTotal, currency)}
              </p>
            </div>

            <div className="editorial-panel">
              <p className="eyebrow">Top Categories</p>
              <div className="mt-5 space-y-3">
                {topMonthlyItems.length > 0 ? (
                  topMonthlyItems.map((item, index) => (
                    <div key={item.category} className="rounded-[1.25rem] bg-white px-4 py-4 shadow-[0_10px_30px_rgba(25,28,29,0.04)]">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">0{index + 1}</p>
                          <p className="mt-2 font-medium text-slate-900">{item.category}</p>
                        </div>
                        <p className="font-[family:var(--font-manrope)] text-xl font-semibold tracking-[-0.03em] text-slate-900">
                          {formatCurrency(item.amount, currency)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[1.5rem] bg-slate-100/70 px-4 py-10 text-center text-slate-500">
                    No monthly highlights available.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="editorial-panel">
            <p className="eyebrow">Category Mix</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Monthly spending composition</h2>

            {loading ? (
              <div className="mt-6 skeleton h-[28rem] rounded-[1.5rem]" />
            ) : monthlyData.categories.length > 0 ? (
              <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="h-[26rem] rounded-[1.5rem] bg-white p-4">
                  <Pie
                    data={monthlyChartData}
                    options={{
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            boxWidth: 10,
                            boxHeight: 10,
                            color: '#424654',
                            padding: 18,
                            usePointStyle: true,
                          },
                        },
                      },
                    }}
                  />
                </div>

                <div className="space-y-4">
                  <div className="editorial-subpanel">
                    <p className="eyebrow">Selected Window</p>
                    <p className="mt-3 text-xl font-semibold text-slate-900">{months[selectedMonth - 1]} {selectedYear}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-[1.5rem] bg-slate-100/70 px-5 py-16 text-center text-slate-500">
                No data available for this month.
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <div className="space-y-6">
            <div className="editorial-panel">
              <p className="eyebrow">Reports</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">Reports</h2>

              <div className="mt-6">
                <label htmlFor="trendPeriod" className="form-label">Time Period</label>
                <select id="trendPeriod" className="form-input" value={trendPeriod} onChange={(event) => setTrendPeriod(parseInt(event.target.value, 10))}>
                  <option value={3}>Last 3 Months</option>
                  <option value={6}>Last 6 Months</option>
                  <option value={12}>Last 12 Months</option>
                </select>
              </div>
            </div>

            <div className="editorial-panel bg-[linear-gradient(180deg,rgba(243,244,245,0.9)_0%,rgba(255,255,255,0.9)_100%)]">
              <p className="eyebrow">Latest Trend Reading</p>
              <p className="mt-4 whitespace-nowrap font-[family:var(--font-manrope)] text-4xl font-semibold tracking-[-0.05em] text-slate-900 tabular-nums md:text-5xl">
                {formatCompactCurrency(leadingTrendAmount, currency)}
              </p>
            </div>

            <div className="editorial-panel">
              <p className="eyebrow">Summary</p>
            </div>
          </div>

          <div className="editorial-panel">
            <p className="eyebrow">Trend Canvas</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Spending over time</h2>

            {loading ? (
              <div className="mt-6 skeleton h-[30rem] rounded-[1.5rem]" />
            ) : trendData.labels.length > 0 ? (
              <div className="mt-6 h-[30rem] rounded-[1.5rem] bg-white p-4">
                <Line
                  data={trendChartData}
                  options={{
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: `Amount (${getCurrencyDisplay(currency)})`,
                        },
                        grid: { color: 'rgba(225, 227, 228, 0.7)' },
                        ticks: { color: '#737785' },
                        border: { display: false },
                      },
                      x: {
                        grid: { display: false },
                        ticks: { color: '#737785' },
                        border: { display: false },
                      },
                    },
                    plugins: {
                      legend: { display: false },
                    },
                  }}
                />
              </div>
            ) : (
              <div className="mt-6 rounded-[1.5rem] bg-slate-100/70 px-5 py-16 text-center text-slate-500">
                No trend data available.
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
