'use client';

import { useState, useEffect } from 'react';
import { expenseApi } from '@/lib/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import Link from 'next/link';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<any>({
    categories: [],
    amounts: [],
    total: 0
  });
  const [categoryTotals, setCategoryTotals] = useState<any>({
    categories: [],
    amounts: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get current year and month
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        
        // Fetch data in parallel
        const [recentData, summaryData] = await Promise.all([
          expenseApi.getAllExpenses(),
          expenseApi.getMonthlySummary(currentYear, currentMonth)
        ]);
        
        // Process recent expenses
        setRecentExpenses(recentData.slice(0, 5));
        
        // Process monthly summary
        const categories: string[] = [];
        const amounts: number[] = [];
        let total = 0;
        
        summaryData.forEach((item: any) => {
          categories.push(item[0]);
          const amount = parseFloat(item[1]);
          amounts.push(amount);
          total += amount;
        });
        
        setMonthlySummary({
          categories,
          amounts,
          total
        });
        
        // Process category totals for bar chart
        const categoryMap = new Map();
        recentData.forEach((expense: any) => {
          const category = expense.category;
          const amount = parseFloat(expense.amount);
          
          if (categoryMap.has(category)) {
            categoryMap.set(category, categoryMap.get(category) + amount);
          } else {
            categoryMap.set(category, amount);
          }
        });
        
        const sortedCategories = Array.from(categoryMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);
        
        setCategoryTotals({
          categories: sortedCategories.map(item => item[0]),
          amounts: sortedCategories.map(item => item[1])
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const pieChartData = {
    labels: monthlySummary.categories,
    datasets: [
      {
        label: 'Monthly Spending',
        data: monthlySummary.amounts,
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const barChartData = {
    labels: categoryTotals.categories,
    datasets: [
      {
        label: 'Total Spending by Category',
        data: categoryTotals.amounts,
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return <div className="text-center py-10">Loading dashboard data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Monthly Overview</h2>
          <div className="mb-4">
            <h3 className="text-lg font-medium">Total Spending</h3>
            <p className="text-3xl font-bold text-blue-600">
              ${monthlySummary.total.toFixed(2)}
            </p>
          </div>
          
          {monthlySummary.categories.length > 0 ? (
            <div className="h-64">
              <Pie data={pieChartData} options={{ maintainAspectRatio: false }} />
            </div>
          ) : (
            <p className="text-gray-500">No data available for this month</p>
          )}
        </div>
        
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Top Categories</h2>
          {categoryTotals.categories.length > 0 ? (
            <div className="h-64">
              <Bar 
                data={barChartData} 
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Amount ($)'
                      }
                    }
                  }
                }} 
              />
            </div>
          ) : (
            <p className="text-gray-500">No category data available</p>
          )}
        </div>
      </div>
      
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Expenses</h2>
          <Link href="/expenses" className="text-blue-600 hover:text-blue-800">
            View All
          </Link>
        </div>
        
        {recentExpenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentExpenses.map((expense) => (
                  <tr key={expense.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(expense.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {expense.category}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {expense.note || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                      ${parseFloat(expense.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 py-4">No recent expenses</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/expenses/add" className="card bg-blue-50 hover:bg-blue-100 transition-colors">
          <div className="p-4 text-center">
            <h3 className="text-lg font-medium text-blue-700">Add Expense</h3>
            <p className="text-sm text-blue-600 mt-1">Record a new transaction</p>
          </div>
        </Link>
        
        <Link href="/reports" className="card bg-green-50 hover:bg-green-100 transition-colors">
          <div className="p-4 text-center">
            <h3 className="text-lg font-medium text-green-700">View Reports</h3>
            <p className="text-sm text-green-600 mt-1">Analyze your spending</p>
          </div>
        </Link>
        
        <Link href="/expenses" className="card bg-purple-50 hover:bg-purple-100 transition-colors">
          <div className="p-4 text-center">
            <h3 className="text-lg font-medium text-purple-700">Manage Expenses</h3>
            <p className="text-sm text-purple-600 mt-1">View and edit your expenses</p>
          </div>
        </Link>
      </div>
    </div>
  );
}