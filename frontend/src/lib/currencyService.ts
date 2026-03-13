import { exchangeRateApi } from './api';

// Define currency types (match backend local rates: USD, VND, JPY, KRW, HKD, CNY + EUR as base)
export type CurrencyCode = 'VND' | 'USD' | 'EUR' | 'JPY' | 'KRW' | 'HKD' | 'CNY';

// Currency symbols mapping
export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  VND: '₫',
  USD: '$',
  EUR: '€',
  JPY: '¥',
  KRW: '₩',
  HKD: 'HK$',
  CNY: '¥'
};

// Default exchange rates (EUR base) - fallback if API fails
const DEFAULT_RATES: Record<CurrencyCode, number> = {
  EUR: 1,
  USD: 1.15,
  VND: 30258,
  JPY: 183.37,
  KRW: 1714.4,
  HKD: 9.01,
  CNY: 7.91
};

// Cache
let cachedRates: Record<CurrencyCode, number> | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 3600000; // 1 hour

/**
 * Fetch rates from local backend API (EUR-based).
 * Response: { base: "EUR", rates: { USD, VND, JPY, ... } }
 */
async function fetchExchangeRates(): Promise<Record<CurrencyCode, number>> {
  try {
    const result = await exchangeRateApi.getRatesFromLocal();
    if (result?.success && result?.rates) {
      const rates: Record<string, number> = { EUR: 1, ...result.rates };
      return rates as Record<CurrencyCode, number>;
    }
    // Fallback: try getLatestRates (fetches from API if local empty)
    const latest = await exchangeRateApi.getLatestRates(false);
    if (latest?.success && latest?.rates) {
      const rates: Record<string, number> = { EUR: 1, ...latest.rates };
      return rates as Record<CurrencyCode, number>;
    }
    return DEFAULT_RATES;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return DEFAULT_RATES;
  }
}

/**
 * Get exchange rates (from local DB via backend). Cached for 1 hour.
 */
export async function getExchangeRates(): Promise<Record<CurrencyCode, number>> {
  const now = Date.now();
  if (cachedRates && now - lastFetchTime < CACHE_DURATION) {
    return cachedRates;
  }
  const rates = await fetchExchangeRates();
  cachedRates = rates;
  lastFetchTime = now;
  return rates;
}

/**
 * Convert amount between currencies using EUR-based rates.
 * Rate structure: 1 EUR = rate[X] units of currency X.
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode
): Promise<number> {
  if (fromCurrency === toCurrency) return amount;

  const rates = await getExchangeRates();
  const fromRate = rates[fromCurrency] ?? 1;
  const toRate = rates[toCurrency] ?? 1;
  if (fromRate === 0) return amount;

  return amount * (toRate / fromRate);
}

/**
 * Format amount with currency symbol.
 */
export function formatCurrency(amount: number, currencyCode: CurrencyCode): string {
  const symbol = CURRENCY_SYMBOLS[currencyCode] ?? currencyCode;
  switch (currencyCode) {
    case 'VND':
    case 'JPY':
    case 'KRW':
      return `${symbol}${Math.round(amount).toLocaleString()}`;
    default:
      return `${symbol}${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }
}
