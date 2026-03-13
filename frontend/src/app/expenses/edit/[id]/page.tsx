'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ExpenseForm from '@/components/ExpenseForm';
import { expenseApi } from '@/lib/api';

export default function EditExpensePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const data = await expenseApi.getExpenseById(parseInt(params.id));
        setExpense(data);
      } catch (error) {
        console.error('Error fetching expense:', error);
        setMessage({ text: 'Failed to load expense data.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchExpense();
  }, [params.id]);

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      await expenseApi.updateExpense(parseInt(params.id), data);
      setMessage({ text: 'Expense updated successfully!', type: 'success' });
      setTimeout(() => {
        router.push('/expenses');
      }, 1500);
    } catch (error) {
      console.error('Error updating expense:', error);
      setMessage({ text: 'Failed to update expense. Please try again.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/expenses" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-sky-600 font-medium mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Expenses
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-2">Edit Expense</h1>
      <p className="text-slate-500 mb-6">Update your transaction details</p>

      {message.text && (
        <div className={`p-4 mb-6 rounded-xl ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="card-static">
        {loading ? (
          <div className="space-y-4 py-8">
            <div className="skeleton h-10 w-full" />
            <div className="skeleton h-10 w-full" />
            <div className="skeleton h-10 w-full" />
          </div>
        ) : expense ? (
          <ExpenseForm initialData={expense} onSubmit={handleSubmit} isEditing={true} />
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-600 mb-2">Expense not found</p>
            <Link href="/expenses" className="link">Return to expenses</Link>
          </div>
        )}
      </div>
    </div>
  );
}