'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { expenseApi } from '@/lib/api';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    category: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      let data;
      
      if (filter.category) {
        data = await expenseApi.getExpensesByCategory(filter.category);
      } else if (filter.startDate && filter.endDate) {
        data = await expenseApi.getExpensesByDateRange(filter.startDate, filter.endDate);
      } else {
        data = await expenseApi.getAllExpenses();
      }
      
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
      category: '',
      startDate: '',
      endDate: ''
    });
    fetchExpenses();
  };

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

  // Calculate total amount for displayed expenses
  const totalAmount = expenses.reduce(
    (sum: number, expense: any) => sum + parseFloat(expense.amount),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Expenses</h1>
        <Link href="/expenses/add" className="btn btn-primary">
          Add New Expense
        </Link>
      </div>

      {/* Filter Form */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Filter Expenses</h2>
        <form onSubmit={applyFilters} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="category" className="form-label">Category</label>
            <select
              id="category"
              name="category"
              className="form-input"
              value={filter.category}
              onChange={handleFilterChange}
            >
              <option value="">All Categories</option>
              <option value="Food & Dining">Food & Dining</option>
              <option value="Transportation">Transportation</option>
              <option value="Housing">Housing</option>
              <option value="Utilities">Utilities</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Shopping">Shopping</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Education">Education</option>
              <option value="Personal Care">Personal Care</option>
              <option value="Travel">Travel</option>
              <option value="Other">Other</option>
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
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Expense List</h2>
          <p className="font-semibold">Total: ${totalAmount.toFixed(2)}</p>
        </div>
        
        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : expenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-left">Amount</th>
                  <th className="px-4 py-2 text-left">Note</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense: any) => (
                  <tr key={expense.id} className="border-t">
                    <td className="px-4 py-2">{new Date(expense.date).toLocaleDateString()}</td>
                    <td className="px-4 py-2">{expense.category}</td>
                    <td className="px-4 py-2">${parseFloat(expense.amount).toFixed(2)}</td>
                    <td className="px-4 py-2">{expense.note}</td>
                    <td className="px-4 py-2">
                      <div className="flex space-x-2">
                        <Link href={`/expenses/edit/${expense.id}`} className="text-blue-600 hover:underline">
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="text-red-600 hover:underline"
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
          <p className="text-gray-500 text-center py-10">No expenses found.</p>
        )}
      </div>
    </div>
  );
}