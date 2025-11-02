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
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-center">
        <Link href="/expenses" className="text-blue-600 hover:underline mr-4">
          ← Back to Expenses
        </Link>
        <h1 className="text-3xl font-bold">Add New Expense</h1>
      </div>

      {message.text && (
        <div className={`p-4 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="card">
        <ExpenseForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}