'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ExpenseForm from '@/components/ExpenseForm';
import { expenseApi } from '@/lib/api';

export default function AddExpensePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      await expenseApi.createExpense(data);
      setMessage({ text: 'Expense added successfully!', type: 'success' });
      setTimeout(() => {
        router.push('/expenses');
      }, 1500);
    } catch (error) {
      console.error('Error adding expense:', error);
      setMessage({ text: 'Failed to add expense. Please try again.', type: 'error' });
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
        <p className="eyebrow">Add Expense</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-slate-900 md:text-5xl">New Expense</h1>
      </section>

      {message.text && (
        <div className={`rounded-[1.5rem] px-5 py-4 text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <section className="editorial-panel">
        <ExpenseForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </section>
    </div>
  );
}
