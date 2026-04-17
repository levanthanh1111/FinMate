'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

type InvestmentPortfolioFormProps = {
  initialData?: {
    id?: number;
    name: string;
    institution?: string;
    baseCurrency: string;
    description?: string;
  };
  onSubmit: (data: {
    name: string;
    institution?: string;
    baseCurrency: string;
    description?: string;
  }) => void;
  isEditing?: boolean;
};

const currencies = ['VND', 'USD', 'EUR', 'JPY', 'KRW', 'HKD', 'CNY'];

export default function InvestmentPortfolioForm({ initialData, onSubmit, isEditing = false }: InvestmentPortfolioFormProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      name: '',
      institution: '',
      baseCurrency: 'VND',
      description: ''
    }
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        institution: initialData.institution || '',
        baseCurrency: initialData.baseCurrency || 'VND',
        description: initialData.description || ''
      });
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit((values) => onSubmit({ ...values, baseCurrency: values.baseCurrency.toUpperCase() }))} className="space-y-4">
      <div>
        <label htmlFor="name" className="form-label">Name</label>
        <input
          id="name"
          type="text"
          className="form-input"
          placeholder="Name"
          {...register('name', { required: 'Portfolio name is required' })}
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message as string}</p>
        )}
      </div>

      <div>
        <label htmlFor="institution" className="form-label">Institution (Optional)</label>
        <input
          id="institution"
          type="text"
          className="form-input"
          placeholder="Institution"
          {...register('institution')}
        />
      </div>

      <div>
        <label htmlFor="baseCurrency" className="form-label">Base Currency</label>
        <select
          id="baseCurrency"
          className="form-input"
          {...register('baseCurrency', { required: 'Base currency is required' })}
        >
          {currencies.map((currency) => (
            <option key={currency} value={currency}>{currency}</option>
          ))}
        </select>
        {errors.baseCurrency && (
          <p className="text-red-500 text-sm mt-1">{errors.baseCurrency.message as string}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="form-label">Description (Optional)</label>
        <textarea
          id="description"
          rows={3}
          className="form-input"
          placeholder="Description"
          {...register('description')}
        />
      </div>

      <div className="pt-2">
        <button type="submit" className="btn btn-primary w-full">
          {isEditing ? 'Update Portfolio' : 'Add Portfolio'}
        </button>
      </div>
    </form>
  );
}
