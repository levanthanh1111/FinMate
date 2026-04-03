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

  // Get expenses by optional filters
  getFilteredExpenses: async (filters: { categoryId?: number; startDate?: string; endDate?: string }) => {
    const params = new URLSearchParams();

    if (filters.categoryId !== undefined) {
      params.append('categoryId', String(filters.categoryId));
    }

    if (filters.startDate && filters.endDate) {
      params.append('startDate', filters.startDate);
      params.append('endDate', filters.endDate);
    }

    const query = params.toString();
    const response = await api.get(query ? `/expenses/filter?${query}` : '/expenses/filter');
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

export const investmentPortfolioApi = {
  getAllPortfolios: async () => {
    const response = await api.get('/investment-portfolios');
    return response.data;
  },

  getPortfolioById: async (id: number) => {
    const response = await api.get(`/investment-portfolios/${id}`);
    return response.data;
  },

  createPortfolio: async (portfolio: any) => {
    const response = await api.post('/investment-portfolios', portfolio);
    return response.data;
  },

  updatePortfolio: async (id: number, portfolio: any) => {
    const response = await api.put(`/investment-portfolios/${id}`, portfolio);
    return response.data;
  },

  deletePortfolio: async (id: number) => {
    await api.delete(`/investment-portfolios/${id}`);
  }
};

export const investmentAssetApi = {
  getAllAssets: async () => {
    const response = await api.get('/investment-assets');
    return response.data;
  },

  getAssetById: async (id: number) => {
    const response = await api.get(`/investment-assets/${id}`);
    return response.data;
  },

  searchAssets: async (filters: { query?: string; assetType?: string; active?: boolean }) => {
    const params = new URLSearchParams();

    if (filters.query) {
      params.append('query', filters.query);
    }

    if (filters.assetType) {
      params.append('assetType', filters.assetType);
    }

    if (filters.active !== undefined) {
      params.append('active', String(filters.active));
    }

    const query = params.toString();
    const response = await api.get(query ? `/investment-assets/search?${query}` : '/investment-assets/search');
    return response.data;
  },

  createAsset: async (asset: any) => {
    const response = await api.post('/investment-assets', asset);
    return response.data;
  },

  updateAsset: async (id: number, asset: any) => {
    const response = await api.put(`/investment-assets/${id}`, asset);
    return response.data;
  },

  deleteAsset: async (id: number) => {
    await api.delete(`/investment-assets/${id}`);
  }
};

export const investmentTransactionApi = {
  getAllTransactions: async () => {
    const response = await api.get('/investment-transactions');
    return response.data;
  },

  getTransactionById: async (id: number) => {
    const response = await api.get(`/investment-transactions/${id}`);
    return response.data;
  },

  getFilteredTransactions: async (filters: { portfolioId?: number; assetId?: number; type?: string; startDate?: string; endDate?: string }) => {
    const params = new URLSearchParams();

    if (filters.portfolioId !== undefined) {
      params.append('portfolioId', String(filters.portfolioId));
    }

    if (filters.assetId !== undefined) {
      params.append('assetId', String(filters.assetId));
    }

    if (filters.type) {
      params.append('type', filters.type);
    }

    if (filters.startDate) {
      params.append('startDate', filters.startDate);
    }

    if (filters.endDate) {
      params.append('endDate', filters.endDate);
    }

    const query = params.toString();
    const response = await api.get(query ? `/investment-transactions/filter?${query}` : '/investment-transactions/filter');
    return response.data;
  },

  createTransaction: async (transaction: any) => {
    const response = await api.post('/investment-transactions', transaction);
    return response.data;
  },

  updateTransaction: async (id: number, transaction: any) => {
    const response = await api.put(`/investment-transactions/${id}`, transaction);
    return response.data;
  },

  deleteTransaction: async (id: number) => {
    await api.delete(`/investment-transactions/${id}`);
  }
};

export const investmentHoldingApi = {
  getHoldings: async (portfolioId?: number) => {
    const response = await api.get(portfolioId ? `/investment-holdings?portfolioId=${portfolioId}` : '/investment-holdings');
    return response.data;
  },

  getHoldingsSummary: async (portfolioId?: number) => {
    const response = await api.get(portfolioId ? `/investment-holdings/summary?portfolioId=${portfolioId}` : '/investment-holdings/summary');
    return response.data;
  }
};

export const investmentPriceApi = {
  getAllLatestPrices: async () => {
    const response = await api.get('/investment-prices/latest');
    return response.data;
  },

  getLatestPriceByAssetId: async (assetId: number) => {
    const response = await api.get(`/investment-prices/latest/asset?assetId=${assetId}`);
    return response.data;
  },

  createLatestPrice: async (payload: any) => {
    const response = await api.post('/investment-prices/latest', payload);
    return response.data;
  },

  updateLatestPrice: async (id: number, payload: any) => {
    const response = await api.put(`/investment-prices/latest/${id}`, payload);
    return response.data;
  },

  deleteLatestPrice: async (id: number) => {
    await api.delete(`/investment-prices/latest/${id}`);
  }
};

export const investmentReportApi = {
  getTransactionReportRows: async (filters: { portfolioId?: number; assetId?: number; type?: string; startDate?: string; endDate?: string }) => {
    const params = new URLSearchParams();

    if (filters.portfolioId !== undefined) params.append('portfolioId', String(filters.portfolioId));
    if (filters.assetId !== undefined) params.append('assetId', String(filters.assetId));
    if (filters.type) params.append('type', filters.type);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const query = params.toString();
    const response = await api.get(query ? `/investment-reports/transactions?${query}` : '/investment-reports/transactions');
    return response.data;
  },

  getTransactionReportSummary: async (filters: { portfolioId?: number; assetId?: number; type?: string; startDate?: string; endDate?: string }) => {
    const params = new URLSearchParams();

    if (filters.portfolioId !== undefined) params.append('portfolioId', String(filters.portfolioId));
    if (filters.assetId !== undefined) params.append('assetId', String(filters.assetId));
    if (filters.type) params.append('type', filters.type);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const query = params.toString();
    const response = await api.get(query ? `/investment-reports/transactions/summary?${query}` : '/investment-reports/transactions/summary');
    return response.data;
  },

  getMonthlyProfitLoss: async (filters: { portfolioId?: number; assetId?: number; startDate?: string; endDate?: string }) => {
    const params = new URLSearchParams();

    if (filters.portfolioId !== undefined) params.append('portfolioId', String(filters.portfolioId));
    if (filters.assetId !== undefined) params.append('assetId', String(filters.assetId));
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const query = params.toString();
    const response = await api.get(query ? `/investment-reports/monthly-profit-loss?${query}` : '/investment-reports/monthly-profit-loss');
    return response.data;
  },

  getOverview: async (filters: { portfolioId?: number; startDate?: string; endDate?: string }) => {
    const params = new URLSearchParams();

    if (filters.portfolioId !== undefined) params.append('portfolioId', String(filters.portfolioId));
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const query = params.toString();
    const response = await api.get(query ? `/investment-reports/overview?${query}` : '/investment-reports/overview');
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
