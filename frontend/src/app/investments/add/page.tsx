'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { investmentApi } from '@/lib/api';

export default function AddInvestmentAssetPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Assuming userId 1 for now
      await investmentApi.createAsset({ ...data, userId: 1 });
      router.push('/investments');
    } catch (error) {
      console.error('Error creating investment asset:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-6">Add Investment Asset</h1>
      <div className="card-static">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="form-label">Name</label>
            <input id="name" type="text" {...register('name', { required: 'Name is required' })} className="form-input" />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message as string}</p>}
          </div>

          <div>
            <label htmlFor="symbol" className="form-label">Symbol</label>
            <input id="symbol" type="text" {...register('symbol')} className="form-input" />
          </div>

          <div>
            <label htmlFor="type" className="form-label">Type</label>
            <select id="type" {...register('type', { required: 'Type is required' })} className="form-input">
              <option value="STOCK">Stock</option>
              <option value="CRYPTO">Crypto</option>
              <option value="GOLD">Gold</option>
              <option value="FUND">Fund</option>
              <option value="REAL_ESTATE">Real Estate</option>
              <option value="OTHER">Other</option>
            </select>
            {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type.message as string}</p>}
          </div>

          <div>
            <label htmlFor="currency" className="form-label">Currency</label>
            <input id="currency" type="text" {...register('currency')} className="form-input" />
          </div>

          <div className="pt-2">
            <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Add Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
