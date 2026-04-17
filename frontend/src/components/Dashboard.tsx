'use client';

import { useState, useEffect } from 'react';
import { expenseApi, dashboardApi, categoryApi } from '@/lib/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import Link from 'next/link';
import { useCurrency } from '@/lib/CurrencyContext';
import { convertCurrency, convertVndAmounts, formatCurrency, getCurrencyDisplay } from '@/lib/currencyService';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<any>({
    categories: [],
    amounts: [],
    total: 0,
  });
  const [categoryTotals, setCategoryTotals] = useState<any>({
    categories: [],
    amounts: [],
  });
  const { currency, isLoading: currencyLoading, rateSource, rateUpdatedAt } = useCurrency();
  const [convertedMonthlySummary, setConvertedMonthlySummary] = useState<any>({
    categories: [],
    amounts: [],
    total: 0,
  });
  const [convertedCategoryTotals, setConvertedCategoryTotals] = useState<any>({
    categories: [],
    amounts: [],
  });
  const [convertedRecentExpenses, setConvertedRecentExpenses] = useState<any[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [isMockData, setIsMockData] = useState(false);

  const mockMonthlySummary = {
    categories: ['Food', 'Transportation', 'Entertainment', 'Utilities', 'Shopping'],
    amounts: [350, 200, 150, 120, 280],
    total: 1100,
  };

  const mockRecentExpenses = [
    { id: 1, description: 'Grocery shopping', amount: 85.5, date: '2023-11-15', category: 'Food' },
    { id: 2, description: 'Movie tickets', amount: 32, date: '2023-11-14', category: 'Entertainment' },
    { id: 3, description: 'Uber ride', amount: 24.75, date: '2023-11-13', category: 'Transportation' },
    { id: 4, description: 'Electricity bill', amount: 95.2, date: '2023-11-12', category: 'Utilities' },
    { id: 5, description: 'New shoes', amount: 120, date: '2023-11-11', category: 'Shopping' },
  ];

  const mockCategoryTotals = {
    categories: ['Food', 'Shopping', 'Utilities', 'Entertainment', 'Transportation'],
    amounts: [350, 280, 120, 150, 200],
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;

        try {
          const [recentData, summaryData] = await Promise.all([
            expenseApi.getAllExpenses(),
            expenseApi.getMonthlySummary(currentYear, currentMonth),
          ]);

          setRecentExpenses(recentData.slice(0, 5));

          const categoriesList: string[] = [];
          const amounts: number[] = [];
          let total = 0;

          summaryData.forEach((item: any) => {
            categoriesList.push(item[0]);
            const amount = parseFloat(item[1]);
            amounts.push(amount);
            total += amount;
          });

          setMonthlySummary({
            categories: categoriesList,
            amounts,
            total,
          });

          const categoryMap = new Map<string, number>();
          recentData.forEach((expense: any) => {
            const amount = parseFloat(expense.amount);
            if (Number.isNaN(amount)) return;

            categoryMap.set(expense.category, (categoryMap.get(expense.category) ?? 0) + amount);
          });

          const sortedCategories = Array.from(categoryMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

          setCategoryTotals({
            categories: sortedCategories.map((item) => item[0]),
            amounts: sortedCategories.map((item) => item[1]),
          });
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
          setMonthlySummary(mockMonthlySummary);
          setRecentExpenses(mockRecentExpenses);
          setCategoryTotals(mockCategoryTotals);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    const convertAmounts = async () => {
      if (loading || currencyLoading || monthlySummary.categories.length === 0) {
        return;
      }

      try {
        setIsConverting(true);

        const convertedAmounts = await convertVndAmounts(monthlySummary.amounts, currency);
        const convertedTotal = await convertCurrency(monthlySummary.total, 'VND', currency);

        setConvertedMonthlySummary({
          categories: monthlySummary.categories,
          amounts: convertedAmounts,
          total: convertedTotal,
        });

        const convertedCategoryAmounts = await convertVndAmounts(categoryTotals.amounts, currency);

        setConvertedCategoryTotals({
          categories: categoryTotals.categories,
          amounts: convertedCategoryAmounts,
        });

        const recentAmounts = recentExpenses.map((expense) => parseFloat(expense.amount));
        const convertedRecentAmounts = await convertVndAmounts(recentAmounts, currency);

        setConvertedRecentExpenses(
          recentExpenses.map((expense, index) => ({
            ...expense,
            convertedAmount: convertedRecentAmounts[index],
          })),
        );
      } catch (error) {
        console.error('Error converting currency:', error);
      } finally {
        setIsConverting(false);
      }
    };

    convertAmounts();
  }, [currency, monthlySummary, categoryTotals, recentExpenses, loading, currencyLoading]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryApi.getAllCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await dashboardApi.getDashboardData();
        if (data) {
          setIsMockData(!data.isRealData);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    // fetchDashboardData();
  }, []);

  const displayMonthlyAmounts = convertedMonthlySummary.amounts.length > 0 ? convertedMonthlySummary.amounts : monthlySummary.amounts;
  const displayMonthlyTotal = convertedMonthlySummary.total || monthlySummary.total;
  const displayCategoryTotals = convertedCategoryTotals.amounts.length > 0 ? convertedCategoryTotals.amounts : categoryTotals.amounts;
  const displayRecentExpenses = convertedRecentExpenses.length > 0 ? convertedRecentExpenses : recentExpenses;
  const topCategories = monthlySummary.categories.slice(0, 3).map((category: string, index: number) => ({
    name: category,
    amount: displayMonthlyAmounts[index] ?? 0,
  }));
  const averageSpend = displayRecentExpenses.length > 0 ? displayRecentExpenses.reduce((sum, expense) => sum + (expense.convertedAmount ?? parseFloat(expense.amount) ?? 0), 0) / displayRecentExpenses.length : 0;
  const rangeLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const latestExpenseAmount = displayRecentExpenses[0] ? (displayRecentExpenses[0].convertedAmount ?? parseFloat(displayRecentExpenses[0].amount) ?? 0) : 0;
  const latestExpenseLabel = displayRecentExpenses[0]?.note || displayRecentExpenses[0]?.description || 'Recent expense';
  const secondExpenseAmount = displayRecentExpenses[1] ? (displayRecentExpenses[1].convertedAmount ?? parseFloat(displayRecentExpenses[1].amount) ?? 0) : 0;
  const secondExpenseLabel = displayRecentExpenses[1]?.note || displayRecentExpenses[1]?.description || 'Recent activity';

  const pieChartData = {
    labels: monthlySummary.categories,
    datasets: [
      {
        label: 'Monthly Spending',
        data: displayMonthlyAmounts,
        backgroundColor: ['#0056D2', '#2A6B2C', '#B91D20', '#6C7AA8', '#A66D1F', '#4A5F7A'],
        borderWidth: 0,
      },
    ],
  };

  const barChartData = {
    labels: categoryTotals.categories,
    datasets: [
      {
        label: 'Total Spending by Category',
        data: displayCategoryTotals,
        backgroundColor: '#0056D2',
        borderRadius: 999,
        borderSkipped: false as const,
      },
    ],
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatAmount = (amount: number) => formatCurrency(amount, currency);

  const getCategoryName = (categoryId: number) => categories.find((category) => category.id === categoryId)?.name ?? `Category ${categoryId}`;

  if (loading || currencyLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="editorial-panel min-h-[24rem]">
            <div className="skeleton h-5 w-28" />
            <div className="mt-6 skeleton h-20 w-2/3" />
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <div className="skeleton h-24 rounded-[1.5rem]" />
              <div className="skeleton h-24 rounded-[1.5rem]" />
              <div className="skeleton h-24 rounded-[1.5rem]" />
            </div>
          </div>
          <div className="editorial-panel min-h-[24rem]">
            <div className="skeleton h-full rounded-[1.5rem]" />
          </div>
        </div>
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="editorial-panel min-h-[26rem]">
            <div className="skeleton h-full rounded-[1.5rem]" />
          </div>
          <div className="editorial-panel min-h-[26rem]">
            <div className="skeleton h-full rounded-[1.5rem]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {(isMockData || rateSource === 'default') && (
        <div className="grid gap-3 md:grid-cols-2">
          {isMockData && (
            <div className="rounded-[1.5rem] bg-amber-50 px-5 py-4 text-sm text-amber-800">
              <span className="font-semibold">Sample mode.</span> Dashboard data is falling back to mock values while the API is unavailable.
            </div>
          )}
          {rateSource === 'default' && (
            <div className="rounded-[1.5rem] bg-blue-50 px-5 py-4 text-sm text-blue-900">
              <span className="font-semibold">Rate note.</span> Using default exchange rates for {getCurrencyDisplay(currency)}.
              {rateUpdatedAt && <span className="ml-1 text-blue-700">Updated {new Date(rateUpdatedAt).toLocaleString()}.</span>}
            </div>
          )}
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-[1.55fr_0.9fr]">
        <div className="space-y-6">
          <div className="editorial-panel relative min-h-[34rem] overflow-hidden">
            <div className="absolute inset-y-0 right-[-8%] hidden w-1/2 rounded-full bg-[radial-gradient(circle,rgba(0,86,210,0.18),transparent_62%)] blur-2xl lg:block" />
            <div className="relative flex h-full flex-col justify-between space-y-8">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div className="space-y-3">
                  <p className="eyebrow">Total Net Worth</p>
                  <h2 className="font-[family:var(--font-manrope)] text-5xl font-semibold leading-none tracking-[-0.06em] text-slate-900 md:text-7xl">
                    {formatAmount(displayMonthlyTotal)}
                  </h2>
                </div>

                <div className="rounded-full bg-white/80 px-4 py-2 text-sm text-slate-600 shadow-sm">
                  {rangeLabel}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr_0.9fr]">
                <div className="rounded-[1.75rem] bg-[linear-gradient(145deg,rgba(0,64,161,0.98)_0%,rgba(0,86,210,0.96)_100%)] p-6 text-white shadow-[0_22px_50px_rgba(0,86,210,0.24)]">
                  <p className="eyebrow !text-blue-100">Wealth Glance</p>
                  <p className="mt-4 text-sm text-blue-100">Primary account position</p>
                  <p className="mt-3 font-[family:var(--font-manrope)] text-4xl font-semibold tracking-[-0.05em]">
                    {formatAmount(displayMonthlyTotal)}
                  </p>
                  <div className="mt-8 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-blue-100/80">Average Ticket</p>
                      <p className="mt-2 text-lg font-semibold">{formatAmount(averageSpend)}</p>
                    </div>
                    <div className="h-14 w-28 rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0.02)_100%)]" />
                  </div>
                </div>

                <div className="editorial-subpanel">
                  <p className="eyebrow">Tracked Categories</p>
                  <p className="mt-4 font-[family:var(--font-manrope)] text-3xl font-semibold tracking-[-0.04em] text-slate-900">
                    {monthlySummary.categories.length}
                  </p>
                </div>

                <div className="editorial-subpanel">
                  <p className="eyebrow">Primary Action</p>
                  <h3 className="mt-4 font-[family:var(--font-manrope)] text-2xl font-semibold tracking-[-0.04em] text-slate-900">Add expense</h3>
                  <Link href="/expenses/add" className="mt-5 inline-flex rounded-full bg-[linear-gradient(135deg,#0040A1_0%,#0056D2_100%)] px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.02]">
                    Add Transaction
                  </Link>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                <div className="editorial-subpanel min-h-[15rem]">
                  <div className="flex items-center justify-between">
                    <div>
                    <p className="eyebrow">Spending Mix</p>
                    <h3 className="mt-2 text-2xl font-semibold text-slate-900">Where the month went</h3>
                  </div>
                  {isConverting && <span className="text-xs text-slate-500">Updating values...</span>}
                </div>
                <div className="mt-6 h-64">
                  {monthlySummary.categories.length > 0 ? (
                    <Pie
                      data={pieChartData}
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
                          tooltip: {
                            callbacks: {
                              label(context) {
                                return `${context.label}: ${formatAmount(context.raw as number)}`;
                              },
                            },
                          },
                        },
                      }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-[1.5rem] bg-slate-100/70 text-slate-500">
                      No data available for this month.
                    </div>
                  )}
                </div>
              </div>

              <div className="editorial-subpanel">
                <p className="eyebrow">Top Categories</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-900">Top categories</h3>
                <div className="mt-6 space-y-4">
                  {topCategories.length > 0 ? (
                    topCategories.map((item, index) => (
                      <div key={item.name} className="rounded-[1.25rem] bg-slate-100/70 px-4 py-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">0{index + 1}</p>
                            <p className="mt-2 text-lg font-semibold text-slate-900 clamp-1">{item.name}</p>
                          </div>
                          <p className="font-[family:var(--font-manrope)] text-xl font-semibold tracking-[-0.03em] text-slate-900">
                            {formatAmount(item.amount)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No category highlights yet.</p>
                  )}
                </div>
                </div>
              </div>
            </div>
          </div>

          <section className="editorial-panel">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="eyebrow">Recent Ledger</p>
                <h3 className="mt-2 text-3xl font-semibold text-slate-900">Recent activity</h3>
              </div>
              <Link href="/expenses" className="btn btn-secondary self-start md:self-auto">
                View All Transactions
              </Link>
            </div>

            {displayRecentExpenses.length > 0 ? (
              <div className="mt-6 overflow-hidden rounded-[1.5rem] bg-white">
                {displayRecentExpenses.map((expense) => (
                  <div key={expense.id} className="grid gap-3 border-b border-slate-100/80 px-5 py-4 last:border-b-0 md:grid-cols-[0.9fr_1fr_1.5fr_0.9fr] md:items-center">
                    <p className="text-sm text-slate-500">{formatDate(expense.date)}</p>
                    <p className="font-medium text-slate-900">{getCategoryName(expense.categoryId)}</p>
                    <p className="clamp-1 text-sm text-slate-500">{expense.note || expense.description || 'No note provided'}</p>
                    <p className="text-left font-[family:var(--font-manrope)] text-lg font-semibold tracking-[-0.03em] text-slate-900 md:text-right">
                      {formatAmount(expense.convertedAmount ? expense.convertedAmount : parseFloat(expense.amount))}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-[1.5rem] bg-slate-100/70 px-5 py-12 text-center text-slate-500">
                No recent expenses.
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <div className="editorial-panel bg-[linear-gradient(180deg,rgba(243,244,245,0.92)_0%,rgba(255,255,255,0.92)_100%)]">
            <p className="eyebrow">Upcoming Obligations</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">Latest spending prompts</h3>

            <div className="mt-6 space-y-3">
              <div className="rounded-[1.4rem] bg-white px-4 py-4 shadow-[0_10px_30px_rgba(25,28,29,0.04)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 clamp-2">{latestExpenseLabel}</p>
                    {displayRecentExpenses[0] && (
                      <p className="mt-1 text-sm text-slate-500 clamp-1">{`${getCategoryName(displayRecentExpenses[0].categoryId)} • ${formatDate(displayRecentExpenses[0].date)}`}</p>
                    )}
                  </div>
                  <p className="font-[family:var(--font-manrope)] text-lg font-semibold tracking-[-0.03em] text-slate-900">{formatAmount(latestExpenseAmount)}</p>
                </div>
              </div>

              <div className="rounded-[1.4rem] bg-white px-4 py-4 shadow-[0_10px_30px_rgba(25,28,29,0.04)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 clamp-2">{secondExpenseLabel}</p>
                    {displayRecentExpenses[1] && (
                      <p className="mt-1 text-sm text-slate-500 clamp-1">{`${getCategoryName(displayRecentExpenses[1].categoryId)} • ${formatDate(displayRecentExpenses[1].date)}`}</p>
                    )}
                  </div>
                  <p className="font-[family:var(--font-manrope)] text-lg font-semibold tracking-[-0.03em] text-slate-900">{formatAmount(secondExpenseAmount)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="editorial-panel">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="eyebrow">Category Ranking</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-900">Top spending categories</h3>
              </div>
              <span className="rounded-full bg-slate-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {getCurrencyDisplay(currency)}
              </span>
            </div>

            <div className="mt-6 h-[20rem]">
              {categoryTotals.categories.length > 0 ? (
                <Bar
                  data={barChartData}
                  options={{
                    maintainAspectRatio: false,
                    scales: {
                      x: {
                        grid: { display: false },
                        ticks: { color: '#424654' },
                        border: { display: false },
                      },
                      y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(225, 227, 228, 0.7)' },
                        ticks: { color: '#737785' },
                        border: { display: false },
                      },
                    },
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          label(context) {
                            return `${context.label}: ${formatAmount(context.raw as number)}`;
                          },
                        },
                      },
                    },
                  }}
                />
              ) : (
                <div className="flex h-full items-center justify-center rounded-[1.5rem] bg-slate-100/70 text-slate-500">
                  No category data available.
                </div>
              )}
            </div>
          </div>

          <div className="editorial-panel bg-[linear-gradient(180deg,rgba(243,244,245,0.92)_0%,rgba(255,255,255,0.92)_100%)]">
            <p className="eyebrow">Quick Links</p>
            <div className="mt-4 grid gap-3">
              <Link href="/expenses" className="editorial-subpanel transition-transform hover:translate-y-[-1px]">
                <p className="text-lg font-semibold text-slate-900">Review transactions</p>
              </Link>
              <Link href="/reports" className="editorial-subpanel transition-transform hover:translate-y-[-1px]">
                <p className="text-lg font-semibold text-slate-900">Open reports</p>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
