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
        const data = await expenseApi.getExpenseById(parseInt(params.id, 10));
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
      await expenseApi.updateExpense(parseInt(params.id, 10), data);
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
    <div className="mx-auto max-w-5xl space-y-6">
      <Link href="/expenses" className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Expenses
      </Link>

      <section className="editorial-panel">
        <p className="eyebrow">Edit Expense</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-slate-900 md:text-5xl">{loading ? 'Expense' : 'Expense'}</h1>
      </section>

      {message.text && (
        <div className={`rounded-[1.5rem] px-5 py-4 text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <section className="editorial-panel">
        {loading ? (
          <div className="space-y-4 py-4">
            <div className="skeleton h-32 rounded-[1.5rem]" />
            <div className="skeleton h-32 rounded-[1.5rem]" />
            <div className="skeleton h-32 rounded-[1.5rem]" />
            <div className="skeleton h-40 rounded-[1.5rem]" />
          </div>
        ) : expense ? (
          <ExpenseForm initialData={expense} onSubmit={handleSubmit} isEditing={true} isSubmitting={isSubmitting} />
        ) : (
          <div className="rounded-[1.5rem] bg-slate-100/70 px-5 py-16 text-center">
            <p className="text-slate-900">Expense not found</p>
            <Link href="/expenses" className="link mt-3 inline-flex">Return to expenses</Link>
          </div>
        )}
      </section>
    </div>
  );
}
