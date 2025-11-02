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
      <div className="mb-6 flex items-center">
        <Link href="/expenses" className="text-blue-600 hover:underline mr-4">
          ← Back to Expenses
        </Link>
        <h1 className="text-3xl font-bold">Edit Expense</h1>
      </div>

      {message.text && (
        <div className={`p-4 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="text-center py-10">Loading expense data...</div>
        ) : expense ? (
          <ExpenseForm initialData={expense} onSubmit={handleSubmit} isEditing={true} />
        ) : (
          <div className="text-center py-10 text-red-600">
            Expense not found. <Link href="/expenses" className="underline">Return to expenses</Link>
          </div>
        )}
      </div>
    </div>
  );
}