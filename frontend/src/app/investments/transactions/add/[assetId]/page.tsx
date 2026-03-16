'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { investmentApi } from '@/lib/api';

export default function AddTransactionPage() {
  const router = useRouter();
  const params = useParams();
  const assetId = parseInt(params.assetId as string, 10);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await investmentApi.recordTransaction({ ...data, assetId });
      router.push(`/investments/${assetId}`);
    } catch (error) {
      console.error('Error recording transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-6">Add Transaction</h1>
      <div className="card-static">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="type" className="form-label">Type</label>
            <select id="type" {...register('type', { required: 'Type is required' })} className="form-input">
              <option value="BUY">Buy</option>
              <option value="SELL">Sell</option>
              <option value="DIVIDEND">Dividend</option>
              <option value="INTEREST">Interest</option>
            </select>
            {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type.message as string}</p>}
          </div>

          <div>
            <label htmlFor="quantity" className="form-label">Quantity</label>
            <input id="quantity" type="number" step="any" {...register('quantity', { required: 'Quantity is required' })} className="form-input" />
            {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity.message as string}</p>}
          </div>

          <div>
            <label htmlFor="price" className="form-label">Price</label>
            <input id="price" type="number" step="any" {...register('price')} className="form-input" />
          </div>

          <div>
            <label htmlFor="fee" className="form-label">Fee</label>
            <input id="fee" type="number" step="any" {...register('fee')} className="form-input" />
          </div>

          <div>
            <label htmlFor="date" className="form-label">Date</label>
            <input id="date" type="datetime-local" {...register('date', { required: 'Date is required' })} className="form-input" />
            {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date.message as string}</p>}
          </div>

          <div>
            <label htmlFor="note" className="form-label">Note</label>
            <textarea id="note" {...register('note')} className="form-input" />
          </div>

          <div className="pt-2">
            <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Record Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
