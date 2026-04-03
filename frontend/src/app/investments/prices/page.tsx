'use client';

import { useEffect, useMemo, useState } from 'react';
import { investmentAssetApi, investmentPriceApi } from '@/lib/api';
import { formatCurrency } from '@/lib/currencyService';

type PriceFormState = {
  assetId: string;
  price: string;
  currency: string;
  priceDate: string;
  source: string;
};

export default function InvestmentPricesPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [prices, setPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [form, setForm] = useState<PriceFormState>({
    assetId: '',
    price: '',
    currency: 'VND',
    priceDate: '',
    source: 'MANUAL'
  });

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

  const dateTimeLocalToBackend = (s: string): string => {
    const value = s || nowDateTimeLocal();
    return `${value.replace('T', ' ')}:00.000000`;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assetData, priceData] = await Promise.all([
        investmentAssetApi.getAllAssets(),
        investmentPriceApi.getAllLatestPrices()
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

  const handleCreatePrice = async (e: React.FormEvent) => {
    e.preventDefault();

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
        source: form.source
      });

      setMessage({ text: 'Latest price added.', type: 'success' });
      setForm({
        assetId: '',
        price: '',
        currency: 'VND',
        priceDate: nowDateTimeLocal(),
        source: 'MANUAL'
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

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Latest Prices</h1>
        <p className="text-slate-500 mt-1">Maintain manual market prices used for holdings valuation</p>
      </div>

      <div className="card-static">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Add Latest Price</h2>

        {message.text && (
          <div className={`p-3 mb-4 rounded-xl text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleCreatePrice} className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <select
            className="form-input"
            value={form.assetId}
            onChange={(e) => {
              const assetId = e.target.value;
              const selectedAsset = assets.find((asset) => String(asset.id) === assetId);
              setForm((prev) => ({
                ...prev,
                assetId,
                currency: selectedAsset?.currency || prev.currency
              }));
            }}
            required
          >
            <option value="">Select asset</option>
            {assets.map((asset: any) => (
              <option key={asset.id} value={asset.id}>{asset.symbol} - {asset.name}</option>
            ))}
          </select>

          <input
            type="number"
            step="0.000001"
            min="0"
            className="form-input"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
            required
          />

          <input
            type="text"
            className="form-input"
            value={form.currency}
            maxLength={3}
            onChange={(e) => setForm((prev) => ({ ...prev, currency: e.target.value.toUpperCase() }))}
            required
          />

          <input
            type="datetime-local"
            className="form-input"
            value={form.priceDate}
            onChange={(e) => setForm((prev) => ({ ...prev, priceDate: e.target.value }))}
            required
          />

          <div className="flex gap-2">
            <input
              type="text"
              className="form-input"
              value={form.source}
              onChange={(e) => setForm((prev) => ({ ...prev, source: e.target.value }))}
              placeholder="Source"
            />
            <button type="submit" className="btn btn-primary">Save</button>
          </div>
        </form>
      </div>

      <div className="card-static">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Price Records</h2>

        {loading ? (
          <div className="space-y-3 py-8">
            {[1, 2, 3, 4].map((item) => <div key={item} className="skeleton h-12 w-full" />)}
          </div>
        ) : prices.length === 0 ? (
          <p className="text-sm text-slate-500">No latest prices yet.</p>
        ) : (
          <div className="table-container">
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
                      <td className="table-cell text-right tabular-nums">{formatCurrency(parseFloat(price.price || 0), price.currency || 'VND')}</td>
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
      </div>
    </div>
  );
}
