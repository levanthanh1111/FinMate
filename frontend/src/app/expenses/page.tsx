'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { expenseApi, categoryApi } from '@/lib/api';
import { useCurrency } from '@/lib/CurrencyContext';
import { convertVndAmounts, formatCurrency } from '@/lib/currencyService';

export default function ExpensesPage() {
  const { currency, rateSource, rateUpdatedAt } = useCurrency();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedAmounts, setConvertedAmounts] = useState<Record<number, number>>({});
  const [convertedTotal, setConvertedTotal] = useState<number>(0);
  const [filter, setFilter] = useState({
    categoryId: '',
    startDate: '',
    endDate: '',
  });

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
    fetchExpenses();
  }, []);

  useEffect(() => {
    const convertAmounts = async () => {
      try {
        setIsConverting(true);
        const baseAmounts = expenses.map((expense) => parseFloat(expense.amount) || 0);
        const convertedValues = await convertVndAmounts(baseAmounts, currency);
        const convertedPairs = expenses.map((expense, index) => [expense.id, convertedValues[index]] as const);

        setConvertedAmounts(Object.fromEntries(convertedPairs) as Record<number, number>);
        setConvertedTotal(convertedPairs.reduce((sum, [, value]) => sum + value, 0));
      } finally {
        setIsConverting(false);
      }
    };

    if (expenses.length > 0) {
      convertAmounts();
    } else {
      setConvertedTotal(0);
      setIsConverting(false);
    }
  }, [expenses, currency]);

  const fetchExpenses = async (filters = filter) => {
    try {
      setLoading(true);

      const requestFilters: { categoryId?: number; startDate?: string; endDate?: string } = {};

      if (filters.categoryId) {
        requestFilters.categoryId = parseInt(filters.categoryId, 10);
      }

      if (filters.startDate && filters.endDate) {
        requestFilters.startDate = filters.startDate;
        requestFilters.endDate = filters.endDate;
      }

      const data = await expenseApi.getFilteredExpenses(requestFilters);
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFilter((previous) => ({ ...previous, [name]: value }));
  };

  const applyFilters = (event: React.FormEvent) => {
    event.preventDefault();
    fetchExpenses();
  };

  const resetFilters = () => {
    const reset = {
      categoryId: '',
      startDate: '',
      endDate: '',
    };
    setFilter(reset);
    fetchExpenses(reset);
  };

  const getCategoryName = (categoryId: number) => categories.find((category) => category.id === categoryId)?.name ?? `Category ${categoryId}`;

  const handleDeleteExpense = async (id: number) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseApi.deleteExpense(id);
        setExpenses(expenses.filter((expense: any) => expense.id !== id));
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  const formatTransactionDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const selectedCategoryLabel = filter.categoryId ? getCategoryName(parseInt(filter.categoryId, 10)) : 'All categories';

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      {rateSource === 'default' && (
        <div className="rounded-[1.5rem] bg-blue-50 px-5 py-4 text-sm text-blue-900">
          Using default exchange rates right now. Values may slightly differ from live market rates.
          {rateUpdatedAt && <span className="ml-1 text-blue-700">Last updated: {new Date(rateUpdatedAt).toLocaleString()}</span>}
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="editorial-panel">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Expenses</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">Expenses</h2>
            </div>
            <div className="flex gap-2">
              <Link href="/expenses/add" className="btn btn-primary">New Transaction</Link>
              <button type="button" onClick={resetFilters} className="btn btn-secondary">Reset</button>
            </div>
          </div>

          <form onSubmit={applyFilters} className="mt-6 space-y-5">
            <div>
              <label htmlFor="categoryId" className="form-label">Category</label>
              <select id="categoryId" name="categoryId" className="form-input" value={filter.categoryId} onChange={handleFilterChange}>
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="startDate" className="form-label">Start Date</label>
                <input type="date" id="startDate" name="startDate" className="form-input" value={filter.startDate} onChange={handleFilterChange} />
              </div>
              <div>
                <label htmlFor="endDate" className="form-label">End Date</label>
                <input type="date" id="endDate" name="endDate" className="form-input" value={filter.endDate} onChange={handleFilterChange} />
              </div>
            </div>

            <div className="rounded-[1.5rem] bg-slate-100/70 px-4 py-4 text-sm text-slate-600">
              <p className="font-medium text-slate-900">Current selection</p>
              <p className="mt-1">{selectedCategoryLabel}</p>
              <p className="mt-1">{filter.startDate || 'Any start'} to {filter.endDate || 'Any end'}</p>
            </div>

            <button type="submit" className="btn btn-primary w-full">
              Apply Filters
            </button>
          </form>
        </div>

        <div className="editorial-panel">
          <p className="eyebrow">Overview</p>
          <div className="mt-2 grid gap-4 md:grid-cols-2">
            <div className="editorial-subpanel">
              <p className="eyebrow">Visible Transactions</p>
              <p className="mt-4 font-[family:var(--font-manrope)] text-4xl font-semibold tracking-[-0.05em] text-slate-900">
                {expenses.length}
              </p>
            </div>
            <div className="editorial-subpanel">
              <p className="eyebrow">Currency</p>
              <p className="mt-4 font-[family:var(--font-manrope)] text-4xl font-semibold tracking-[-0.05em] text-slate-900">
                {currency}
              </p>
            </div>
          </div>

          <div className="mt-4 editorial-subpanel bg-[linear-gradient(180deg,rgba(243,244,245,0.9)_0%,rgba(255,255,255,0.9)_100%)]">
            <p className="eyebrow">Reading Guide</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">Overview</h3>
          </div>
        </div>
      </section>

      <section className="editorial-panel">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Expense Ledger</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Transaction list</h2>
          </div>
          <div className="text-left md:text-right">
            <p className="text-sm text-slate-500">Filtered total</p>
            <p className="font-[family:var(--font-manrope)] text-3xl font-semibold tracking-[-0.04em] text-slate-900">
              {formatCurrency(convertedTotal, currency)}
            </p>
            {isConverting && <p className="mt-1 text-xs text-slate-500">Updating values...</p>}
          </div>
        </div>

        {loading ? (
          <div className="mt-6 space-y-3">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="skeleton h-20 rounded-[1.5rem]" />
            ))}
          </div>
        ) : expenses.length > 0 ? (
          <div className="mt-6 space-y-3">
            {expenses.map((expense: any) => (
              <div key={expense.id} className="grid gap-4 rounded-[1.5rem] bg-white px-5 py-5 shadow-[0_10px_30px_rgba(25,28,29,0.04)] md:grid-cols-[0.9fr_1fr_1.6fr_0.9fr_0.8fr] md:items-center">
                <div>
                  <p className="eyebrow text-[10px] text-slate-400">Date</p>
                  <p className="mt-2 text-sm text-slate-600">{formatTransactionDate(expense.date)}</p>
                </div>
                <div>
                  <p className="eyebrow text-[10px] text-slate-400">Category</p>
                  <p className="mt-2 font-medium text-slate-900">{getCategoryName(expense.categoryId)}</p>
                </div>
                <div>
                  <p className="eyebrow text-[10px] text-slate-400">Note</p>
                  <p className="mt-2 text-sm text-slate-500 clamp-2">{expense.note || 'No note provided'}</p>
                </div>
                <div>
                  <p className="eyebrow text-[10px] text-slate-400">Amount</p>
                  <p className="mt-2 font-[family:var(--font-manrope)] text-xl font-semibold tracking-[-0.03em] text-slate-900">
                    {formatCurrency(convertedAmounts[expense.id] ?? parseFloat(expense.amount), currency)}
                  </p>
                </div>
                <div className="flex items-center gap-2 md:justify-end">
                  <Link href={`/expenses/edit/${expense.id}`} className="btn btn-ghost px-3 py-2 text-sm">
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteExpense(expense.id)}
                    className="rounded-full px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-[1.5rem] bg-slate-100/70 px-5 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white">
              <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="mt-5 text-lg font-medium text-slate-900">No expenses yet</p>
            <Link href="/expenses/add" className="btn btn-primary mt-5 inline-flex">
              Add Expense
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
