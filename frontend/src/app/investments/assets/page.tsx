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

      if (nextFilter.query) {
        request.query = nextFilter.query;
      }

      if (nextFilter.assetType) {
        request.assetType = nextFilter.assetType;
      }

      if (nextFilter.active === 'true') {
        request.active = true;
      }

      if (nextFilter.active === 'false') {
        request.active = false;
      }

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

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAssets();
  };

  const resetFilters = () => {
    const reset = { query: '', assetType: '', active: '' };
    setFilter(reset);
    fetchAssets(reset);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Investment Assets</h1>
          <p className="text-slate-500 mt-1">Manage symbols and securities for transactions</p>
        </div>
        <Link href="/investments/assets/add" className="btn btn-primary shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Asset
        </Link>
      </div>

      <div className="card-static">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Filter</h2>
        <form onSubmit={applyFilters} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="query" className="form-label">Search</label>
            <input
              id="query"
              name="query"
              type="text"
              className="form-input"
              placeholder="Symbol or name"
              value={filter.query}
              onChange={handleFilterChange}
            />
          </div>

          <div>
            <label htmlFor="assetType" className="form-label">Asset Type</label>
            <select
              id="assetType"
              name="assetType"
              className="form-input"
              value={filter.assetType}
              onChange={handleFilterChange}
            >
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
            <select
              id="active"
              name="active"
              className="form-input"
              value={filter.active}
              onChange={handleFilterChange}
            >
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

      <div className="card-static">
        {loading ? (
          <div className="space-y-3 py-8">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="skeleton h-12 w-full" />
            ))}
          </div>
        ) : assets.length > 0 ? (
          <div className="table-container">
            <table className="table-default">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Symbol</th>
                  <th className="table-header-cell">Name</th>
                  <th className="table-header-cell">Type</th>
                  <th className="table-header-cell">Currency</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {assets.map((asset: any) => (
                  <tr key={asset.id} className="table-row">
                    <td className="table-cell font-semibold text-slate-800">{asset.symbol}</td>
                    <td className="table-cell">{asset.name}</td>
                    <td className="table-cell">{asset.assetType}</td>
                    <td className="table-cell">{asset.currency}</td>
                    <td className="table-cell">
                      <span className={`inline-flex px-2 py-1 rounded-md text-xs font-semibold ${asset.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {asset.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/investments/assets/edit/${asset.id}`} className="btn btn-ghost py-1.5 px-2 text-sm">Edit</Link>
                        <button
                          onClick={() => handleDeleteAsset(asset.id)}
                          className="btn btn-ghost py-1.5 px-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-slate-600 font-medium">No assets found</p>
            <p className="text-slate-500 text-sm mt-1">Create assets to record investment transactions</p>
            <Link href="/investments/assets/add" className="btn btn-primary mt-4 inline-flex">Add Asset</Link>
          </div>
        )}
      </div>
    </div>
  );
}
