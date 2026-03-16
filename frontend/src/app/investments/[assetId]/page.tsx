'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { investmentApi } from '@/lib/api';

export default function AssetDetailPage() {
  const params = useParams();
  const assetId = parseInt(params.assetId as string, 10);
  const [asset, setAsset] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState('');

  useEffect(() => {
    const fetchAssetDetails = async () => {
      try {
        // This is a placeholder for fetching the asset itself if needed
        // For now, we get transactions and calculate portfolio
        const transData = await investmentApi.getTransactionsByAssetId(assetId);
        setTransactions(transData);
      } catch (error) {
        console.error('Error fetching asset details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (assetId) {
      fetchAssetDetails();
    }
  }, [assetId]);

  const handlePortfolioCalculation = async () => {
    if (!currentPrice) {
      alert('Please enter a current price.');
      return;
    }
    try {
      const portfolioData = await investmentApi.getPortfolioDetail(assetId, parseFloat(currentPrice));
      setPortfolio(portfolioData);
    } catch (error) {
      console.error('Error calculating portfolio:', error);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Link href="/investments" className="text-sm text-slate-500 hover:text-slate-700"> &larr; Back to Investments</Link>
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Asset Details</h1>

      <div className="card-static">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Portfolio Summary</h2>
        <div className="flex items-center gap-4 mb-4">
          <input
            type="number"
            value={currentPrice}
            onChange={(e) => setCurrentPrice(e.target.value)}
            placeholder="Enter current price"
            className="form-input"
          />
          <button onClick={handlePortfolioCalculation} className="btn btn-primary">
            Calculate
          </button>
        </div>
        {portfolio && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-slate-500">Total Quantity</p>
              <p className="text-lg font-semibold text-slate-900">{portfolio.totalQuantity}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Avg. Buy Price</p>
              <p className="text-lg font-semibold text-slate-900">{portfolio.averageBuyPrice}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Market Value</p>
              <p className="text-lg font-semibold text-slate-900">{portfolio.currentMarketValue}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Profit/Loss</p>
              <p className={`text-lg font-semibold ${portfolio.profitOrLoss >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {portfolio.profitOrLoss}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="card-static">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Transaction History</h2>
          <Link href={`/investments/transactions/add/${assetId}`} className="btn btn-secondary">
            Add Transaction
          </Link>
        </div>
        {loading ? (
          <p>Loading transactions...</p>
        ) : transactions.length > 0 ? (
          <div className="table-container">
            <table className="table-default">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Date</th>
                  <th className="table-header-cell">Type</th>
                  <th className="table-header-cell">Quantity</th>
                  <th className="table-header-cell">Price</th>
                  <th className="table-header-cell">Fee</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="table-row">
                    <td className="table-cell">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="table-cell">{tx.type}</td>
                    <td className="table-cell">{tx.quantity}</td>
                    <td className="table-cell">{tx.price}</td>
                    <td className="table-cell">{tx.fee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No transactions for this asset yet.</p>
        )}
      </div>
    </div>
  );
}
