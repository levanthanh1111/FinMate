import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Environment variables (would normally be in .env file)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const expenseApi = {
  // Get all expenses
  getAllExpenses: async () => {
    const response = await api.get('/expenses');
    return response.data;
  },

  // Get expense by ID
  getExpenseById: async (id: number) => {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },

  // Create new expense
  createExpense: async (expense: any) => {
    const response = await api.post('/expenses', expense);
    return response.data;
  },

  // Update expense
  updateExpense: async (id: number, expense: any) => {
    const response = await api.put(`/expenses/${id}`, expense);
    return response.data;
  },

  // Delete expense
  deleteExpense: async (id: number) => {
    await api.delete(`/expenses/${id}`);
  },

  // Get expenses by category
  getExpensesByCategory: async (category: string) => {
    const response = await api.get(`/expenses/category/${category}`);
    return response.data;
  },

  // Get expenses by date range
  getExpensesByDateRange: async (startDate: string, endDate: string) => {
    const response = await api.get(`/expenses/date-range?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },

  // Get monthly expenses
  getMonthlyExpenses: async (year: number, month: number) => {
    const response = await api.get(`/expenses/monthly/${year}/${month}`);
    return response.data;
  },

  // Get monthly summary by category
  getMonthlySummary: async (year: number, month: number) => {
    const response = await api.get(`/expenses/summary/monthly/${year}/${month}`);
    return response.data;
  },

  // Get spending trends
  getSpendingTrends: async () => {
    const response = await api.get('/expenses/summary/trends');
    return response.data;
  }
};

// Dashboard API
export const dashboardApi = {
  // Get dashboard data
  getDashboardData: async () => {
    try {
      const response = await api.get('/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }
};

// Exchange Rate API
export const exchangeRateApi = {
  // Get exchange rate
  getExchangeRate: async (base = 'USD', target = 'VND') => {
    try {
      const response = await api.get(`/exchange-rate?base=${base}&target=${target}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      throw error;
    }
  }
};

export default api;