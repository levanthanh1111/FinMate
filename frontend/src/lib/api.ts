import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export default api;