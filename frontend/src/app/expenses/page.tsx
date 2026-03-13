'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { expenseApi, categoryApi } from '@/lib/api';
import { useCurrency } from '@/lib/CurrencyContext';
import { convertCurrency, formatCurrency } from '@/lib/currencyService';

export default function ExpensesPage() {
  const { currency } = useCurrency();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [convertedAmounts, setConvertedAmounts] = useState<Record<number, number>>({});
  const [convertedTotal, setConvertedTotal] = useState<number>(0);
  const [filter, setFilter] = useState({
    categoryId: '',
    startDate: '',
    endDate: ''
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
      const amounts: Record<number, number> = {};
      let total = 0;
      for (const exp of expenses) {
        const amt = parseFloat(exp.amount) || 0;
        const converted = await convertCurrency(amt, 'VND', currency);
        amounts[exp.id] = converted;
        total += converted;
      }
      setConvertedAmounts(amounts);
      setConvertedTotal(total);
    };
    if (expenses.length > 0) convertAmounts();
    else setConvertedTotal(0);
  }, [expenses, currency]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      let data;
      
      if (filter.categoryId) {
        data = await expenseApi.getExpensesByCategory(parseInt(filter.categoryId, 10));
      } else if (filter.startDate && filter.endDate) {
        data = await expenseApi.getExpensesByDateRange(filter.startDate, filter.endDate);
      } else {
        data = await expenseApi.getAllExpenses();
      }
      console.log("Fetched expenses:", data);
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    fetchExpenses();
  };

  const resetFilters = () => {
    setFilter({
      categoryId: '',
      startDate: '',
      endDate: ''
    });
    fetchExpenses();
  };

  const getCategoryName = (categoryId: number) =>
    categories.find(c => c.id === categoryId)?.name ?? `Category ${categoryId}`;

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


  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Expenses</h1>
          <p className="text-slate-500 mt-1">View and manage your transactions</p>
        </div>
        <Link href="/expenses/add" className="btn btn-primary shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Expense
        </Link>
      </div>

      {/* Filter Form */}
      <div className="card-static">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Filter</h2>
        <form onSubmit={applyFilters} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="categoryId" className="form-label">Category</label>
            <select
              id="categoryId"
              name="categoryId"
              className="form-input"
              value={filter.categoryId}
              onChange={handleFilterChange}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="startDate" className="form-label">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              className="form-input"
              value={filter.startDate}
              onChange={handleFilterChange}
            />
          </div>
          
          <div>
            <label htmlFor="endDate" className="form-label">End Date</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              className="form-input"
              value={filter.endDate}
              onChange={handleFilterChange}
            />
          </div>
          
          <div className="flex items-end space-x-2">
            <button type="submit" className="btn btn-primary">Apply Filters</button>
            <button type="button" onClick={resetFilters} className="btn btn-secondary">Reset</button>
          </div>
        </form>
      </div>

      {/* Expenses List */}
      <div className="card-static">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Expense List</h2>
          <div className="text-right">
            <span className="text-sm text-slate-500">Total </span>
            <span className="text-lg font-bold text-slate-900">{formatCurrency(convertedTotal, currency)}</span>
          </div>
        </div>
        
        {loading ? (
          <div className="space-y-3 py-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="skeleton h-10 flex-1" />
                <div className="skeleton h-10 w-24" />
                <div className="skeleton h-10 w-20" />
              </div>
            ))}
          </div>
        ) : expenses.length > 0 ? (
          <div className="table-container">
            <table className="table-default">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Date</th>
                  <th className="table-header-cell">Category</th>
                  <th className="table-header-cell">Amount</th>
                  <th className="table-header-cell">Note</th>
                  <th className="table-header-cell text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {expenses.map((expense: any) => (
                  <tr key={expense.id} className="table-row">
                    <td className="table-cell">{new Date(expense.date).toLocaleDateString()}</td>
                    <td className="table-cell font-medium text-slate-800">{getCategoryName(expense.categoryId)}</td>
                    <td className="table-cell font-semibold text-slate-900">{formatCurrency(convertedAmounts[expense.id] ?? parseFloat(expense.amount), currency)}</td>
                    <td className="table-cell max-w-xs truncate text-slate-500">{expense.note || '—'}</td>
                    <td className="table-cell text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/expenses/edit/${expense.id}`} className="btn btn-ghost py-1.5 px-2 text-sm">
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
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
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-slate-600 font-medium">No expenses yet</p>
            <p className="text-slate-500 text-sm mt-1">Add your first expense to get started</p>
            <Link href="/expenses/add" className="btn btn-primary mt-4 inline-flex">
              Add Expense
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}