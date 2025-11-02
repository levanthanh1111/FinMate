'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

const CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Housing',
  'Utilities',
  'Entertainment',
  'Shopping',
  'Healthcare',
  'Education',
  'Personal Care',
  'Travel',
  'Other'
];

type ExpenseFormProps = {
  initialData?: any;
  onSubmit: (data: any) => void;
  isEditing?: boolean;
};

export default function ExpenseForm({ initialData, onSubmit, isEditing = false }: ExpenseFormProps) {
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();
  const [selectedCategory, setSelectedCategory] = useState(initialData?.category || '');
  
  // Set max date to today
  const today = new Date().toISOString().split('T')[0];
  
  useEffect(() => {
    if (initialData) {
      // Format date to YYYY-MM-DD for the date input
      const formattedDate = initialData.date 
        ? new Date(initialData.date).toISOString().split('T')[0]
        : today;
        
      setValue('amount', initialData.amount);
      setValue('category', initialData.category);
      setValue('note', initialData.note);
      setValue('date', formattedDate);
      setSelectedCategory(initialData.category);
    }
  }, [initialData, setValue, today]);
  
  const handleFormSubmit = (data: any) => {
    onSubmit({
      ...data,
      amount: parseFloat(data.amount)
    });
    
    if (!isEditing) {
      reset();
      setSelectedCategory('');
    }
  };
  
  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label htmlFor="amount" className="form-label">Amount ($)</label>
        <input
          id="amount"
          type="number"
          step="0.01"
          className="form-input"
          placeholder="0.00"
          {...register('amount', { 
            required: 'Amount is required',
            min: { value: 0.01, message: 'Amount must be greater than 0' },
            valueAsNumber: true
          })}
        />
        {errors.amount && (
          <p className="text-red-500 text-sm mt-1">{errors.amount.message as string}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="category" className="form-label">Category</label>
        <select
          id="category"
          className="form-input"
          {...register('category', { required: 'Category is required' })}
          onChange={(e) => setSelectedCategory(e.target.value)}
          value={selectedCategory}
        >
          <option value="">Select a category</option>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-red-500 text-sm mt-1">{errors.category.message as string}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="date" className="form-label">Date</label>
        <input
          id="date"
          type="date"
          className="form-input"
          max={today}
          {...register('date', { required: 'Date is required' })}
        />
        {errors.date && (
          <p className="text-red-500 text-sm mt-1">{errors.date.message as string}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="note" className="form-label">Note (Optional)</label>
        <textarea
          id="note"
          className="form-input"
          rows={3}
          placeholder="Add a note about this expense"
          {...register('note')}
        />
      </div>
      
      <div className="pt-2">
        <button type="submit" className="btn btn-primary w-full">
          {isEditing ? 'Update Expense' : 'Add Expense'}
        </button>
      </div>
    </form>
  );
}