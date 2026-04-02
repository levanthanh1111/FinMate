'use client';

import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { CurrencyCode, RateSource, getExchangeRates, getLastRateSource, getLastRateUpdatedAt } from './currencyService';

const CURRENCY_STORAGE_KEY = 'finmate_currency';
const DEFAULT_CURRENCY: CurrencyCode = 'VND';
const DEFAULT_RATE_REFRESH_MS = 60000;
const RATE_REFRESH_MS = Number(process.env.NEXT_PUBLIC_RATE_REFRESH_MS || DEFAULT_RATE_REFRESH_MS);

type CurrencyContextType = {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  exchangeRates: Record<CurrencyCode, number> | null;
  isLoading: boolean;
  rateSource: RateSource;
  rateUpdatedAt: number | null;
};

// Create context with default values
const CurrencyContext = createContext<CurrencyContextType>({
  currency: DEFAULT_CURRENCY,
  setCurrency: () => {},
  exchangeRates: null,
  isLoading: true,
  rateSource: 'default',
  rateUpdatedAt: null,
});

// Custom hook to use the currency context
export const useCurrency = () => useContext(CurrencyContext);

// Provider component
export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [exchangeRates, setExchangeRates] = useState<Record<CurrencyCode, number> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rateSource, setRateSource] = useState<RateSource>('default');
  const [rateUpdatedAt, setRateUpdatedAt] = useState<number | null>(null);

  useEffect(() => {
    const savedCurrency = typeof window !== 'undefined'
      ? window.localStorage.getItem(CURRENCY_STORAGE_KEY)
      : null;

    if (savedCurrency && ['VND', 'USD', 'EUR', 'JPY', 'KRW', 'HKD', 'CNY'].includes(savedCurrency)) {
      setCurrency(savedCurrency as CurrencyCode);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
    }
  }, [currency]);

  useEffect(() => {
    let cancelled = false;

    const fetchRates = async (forceRefresh = false) => {
      try {
        if (!cancelled) {
          setIsLoading(true);
        }
        const rates = await getExchangeRates({ forceRefresh });
        if (!cancelled) {
          setExchangeRates(rates);
          setRateSource(getLastRateSource());
          setRateUpdatedAt(getLastRateUpdatedAt());
        }
      } catch (error) {
        console.error('Failed to fetch exchange rates:', error);
        if (!cancelled) {
          setRateSource('default');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchRates();

    const interval = window.setInterval(() => {
      fetchRates(true);
    }, RATE_REFRESH_MS);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const value = useMemo(() => ({
    currency,
    setCurrency,
    exchangeRates,
    isLoading,
    rateSource,
    rateUpdatedAt
  }), [currency, exchangeRates, isLoading, rateSource, rateUpdatedAt]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}
