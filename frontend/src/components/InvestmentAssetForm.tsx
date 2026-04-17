'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

type InvestmentAssetFormProps = {
  initialData?: {
    id?: number;
    symbol: string;
    name: string;
    assetType: string;
    market?: string;
    currency: string;
    active?: boolean;
  };
  onSubmit: (data: {
    symbol: string;
    name: string;
    assetType: string;
    market?: string;
    currency: string;
    active: boolean;
  }) => void;
  isEditing?: boolean;
};

const assetTypes = ['STOCK', 'ETF', 'FUND', 'CRYPTO', 'BOND', 'OTHER'];
const currencies = ['VND', 'USD', 'EUR', 'JPY', 'KRW', 'HKD', 'CNY'];

export default function InvestmentAssetForm({ initialData, onSubmit, isEditing = false }: InvestmentAssetFormProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      symbol: '',
      name: '',
      assetType: 'STOCK',
      market: '',
      currency: 'VND',
      active: true
    }
  });

  useEffect(() => {
    if (initialData) {
      reset({
        symbol: initialData.symbol,
        name: initialData.name,
        assetType: initialData.assetType || 'STOCK',
        market: initialData.market || '',
        currency: initialData.currency || 'VND',
        active: initialData.active ?? true
      });
    }
  }, [initialData, reset]);

  return (
    <form
      onSubmit={handleSubmit((values) => onSubmit({
        ...values,
        symbol: values.symbol.toUpperCase(),
        assetType: values.assetType.toUpperCase(),
        currency: values.currency.toUpperCase()
      }))}
      className="space-y-4"
    >
      <div>
        <label htmlFor="symbol" className="form-label">Symbol</label>
        <input
          id="symbol"
          type="text"
          className="form-input uppercase"
          placeholder="Symbol"
          {...register('symbol', { required: 'Symbol is required' })}
        />
        {errors.symbol && (
          <p className="text-red-500 text-sm mt-1">{errors.symbol.message as string}</p>
        )}
      </div>

      <div>
        <label htmlFor="name" className="form-label">Name</label>
        <input
          id="name"
          type="text"
          className="form-input"
          placeholder="Name"
          {...register('name', { required: 'Asset name is required' })}
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message as string}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="assetType" className="form-label">Asset Type</label>
          <select
            id="assetType"
            className="form-input"
            {...register('assetType', { required: 'Asset type is required' })}
          >
            {assetTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="currency" className="form-label">Currency</label>
          <select
            id="currency"
            className="form-input"
            {...register('currency', { required: 'Currency is required' })}
          >
            {currencies.map((currency) => (
              <option key={currency} value={currency}>{currency}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="market" className="form-label">Market (Optional)</label>
        <input
          id="market"
          type="text"
          className="form-input"
          placeholder="Market"
          {...register('market')}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="active"
          type="checkbox"
          className="h-4 w-4"
          {...register('active')}
        />
        <label htmlFor="active" className="text-sm text-slate-700">Active asset</label>
      </div>

      <div className="pt-2">
        <button type="submit" className="btn btn-primary w-full">
          {isEditing ? 'Update Asset' : 'Add Asset'}
        </button>
      </div>
    </form>
  );
}
