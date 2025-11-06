'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CurrencyCode, CURRENCY_SYMBOLS, getExchangeRates } from './currencyService';

type CurrencyContextType = {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  exchangeRates: Record<CurrencyCode, number> | null;
  isLoading: boolean;
};

// Create context with default values
const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'VND', // Default to VND as requested
  setCurrency: () => {},
  exchangeRates: null,
  isLoading: true,
});

// Custom hook to use the currency context
export const useCurrency = () => useContext(CurrencyContext);

// Provider component
export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyCode>('VND');
  const [exchangeRates, setExchangeRates] = useState<Record<CurrencyCode, number> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch exchange rates on component mount
  useEffect(() => {
    const fetchRates = async () => {
      try {
        setIsLoading(true);
        const rates = await getExchangeRates();
        setExchangeRates(rates);
      } catch (error) {
        console.error('Failed to fetch exchange rates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRates();
  }, []);

  // Load saved currency preference from localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem('preferredCurrency');
    if (savedCurrency && Object.keys(CURRENCY_SYMBOLS).includes(savedCurrency)) {
      setCurrency(savedCurrency as CurrencyCode);
    }
  }, []);

  // Save currency preference when it changes
  useEffect(() => {
    localStorage.setItem('preferredCurrency', currency);
  }, [currency]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, exchangeRates, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  );
}