'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { categoryApi } from '@/lib/api';
import { useCurrency } from '@/lib/CurrencyContext';
import {
  CURRENCY_SYMBOLS,
  convertCurrency,
  formatNumberInput,
  getCurrencyDisplay,
  hasMinorUnits,
  parseMoneyInput
} from '@/lib/currencyService';

type ExpenseFormProps = {
  initialData?: any;
  onSubmit: (data: any) => void;
  isEditing?: boolean;
  isSubmitting?: boolean;
};

export default function ExpenseForm({ initialData, onSubmit, isEditing = false, isSubmitting = false }: ExpenseFormProps) {
  const { currency } = useCurrency();
  const { register, handleSubmit, formState: { errors }, reset, setValue, setError, clearErrors } = useForm();
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(initialData?.categoryId?.toString() || '');
  const [amountInput, setAmountInput] = useState('');
  
  // Backend format: yyyy-MM-dd HH:mm:ss.SSSSSS
  const formatDateForBackend = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const s = String(d.getSeconds()).padStart(2, '0');
    const ms = String(d.getMilliseconds() * 1000).padStart(6, '0').slice(0, 6);
    return `${y}-${m}-${day} ${h}:${min}:${s}.${ms}`;
  };

  // datetime-local format: yyyy-MM-ddTHH:mm
  const toDateTimeLocal = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${day}T${h}:${min}`;
  };

  // Parse backend "yyyy-MM-dd HH:mm:ss.SSSSSS" to datetime-local "yyyy-MM-ddTHH:mm"
  const backendToDateTimeLocal = (s: string): string =>
    s ? s.replace(' ', 'T').slice(0, 16) : toDateTimeLocal(new Date());

  // Convert datetime-local "yyyy-MM-ddTHH:mm" to backend format
  const dateTimeLocalToBackend = (s: string): string =>
    s ? s.replace('T', ' ') + ':00.000000' : formatDateForBackend(new Date());

  const getDefaultDateTimeLocal = () => toDateTimeLocal(new Date());

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
    if (initialData) {
      const backendDate = initialData.date
        ? (typeof initialData.date === 'string'
            ? initialData.date
            : formatDateForBackend(new Date(initialData.date)))
        : null;
      const dateTimeLocalValue = backendDate
        ? backendToDateTimeLocal(backendDate)
        : getDefaultDateTimeLocal();

      // Convert backend amount (VND) to selected display currency for input
      convertCurrency(parseFloat(initialData.amount) || 0, 'VND', currency).then((amt) => {
        setAmountInput(formatNumberInput(Math.round(amt * 100) / 100, currency));
      });
      setValue('categoryId', initialData.categoryId);
      setValue('note', initialData.note);
      setValue('date', dateTimeLocalValue);
      setSelectedCategoryId(initialData.categoryId?.toString() || '');
    }
  }, [initialData, setValue, currency]);
  
  useEffect(() => {
    if (!initialData) {
      setAmountInput('');
    }
  }, [currency, initialData]);

  const handleFormSubmit = async (data: any) => {
    const parsedAmount = parseMoneyInput(amountInput, currency);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('amount', { type: 'manual', message: 'Amount must be greater than 0' });
      return;
    }

    if (!hasMinorUnits(currency) && !Number.isInteger(parsedAmount)) {
      setError('amount', { type: 'manual', message: `${currency} does not use decimal values` });
      return;
    }

    clearErrors('amount');

    const dateValue = data.date
      ? dateTimeLocalToBackend(data.date)
      : formatDateForBackend(new Date());

    // Convert from selected currency to VND for backend storage
    const amountInDisplayCurrency = parsedAmount;
    const amountInVnd = await convertCurrency(amountInDisplayCurrency, currency, 'VND');

    onSubmit({
      amount: Math.round(amountInVnd),
      categoryId: parseInt(data.categoryId, 10),
      note: data.note,
      date: dateValue
    });
    
    if (!isEditing) {
      reset();
      setAmountInput('');
      setSelectedCategoryId('');
    }
  };
  
  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="rounded-[1.5rem] bg-slate-100/70 p-5 md:p-6">
        <label htmlFor="amount" className="form-label">Amount ({CURRENCY_SYMBOLS[currency]} {currency})</label>
        <input
          id="amount"
          type="text"
          inputMode="decimal"
          className="form-input"
          placeholder={hasMinorUnits(currency) ? '0.00' : '0'}
          value={amountInput}
          onChange={(e) => {
            setAmountInput(e.target.value);
            if (errors.amount) clearErrors('amount');
          }}
          onBlur={() => {
            const parsed = parseMoneyInput(amountInput, currency);
            if (Number.isFinite(parsed)) {
              setAmountInput(formatNumberInput(parsed, currency));
            }
          }}
        />
        {errors.amount && (
          <p className="text-red-500 text-sm mt-1">{errors.amount.message as string}</p>
        )}
      </div>
      
      <div className="rounded-[1.5rem] bg-slate-100/70 p-5 md:p-6">
        <label htmlFor="categoryId" className="form-label">Category</label>
        <select
          id="categoryId"
          className="form-input"
          {...register('categoryId', { required: 'Category is required' })}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
          value={selectedCategoryId}
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="text-red-500 text-sm mt-1">{errors.categoryId.message as string}</p>
        )}
      </div>
      
      <div className="rounded-[1.5rem] bg-slate-100/70 p-5 md:p-6">
        <label htmlFor="date" className="form-label">Date & Time</label>
        <input
          id="date"
          type="datetime-local"
          className="form-input"
          max={getDefaultDateTimeLocal()}
          defaultValue={!initialData ? getDefaultDateTimeLocal() : undefined}
          {...register('date', { required: 'Date is required' })}
        />
        {errors.date && (
          <p className="text-red-500 text-sm mt-1">{errors.date.message as string}</p>
        )}
      </div>
      
      <div className="rounded-[1.5rem] bg-slate-100/70 p-5 md:p-6">
        <label htmlFor="note" className="form-label">Note (Optional)</label>
        <textarea
          id="note"
          className="form-input min-h-32 resize-y"
          rows={4}
          placeholder="Note"
          {...register('note')}
        />
      </div>
      
      <div className="rounded-[1.5rem] bg-[linear-gradient(180deg,rgba(243,244,245,0.9)_0%,rgba(255,255,255,0.9)_100%)] p-5 md:p-6">
        <div className="flex justify-end">
          <button type="submit" className="btn btn-primary w-full md:w-auto" disabled={isSubmitting}>
            {isSubmitting ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Expense' : 'Add Expense')}
          </button>
        </div>
      </div>
    </form>
  );
}
