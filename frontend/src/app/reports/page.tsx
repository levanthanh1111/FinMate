'use client';

import { useState, useEffect } from 'react';
import { expenseApi } from '@/lib/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<any>({
    categories: [],
    amounts: [],
    total: 0
  });
  const [trendData, setTrendData] = useState<any>({
    labels: [],
    amounts: []
  });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [trendPeriod, setTrendPeriod] = useState(6); // Default to 6 months

  useEffect(() => {
    if (activeTab === 'monthly') {
      fetchMonthlySummary();
    } else {
      fetchTrendData();
    }
  }, [activeTab, selectedYear, selectedMonth, trendPeriod]);

  const fetchMonthlySummary = async () => {
    try {
      setLoading(true);
      const data = await expenseApi.getMonthlySummary(selectedYear, selectedMonth);
      
      // Process data for chart
      const categories: string[] = [];
      const amounts: number[] = [];
      let total = 0;
      
      data.forEach((item: any) => {
        categories.push(item[0]);
        const amount = parseFloat(item[1]);
        amounts.push(amount);
        total += amount;
      });
      
      setMonthlyData({
        categories,
        amounts,
        total
      });
    } catch (error) {
      console.error('Error fetching monthly summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendData = async () => {
    try {
      setLoading(true);
      const data = await expenseApi.getSpendingTrends();
      
      // Process data for trend chart
      const sortedData = [...data].sort((a, b) => {
        // Sort by year and month
        if (a[0] !== b[0]) return a[0] - b[0];
        return a[1] - b[1];
      });
      
      // Get only the last N months based on trendPeriod
      const filteredData = sortedData.slice(-trendPeriod);
      
      const labels = filteredData.map((item: any) => {
        const year = item[0];
        const month = item[1];
        return `${month}/${year}`;
      });
      
      const amounts = filteredData.map((item: any) => parseFloat(item[2]));
      
      setTrendData({
        labels,
        amounts
      });
    } catch (error) {
      console.error('Error fetching trend data:', error);
    } finally {
      setLoading(false);
    }
  };

  const monthlyChartData = {
    labels: monthlyData.categories,
    datasets: [
      {
        label: 'Spending by Category',
        data: monthlyData.amounts,
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(199, 199, 199, 0.6)',
          'rgba(83, 102, 255, 0.6)',
          'rgba(78, 205, 196, 0.6)',
          'rgba(255, 99, 255, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const trendChartData = {
    labels: trendData.labels,
    datasets: [
      {
        label: 'Monthly Spending',
        data: trendData.amounts,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.3,
      },
    ],
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Get current year and past 5 years for dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reports & Insights</h1>
      
      <div className="flex border-b">
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'monthly' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('monthly')}
        >
          Monthly Summary
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'trends' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('trends')}
        >
          Spending Trends
        </button>
      </div>
      
      {activeTab === 'monthly' ? (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Monthly Spending Summary</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label htmlFor="year" className="form-label">Year</label>
                <select
                  id="year"
                  className="form-input"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="month" className="form-label">Month</label>
                <select
                  id="month"
                  className="form-input"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                >
                  {months.map((month, index) => (
                    <option key={month} value={index + 1}>{month}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-10">Loading data...</div>
            ) : monthlyData.categories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Total Spending</h3>
                  <p className="text-3xl font-bold text-blue-600">${monthlyData.total.toFixed(2)}</p>
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-2">Top Categories</h3>
                    <ul className="space-y-2">
                      {monthlyData.categories.slice(0, 3).map((category: string, index: number) => (
                        <li key={category} className="flex justify-between">
                          <span>{category}</span>
                          <span className="font-medium">${monthlyData.amounts[index].toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="h-64">
                  <Pie data={monthlyChartData} options={{ maintainAspectRatio: false }} />
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                No data available for this month.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Spending Trends Over Time</h2>
            
            <div className="mb-6">
              <label htmlFor="trendPeriod" className="form-label">Time Period</label>
              <select
                id="trendPeriod"
                className="form-input w-full md:w-1/3"
                value={trendPeriod}
                onChange={(e) => setTrendPeriod(parseInt(e.target.value))}
              >
                <option value={3}>Last 3 Months</option>
                <option value={6}>Last 6 Months</option>
                <option value={12}>Last 12 Months</option>
              </select>
            </div>
            
            {loading ? (
              <div className="text-center py-10">Loading data...</div>
            ) : trendData.labels.length > 0 ? (
              <div className="h-80">
                <Line 
                  data={trendChartData} 
                  options={{
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Amount ($)'
                        }
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Month/Year'
                        }
                      }
                    }
                  }} 
                />
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                No trend data available.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}