'use client';

import { useState, useEffect } from 'react';
import { expenseApi, dashboardApi } from '@/lib/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import Link from 'next/link';
import { useCurrency } from '@/lib/CurrencyContext';
import { convertCurrency, formatCurrency, CurrencyCode, CURRENCY_SYMBOLS } from '@/lib/currencyService';

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
  
  // Get currency context
  const { currency, isLoading: currencyLoading } = useCurrency();
  
  // State for converted amounts
  const [convertedMonthlySummary, setConvertedMonthlySummary] = useState<any>({
    categories: [],
    amounts: [],
    total: 0
  });
  const [convertedCategoryTotals, setConvertedCategoryTotals] = useState<any>({
    categories: [],
    amounts: []
  });
  const [convertedRecentExpenses, setConvertedRecentExpenses] = useState<any[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  // Check if we're using mock data - moved to top level
  const [isMockData, setIsMockData] = useState(false);

  // Mock data for when the API is unavailable
  const mockMonthlySummary = {
    categories: ['Food', 'Transportation', 'Entertainment', 'Utilities', 'Shopping'],
    amounts: [350, 200, 150, 120, 280],
    total: 1100
  };

  const mockRecentExpenses = [
    { id: 1, description: 'Grocery shopping', amount: 85.50, date: '2023-11-15', category: 'Food' },
    { id: 2, description: 'Movie tickets', amount: 32.00, date: '2023-11-14', category: 'Entertainment' },
    { id: 3, description: 'Uber ride', amount: 24.75, date: '2023-11-13', category: 'Transportation' },
    { id: 4, description: 'Electricity bill', amount: 95.20, date: '2023-11-12', category: 'Utilities' },
    { id: 5, description: 'New shoes', amount: 120.00, date: '2023-11-11', category: 'Shopping' }
  ];

  const mockCategoryTotals = {
    categories: ['Food', 'Shopping', 'Utilities', 'Entertainment', 'Transportation'],
    amounts: [350, 280, 120, 150, 200]
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get current year and month
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        
        try {
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
          // Use mock data when API is unavailable
          setMonthlySummary(mockMonthlySummary);
          setRecentExpenses(mockRecentExpenses);
          setCategoryTotals(mockCategoryTotals);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Effect to convert amounts when currency changes
  useEffect(() => {
    const convertAmounts = async () => {
      if (loading || currencyLoading || monthlySummary.categories.length === 0) {
        return;
      }
      
      try {
        setIsConverting(true);
        
        // Convert monthly summary amounts
        const convertedAmounts = await Promise.all(
          monthlySummary.amounts.map((amount: number) => 
            convertCurrency(amount, 'USD', currency)
          )
        );
        
        const convertedTotal = await convertCurrency(monthlySummary.total, 'USD', currency);
        
        setConvertedMonthlySummary({
          categories: monthlySummary.categories,
          amounts: convertedAmounts,
          total: convertedTotal
        });
        
        // Convert category totals
        const convertedCategoryAmounts = await Promise.all(
          categoryTotals.amounts.map((amount: number) => 
            convertCurrency(amount, 'USD', currency)
          )
        );
        
        setConvertedCategoryTotals({
          categories: categoryTotals.categories,
          amounts: convertedCategoryAmounts
        });
        
        // Convert recent expenses
        const expensesWithConvertedAmounts = await Promise.all(
          recentExpenses.map(async (expense) => {
            const convertedAmount = await convertCurrency(
              parseFloat(expense.amount),
              'USD',
              currency
            );
            return { ...expense, convertedAmount };
          })
        );
        
        setConvertedRecentExpenses(expensesWithConvertedAmounts);
      } catch (error) {
        console.error('Error converting currency:', error);
      } finally {
        setIsConverting(false);
      }
    };
    
    convertAmounts();
  }, [currency, monthlySummary, categoryTotals, recentExpenses, loading, currencyLoading]);

  const pieChartData = {
    labels: monthlySummary.categories,
    datasets: [
      {
        label: 'Monthly Spending',
        data: isConverting ? [] : (convertedMonthlySummary.amounts.length > 0 ? convertedMonthlySummary.amounts : monthlySummary.amounts),
        backgroundColor: [
          'rgba(220, 38, 38, 0.7)',  // Red for expenses
          'rgba(37, 99, 235, 0.7)',   // Blue for info
          'rgba(22, 163, 74, 0.7)',   // Green for income
          'rgba(249, 115, 22, 0.7)',  // Orange
          'rgba(139, 92, 246, 0.7)',  // Purple
          'rgba(20, 184, 166, 0.7)',  // Teal
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
        data: isConverting ? [] : (convertedCategoryTotals.amounts.length > 0 ? convertedCategoryTotals.amounts : categoryTotals.amounts),
        backgroundColor: 'rgba(37, 99, 235, 0.6)',
        borderColor: 'rgba(37, 99, 235, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  // Format currency based on selected currency
  const formatAmount = (amount: number) => {
    return formatCurrency(amount, currency);
  };

  // Use dashboardApi instead of direct API calls when available
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await dashboardApi.getDashboardData();
        if (data) {
          // Set mock data flag
          setIsMockData(!data.isRealData);
          
          // Process data as needed
          // This would replace the existing data fetching logic
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // We're already falling back to mock data in the existing code
      }
    };
    
    // Uncomment when backend is ready
    // fetchDashboardData();
  }, []);

  if (loading || currencyLoading) {
    return <div className="text-center py-10">Loading dashboard data...</div>;
  }
  
  if (isConverting) {
    return <div className="text-center py-10">Converting currency...</div>;
  }
  
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {isMockData && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-md">
          <p className="text-sm text-yellow-700">
            <strong>Note:</strong> Displaying mock data as the API is unavailable.
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card mb-6 border-l-4 border-l-blue-500 shadow-md">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Monthly Overview</h2>
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <p className="stat-label">Total Spending</p>
            <p className="stat-value text-red-600">
              {formatAmount(convertedMonthlySummary.total || monthlySummary.total)}
            </p>
          </div>
          
          {monthlySummary.categories.length > 0 ? (
            <div className="h-64">
              <Pie data={pieChartData} options={{ 
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      boxWidth: 12,
                      padding: 15
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const label = context.label || '';
                        const value = context.raw;
                        return `${label}: ${formatAmount(value as number)}`;
                      }
                    }
                  }
                }
              }} />
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No data available for this month</p>
            </div>
          )}
        </div>
        
        <div className="card border-l-4 border-l-purple-500 shadow-md">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Top Categories</h2>
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
                        text: `Amount (${CURRENCY_SYMBOLS[currency]})`
                      }
                    }
                  },
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const label = context.dataset.label || '';
                          const value = context.raw;
                          return `${label}: ${formatAmount(value as number)}`;
                        }
                      }
                    }
                  }
                }} 
              />
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No category data available</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="card mb-6 border-l-4 border-l-red-500 shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Recent Expenses
          </h2>
          <Link href="/expenses" className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors">
            View All
          </Link>
        </div>
        
        {recentExpenses.length > 0 ? (
          <div className="table-container">
            <table className="table-default">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Date</th>
                  <th className="table-header-cell">Category</th>
                  <th className="table-header-cell">Note</th>
                  <th className="table-header-cell text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {(convertedRecentExpenses.length > 0 ? convertedRecentExpenses : recentExpenses).map((expense) => (
                  <tr key={expense.id} className="table-row">
                    <td className="table-cell">
                      {formatDate(expense.date)}
                    </td>
                    <td className="table-cell font-medium">
                      {expense.category}
                    </td>
                    <td className="table-cell max-w-xs truncate">
                      {expense.note || '-'}
                    </td>
                    <td className="table-cell text-right font-medium">
                      {expense.convertedAmount 
                        ? formatAmount(expense.convertedAmount)
                        : formatAmount(parseFloat(expense.amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No recent expenses</p>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/expenses/add" className="card border-t-4 border-t-blue-500 shadow-md hover:shadow-lg">
          <div>
            <h3 className="font-bold text-blue-700 mb-2">Add Expense</h3>
            <p className="text-sm text-gray-600">Record a new transaction</p>
          </div>
        </Link>

        <Link href="/reports" className="card border-t-4 border-t-purple-500 shadow-md hover:shadow-lg">
          <div>
            <h3 className="font-bold text-purple-700 mb-2">View Reports</h3>
            <p className="text-sm text-gray-600">Analyze your spending</p>
          </div>
        </Link>

        <Link href="/expenses" className="card border-t-4 border-t-green-500 shadow-md hover:shadow-lg">
          <div>
            <h3 className="font-bold text-green-700 mb-2">Manage Expenses</h3>
            <p className="text-sm text-gray-600">View and edit transactions</p>
          </div>
        </Link>
      </div>
    </div>
  );
}