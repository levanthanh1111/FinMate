'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { investmentAssetApi } from '@/lib/api';

export default function InvestmentAssetsPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ query: '', assetType: '', active: '' });

  const fetchAssets = async (nextFilter = filter) => {
    try {
      setLoading(true);
      const request: { query?: string; assetType?: string; active?: boolean } = {};

      if (nextFilter.query) request.query = nextFilter.query;
      if (nextFilter.assetType) request.assetType = nextFilter.assetType;
      if (nextFilter.active === 'true') request.active = true;
      if (nextFilter.active === 'false') request.active = false;

      const data = await investmentAssetApi.searchAssets(request);
      setAssets(data);
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleDeleteAsset = async (id: number) => {
    if (confirm('Are you sure you want to delete this asset?')) {
      try {
        await investmentAssetApi.deleteAsset(id);
        setAssets((prev) => prev.filter((item) => item.id !== id));
      } catch (error) {
        console.error('Error deleting asset:', error);
      }
    }
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = (event: React.FormEvent) => {
    event.preventDefault();
    fetchAssets();
  };

  const resetFilters = () => {
    const reset = { query: '', assetType: '', active: '' };
    setFilter(reset);
    fetchAssets(reset);
  };

  const activeAssets = assets.filter((asset) => asset.active);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="editorial-panel">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Assets</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">Assets</h2>
            </div>
            <Link href="/investments/assets/add" className="btn btn-primary">New Asset</Link>
          </div>
          <form onSubmit={applyFilters} className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="query" className="form-label">Search</label>
              <input id="query" name="query" type="text" className="form-input" placeholder="Symbol or name" value={filter.query} onChange={handleFilterChange} />
            </div>

            <div>
              <label htmlFor="assetType" className="form-label">Asset Type</label>
              <select id="assetType" name="assetType" className="form-input" value={filter.assetType} onChange={handleFilterChange}>
                <option value="">All Types</option>
                <option value="STOCK">STOCK</option>
                <option value="ETF">ETF</option>
                <option value="FUND">FUND</option>
                <option value="CRYPTO">CRYPTO</option>
                <option value="BOND">BOND</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>

            <div>
              <label htmlFor="active" className="form-label">Status</label>
              <select id="active" name="active" className="form-input" value={filter.active} onChange={handleFilterChange}>
                <option value="">All</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button type="submit" className="btn btn-primary">Apply</button>
              <button type="button" className="btn btn-secondary" onClick={resetFilters}>Reset</button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="editorial-panel bg-[linear-gradient(180deg,rgba(243,244,245,0.92)_0%,rgba(255,255,255,0.92)_100%)]">
            <p className="eyebrow">Overview</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="editorial-subpanel">
                <p className="eyebrow">Active</p>
                <p className="mt-4 font-[family:var(--font-manrope)] text-4xl font-semibold tracking-[-0.05em] text-slate-900">{activeAssets.length}</p>
              </div>
              <div className="editorial-subpanel">
                <p className="eyebrow">Inactive</p>
                <p className="mt-4 font-[family:var(--font-manrope)] text-4xl font-semibold tracking-[-0.05em] text-slate-900">{assets.length - activeAssets.length}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="editorial-panel">
        {loading ? (
          <div className="space-y-3 py-8">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="skeleton h-16 rounded-[1.5rem]" />
            ))}
          </div>
        ) : assets.length > 0 ? (
          <div className="space-y-3">
            {assets.map((asset: any) => (
              <div key={asset.id} className="grid gap-4 rounded-[1.5rem] bg-white px-5 py-5 shadow-[0_10px_30px_rgba(25,28,29,0.04)] md:grid-cols-[0.8fr_1.5fr_0.7fr_0.5fr_0.8fr] md:items-center">
                <div>
                  <p className="eyebrow text-[10px] text-slate-400">Symbol</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{asset.symbol}</p>
                </div>
                <div>
                  <p className="eyebrow text-[10px] text-slate-400">Name</p>
                  <p className="mt-2 text-sm text-slate-500">{asset.name}</p>
                </div>
                <div>
                  <p className="eyebrow text-[10px] text-slate-400">Type</p>
                  <p className="mt-2 text-sm text-slate-600">{asset.assetType}</p>
                </div>
                <div>
                  <p className="eyebrow text-[10px] text-slate-400">Currency</p>
                  <p className="mt-2 text-sm text-slate-600">{asset.currency}</p>
                </div>
                <div className="flex items-center justify-between gap-3 md:justify-end">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${asset.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {asset.active ? 'Active' : 'Inactive'}
                  </span>
                  <div className="flex items-center gap-2">
                    <Link href={`/investments/assets/edit/${asset.id}`} className="btn btn-ghost px-3 py-2 text-sm">Edit</Link>
                    <button
                      onClick={() => handleDeleteAsset(asset.id)}
                      className="rounded-full px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-slate-600 font-medium">No assets found</p>
            <Link href="/investments/assets/add" className="btn btn-primary mt-4 inline-flex">Add Asset</Link>
          </div>
        )}
      </section>
    </div>
  );
}
