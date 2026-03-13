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

export const categoryApi = {
  getAllCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  getCategoryById: async (id: number) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  createCategory: async (category: { name: string; description?: string }) => {
    const response = await api.post('/categories', category);
    return response.data;
  },

  updateCategory: async (id: number, category: { name: string; description?: string }) => {
    const response = await api.put(`/categories/${id}`, category);
    return response.data;
  },

  deleteCategory: async (id: number) => {
    await api.delete(`/categories/${id}`);
  }
};

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
  getExpensesByCategory: async (categoryId: number) => {
    const response = await api.get(`/expenses/category/${categoryId}`);
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
  getExchangeRate: async (base = 'USD', target = 'VND') => {
    try {
      const response = await api.get(`/exchange-rate?base=${base}&target=${target}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      throw error;
    }
  },
  // Get latest rates (from local DB, or fetch if empty)
  getLatestRates: async (fetchFromApi = false) => {
    const response = await api.get(`/exchange-rate/latest?fetch=${fetchFromApi}`);
    return response.data;
  },
  // Force fetch from external API and save to local
  fetchAndSaveRates: async () => {
    const response = await api.post('/exchange-rate/fetch');
    return response.data;
  },
  // Get rates from local DB only
  getRatesFromLocal: async (base?: string, date?: string) => {
    const params = new URLSearchParams();
    if (base) params.append('base', base);
    if (date) params.append('date', date);
    const response = await api.get(`/exchange-rate/local?${params}`);
    return response.data;
  }
};

export default api;