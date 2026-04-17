'use client';

import { useEffect, useMemo, useState } from 'react';
import { investmentAssetApi, investmentPriceApi } from '@/lib/api';
import { convertCurrency, formatCurrency } from '@/lib/currencyService';
import { useCurrency } from '@/lib/CurrencyContext';

type PriceFormState = {
  assetId: string;
  price: string;
  currency: string;
  priceDate: string;
  source: string;
};

export default function InvestmentPricesPage() {
  const { currency } = useCurrency();
  const [assets, setAssets] = useState<any[]>([]);
  const [prices, setPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [form, setForm] = useState<PriceFormState>({
    assetId: '',
    price: '',
    currency: 'VND',
    priceDate: '',
    source: 'MANUAL',
  });
  const [convertedPrices, setConvertedPrices] = useState<Record<number, number>>({});

  const assetById = useMemo(() => Object.fromEntries(assets.map((asset: any) => [asset.id, asset])), [assets]);

  const nowDateTimeLocal = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const h = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${d}T${h}:${min}`;
  };

  const dateTimeLocalToBackend = (value: string): string => {
    const resolved = value || nowDateTimeLocal();
    return `${resolved.replace('T', ' ')}:00.000000`;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assetData, priceData] = await Promise.all([
        investmentAssetApi.getAllAssets(),
        investmentPriceApi.getAllLatestPrices(),
      ]);
      setAssets(assetData);
      setPrices(priceData);
    } catch (error) {
      console.error('Error loading prices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setForm((prev) => ({ ...prev, priceDate: nowDateTimeLocal() }));
    fetchData();
  }, []);

  const handleCreatePrice = async (event: React.FormEvent) => {
    event.preventDefault();

    const asset = assets.find((item) => String(item.id) === form.assetId);
    if (!asset) {
      setMessage({ text: 'Please choose an asset.', type: 'error' });
      return;
    }

    const parsedPrice = Number(form.price);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setMessage({ text: 'Price must be greater than 0.', type: 'error' });
      return;
    }

    try {
      await investmentPriceApi.createLatestPrice({
        assetId: asset.id,
        price: parsedPrice,
        currency: form.currency,
        priceDate: dateTimeLocalToBackend(form.priceDate),
        source: form.source,
      });

      setMessage({ text: 'Latest price added.', type: 'success' });
      setForm({
        assetId: '',
        price: '',
        currency: 'VND',
        priceDate: nowDateTimeLocal(),
        source: 'MANUAL',
      });
      await fetchData();
    } catch (error) {
      console.error('Error creating latest price:', error);
      setMessage({ text: 'Failed to save latest price.', type: 'error' });
    }
  };

  const handleDeletePrice = async (id: number) => {
    if (!confirm('Delete this price record?')) {
      return;
    }

    try {
      await investmentPriceApi.deleteLatestPrice(id);
      setPrices((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Error deleting latest price:', error);
    }
  };

  const latestPrice = prices[0];

  useEffect(() => {
    const convertPriceValues = async () => {
      const entries = await Promise.all(
        prices.map(async (price: any) => [price.id, await convertCurrency(parseFloat(price.price || 0), price.currency || 'VND', currency)] as const),
      );
      setConvertedPrices(Object.fromEntries(entries));
    };

    convertPriceValues();
  }, [prices, currency]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="editorial-panel">
          <p className="eyebrow">Latest Prices</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">Latest Prices</h2>

          {message.text && (
            <div className={`mt-4 rounded-[1.25rem] px-4 py-3 text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleCreatePrice} className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="form-label">Asset</label>
              <select
                className="form-input"
                value={form.assetId}
                onChange={(event) => {
                  const assetId = event.target.value;
                  const selectedAsset = assets.find((asset) => String(asset.id) === assetId);
                  setForm((prev) => ({
                    ...prev,
                    assetId,
                    currency: selectedAsset?.currency || prev.currency,
                  }));
                }}
                required
              >
                <option value="">Select asset</option>
                {assets.map((asset: any) => (
                  <option key={asset.id} value={asset.id}>{asset.symbol} - {asset.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Price</label>
              <input
                type="number"
                step="0.000001"
                min="0"
                className="form-input"
                placeholder="Price"
                value={form.price}
                onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                required
              />
            </div>

            <div>
              <label className="form-label">Currency</label>
              <input
                type="text"
                className="form-input"
                value={form.currency}
                maxLength={3}
                onChange={(event) => setForm((prev) => ({ ...prev, currency: event.target.value.toUpperCase() }))}
                required
              />
            </div>

            <div>
              <label className="form-label">Date</label>
              <input
                type="datetime-local"
                className="form-input"
                value={form.priceDate}
                onChange={(event) => setForm((prev) => ({ ...prev, priceDate: event.target.value }))}
                required
              />
            </div>

            <div>
              <label className="form-label">Source</label>
              <input
                type="text"
                className="form-input"
                value={form.source}
                onChange={(event) => setForm((prev) => ({ ...prev, source: event.target.value }))}
                placeholder="Source"
              />
            </div>

            <div className="flex items-end">
              <button type="submit" className="btn btn-primary w-full md:w-auto">Save Price</button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="editorial-panel bg-[linear-gradient(180deg,rgba(243,244,245,0.92)_0%,rgba(255,255,255,0.92)_100%)]">
            <p className="eyebrow">Latest Recorded Price</p>
            {latestPrice ? (
              <div className="mt-3 space-y-2">
                <p className="text-xl font-semibold text-slate-900">{assetById[latestPrice.assetId]?.symbol || `Asset ${latestPrice.assetId}`}</p>
                <p className="font-[family:var(--font-manrope)] text-2xl font-semibold tracking-[-0.04em] text-slate-900">
                  {formatCurrency(convertedPrices[latestPrice.id] ?? 0, currency)}
                </p>
                <p className="text-sm text-slate-500">{new Date(latestPrice.priceDate).toLocaleString()} • {latestPrice.source || 'Manual'}</p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">No latest prices yet.</p>
            )}
          </div>
        </div>
      </section>

      <section className="editorial-panel">
        <p className="eyebrow">Price Records</p>

        {loading ? (
          <div className="mt-6 space-y-3 py-8">
            {[1, 2, 3, 4].map((item) => <div key={item} className="skeleton h-12 w-full" />)}
          </div>
        ) : prices.length === 0 ? (
          <div className="mt-6 text-sm text-slate-500">No latest prices yet.</div>
        ) : (
          <div className="mt-6 table-container">
            <table className="table-default">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Asset</th>
                  <th className="table-header-cell text-right">Price</th>
                  <th className="table-header-cell">Date</th>
                  <th className="table-header-cell">Source</th>
                  <th className="table-header-cell text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {prices.map((price: any) => {
                  const asset = assetById[price.assetId];
                  return (
                    <tr key={price.id} className="table-row">
                      <td className="table-cell font-medium text-slate-800">{asset?.symbol || `Asset ${price.assetId}`}</td>
                      <td className="table-cell text-right tabular-nums">{formatCurrency(convertedPrices[price.id] ?? 0, currency)}</td>
                      <td className="table-cell">{new Date(price.priceDate).toLocaleString()}</td>
                      <td className="table-cell">{price.source || '—'}</td>
                      <td className="table-cell text-right">
                        <button
                          className="btn btn-ghost py-1.5 px-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeletePrice(price.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
