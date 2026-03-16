'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { investmentApi } from '@/lib/api';

export default function InvestmentsPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        // Assuming userId 1 for now
        const data = await investmentApi.getAssetsByUserId(1);
        setAssets(data);
      } catch (error) {
        console.error('Error fetching investment assets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Investments</h1>
          <p className="text-slate-500 mt-1">Track your investment portfolio</p>
        </div>
        <Link href="/investments/add" className="btn btn-primary shrink-0">
          Add Asset
        </Link>
      </div>

      <div className="card-static">
        {loading ? (
          <p>Loading...</p>
        ) : assets.length > 0 ? (
          <div className="table-container">
            <table className="table-default">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Name</th>
                  <th className="table-header-cell">Symbol</th>
                  <th className="table-header-cell">Type</th>
                  <th className="table-header-cell">Currency</th>
                  <th className="table-header-cell text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {assets.map((asset) => (
                  <tr key={asset.id} className="table-row">
                    <td className="table-cell font-medium text-slate-800">{asset.name}</td>
                    <td className="table-cell">{asset.symbol}</td>
                    <td className="table-cell">{asset.type}</td>
                    <td className="table-cell">{asset.currency}</td>
                    <td className="table-cell text-right">
                      <Link href={`/investments/${asset.id}`} className="btn btn-ghost py-1.5 px-2 text-sm">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No investment assets yet.</p>
        )}
      </div>
    </div>
  );
}
