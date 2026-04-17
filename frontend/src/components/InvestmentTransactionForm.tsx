'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { investmentAssetApi, investmentPortfolioApi } from '@/lib/api';
import { formatCurrency, formatNumberInput, hasMinorUnits, parseMoneyInput } from '@/lib/currencyService';

type InvestmentTransactionFormProps = {
  initialData?: any;
  onSubmit: (data: any) => void;
  isEditing?: boolean;
};

const transactionTypes = ['BUY', 'SELL'];

export default function InvestmentTransactionForm({ initialData, onSubmit, isEditing = false }: InvestmentTransactionFormProps) {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch, setError, clearErrors } = useForm();
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [quantityInput, setQuantityInput] = useState('');
  const [unitPriceInput, setUnitPriceInput] = useState('');
  const [feeInput, setFeeInput] = useState('');
  const [taxInput, setTaxInput] = useState('');
  const selectedAssetId = watch('assetId');

  const selectedAsset = assets.find((asset) => String(asset.id) === String(selectedAssetId));
  const selectedCurrency = selectedAsset?.currency || initialData?.currency || 'VND';
  const watchedType = watch('type') || initialData?.type || 'BUY';

  const parsedQuantity = parseMoneyInput(quantityInput || '0', selectedCurrency);
  const parsedUnitPrice = parseMoneyInput(unitPriceInput || '0', selectedCurrency);
  const parsedFee = parseMoneyInput(feeInput || '0', selectedCurrency);
  const parsedTax = parseMoneyInput(taxInput || '0', selectedCurrency);

  const grossAmount = Number.isFinite(parsedQuantity) && Number.isFinite(parsedUnitPrice)
    ? parsedQuantity * parsedUnitPrice
    : 0;
  const totalCharges = (Number.isFinite(parsedFee) ? parsedFee : 0) + (Number.isFinite(parsedTax) ? parsedTax : 0);
  const netCashFlow = watchedType === 'SELL'
    ? grossAmount - totalCharges
    : -1 * (grossAmount + totalCharges);

  const toDateTimeLocal = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${day}T${h}:${min}`;
  };

  const backendToDateTimeLocal = (s: string): string =>
    s ? s.replace(' ', 'T').slice(0, 16) : toDateTimeLocal(new Date());

  const dateTimeLocalToBackend = (s: string): string =>
    s ? `${s.replace('T', ' ')}:00.000000` : `${toDateTimeLocal(new Date()).replace('T', ' ')}:00.000000`;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [portfolioData, assetData] = await Promise.all([
          investmentPortfolioApi.getAllPortfolios(),
          investmentAssetApi.getAllAssets()
        ]);
        setPortfolios(portfolioData);
        setAssets(assetData.filter((asset: any) => asset.active !== false));
      } catch (error) {
        console.error('Error loading transaction form data:', error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (initialData) {
      setValue('portfolioId', initialData.portfolioId?.toString());
      setValue('assetId', initialData.assetId?.toString());
      setValue('type', initialData.type || 'BUY');
      setValue('note', initialData.note || '');
      setValue('transactionDate', initialData.transactionDate ? backendToDateTimeLocal(initialData.transactionDate) : toDateTimeLocal(new Date()));
      setQuantityInput(formatNumberInput(parseFloat(initialData.quantity) || 0, 'VND'));
      setUnitPriceInput(formatNumberInput(parseFloat(initialData.unitPrice) || 0, selectedCurrency));
      setFeeInput(formatNumberInput(parseFloat(initialData.fee) || 0, selectedCurrency));
      setTaxInput(formatNumberInput(parseFloat(initialData.tax) || 0, selectedCurrency));
    } else {
      setValue('type', 'BUY');
      setValue('transactionDate', toDateTimeLocal(new Date()));
    }
  }, [initialData, setValue, selectedCurrency]);

  const parsePositiveNumber = (value: string, field: 'quantity' | 'unitPrice' | 'fee' | 'tax') => {
    const parsed = parseMoneyInput(value, selectedCurrency);
    if (!Number.isFinite(parsed) || parsed < 0 || (field !== 'fee' && field !== 'tax' && parsed === 0)) {
      setError(field as any, {
        type: 'manual',
        message: field === 'quantity' || field === 'unitPrice'
          ? `${field === 'quantity' ? 'Quantity' : 'Unit price'} must be greater than 0`
          : `${field === 'fee' ? 'Fee' : 'Tax'} must be greater than or equal to 0`
      });
      return null;
    }

    if (!hasMinorUnits(selectedCurrency) && !Number.isInteger(parsed)) {
      setError(field as any, {
        type: 'manual',
        message: `${selectedCurrency} does not use decimal values`
      });
      return null;
    }

    clearErrors(field as any);
    return parsed;
  };

  const handleFormSubmit = (data: any) => {
    const quantity = parsePositiveNumber(quantityInput, 'quantity');
    const unitPrice = parsePositiveNumber(unitPriceInput, 'unitPrice');
    const fee = parsePositiveNumber(feeInput || '0', 'fee');
    const tax = parsePositiveNumber(taxInput || '0', 'tax');

    if (quantity === null || unitPrice === null || fee === null || tax === null) {
      return;
    }

    const payload = {
      portfolioId: parseInt(data.portfolioId, 10),
      assetId: parseInt(data.assetId, 10),
      type: data.type,
      quantity,
      unitPrice,
      fee,
      tax,
      currency: selectedCurrency,
      transactionDate: dateTimeLocalToBackend(data.transactionDate),
      note: data.note || ''
    };

    onSubmit(payload);

    if (!isEditing) {
      reset();
      setQuantityInput('');
      setUnitPriceInput('');
      setFeeInput('');
      setTaxInput('');
      setValue('type', 'BUY');
      setValue('transactionDate', toDateTimeLocal(new Date()));
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="portfolioId" className="form-label">Portfolio</label>
          <select
            id="portfolioId"
            className="form-input"
            {...register('portfolioId', { required: 'Portfolio is required' })}
          >
            <option value="">Select portfolio</option>
            {portfolios.map((portfolio) => (
              <option key={portfolio.id} value={portfolio.id}>{portfolio.name}</option>
            ))}
          </select>
          {errors.portfolioId && <p className="text-red-500 text-sm mt-1">{errors.portfolioId.message as string}</p>}
        </div>

        <div>
          <label htmlFor="assetId" className="form-label">Asset</label>
          <select
            id="assetId"
            className="form-input"
            {...register('assetId', { required: 'Asset is required' })}
          >
            <option value="">Select asset</option>
            {assets.map((asset) => (
              <option key={asset.id} value={asset.id}>{asset.symbol} - {asset.name}</option>
            ))}
          </select>
          {errors.assetId && <p className="text-red-500 text-sm mt-1">{errors.assetId.message as string}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="type" className="form-label">Transaction Type</label>
          <select
            id="type"
            className="form-input"
            {...register('type', { required: 'Transaction type is required' })}
          >
            {transactionTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="transactionDate" className="form-label">Transaction Date</label>
          <input
            id="transactionDate"
            type="datetime-local"
            className="form-input"
            {...register('transactionDate', { required: 'Transaction date is required' })}
          />
          {errors.transactionDate && <p className="text-red-500 text-sm mt-1">{errors.transactionDate.message as string}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="quantity" className="form-label">Quantity</label>
          <input
            id="quantity"
            type="text"
            inputMode="decimal"
            className="form-input"
            value={quantityInput}
            onChange={(e) => {
              setQuantityInput(e.target.value);
              clearErrors('quantity');
            }}
            onBlur={() => {
              const parsed = parseMoneyInput(quantityInput, selectedCurrency);
              if (Number.isFinite(parsed)) {
                setQuantityInput(formatNumberInput(parsed, 'VND'));
              }
            }}
            placeholder="0.00"
          />
          {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity.message as string}</p>}
        </div>

        <div>
          <label htmlFor="unitPrice" className="form-label">Unit Price ({selectedCurrency})</label>
          <input
            id="unitPrice"
            type="text"
            inputMode="decimal"
            className="form-input"
            value={unitPriceInput}
            onChange={(e) => {
              setUnitPriceInput(e.target.value);
              clearErrors('unitPrice');
            }}
            onBlur={() => {
              const parsed = parseMoneyInput(unitPriceInput, selectedCurrency);
              if (Number.isFinite(parsed)) {
                setUnitPriceInput(formatNumberInput(parsed, selectedCurrency));
              }
            }}
            placeholder={hasMinorUnits(selectedCurrency) ? '0.00' : '0'}
          />
          {errors.unitPrice && <p className="text-red-500 text-sm mt-1">{errors.unitPrice.message as string}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="fee" className="form-label">Fee ({selectedCurrency})</label>
          <input
            id="fee"
            type="text"
            inputMode="decimal"
            className="form-input"
            value={feeInput}
            onChange={(e) => {
              setFeeInput(e.target.value);
              clearErrors('fee');
            }}
            onBlur={() => {
              const parsed = parseMoneyInput(feeInput || '0', selectedCurrency);
              if (Number.isFinite(parsed)) {
                setFeeInput(formatNumberInput(parsed, selectedCurrency));
              }
            }}
            placeholder={hasMinorUnits(selectedCurrency) ? '0.00' : '0'}
          />
          {errors.fee && <p className="text-red-500 text-sm mt-1">{errors.fee.message as string}</p>}
        </div>

        <div>
          <label htmlFor="tax" className="form-label">Tax ({selectedCurrency})</label>
          <input
            id="tax"
            type="text"
            inputMode="decimal"
            className="form-input"
            value={taxInput}
            onChange={(e) => {
              setTaxInput(e.target.value);
              clearErrors('tax');
            }}
            onBlur={() => {
              const parsed = parseMoneyInput(taxInput || '0', selectedCurrency);
              if (Number.isFinite(parsed)) {
                setTaxInput(formatNumberInput(parsed, selectedCurrency));
              }
            }}
            placeholder={hasMinorUnits(selectedCurrency) ? '0.00' : '0'}
          />
          {errors.tax && <p className="text-red-500 text-sm mt-1">{errors.tax.message as string}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="note" className="form-label">Note (Optional)</label>
        <textarea
          id="note"
          className="form-input"
          rows={3}
          placeholder="Note"
          {...register('note')}
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-2">Preview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div>
              <p className="text-slate-500">Gross</p>
            <p className="font-medium text-slate-900 tabular-nums">{formatCurrency(grossAmount, selectedCurrency as any)}</p>
          </div>
          <div>
              <p className="text-slate-500">Fees + Taxes</p>
            <p className="font-medium text-slate-900 tabular-nums">{formatCurrency(totalCharges, selectedCurrency as any)}</p>
          </div>
          <div>
              <p className="text-slate-500">Net</p>
            <p className={`font-medium tabular-nums ${netCashFlow >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatCurrency(netCashFlow, selectedCurrency as any)}
            </p>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button type="submit" className="btn btn-primary w-full">
          {isEditing ? 'Update Transaction' : 'Add Transaction'}
        </button>
      </div>
    </form>
  );
}
