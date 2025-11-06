import axios from 'axios';
import { exchangeRateApi } from './api';

// Currency conversion API URL (fallback if backend API fails)
const FALLBACK_API_URL = 'https://api.exchangerate.host/latest';

// Define currency types
export type CurrencyCode = 'VND' | 'USD' | 'EUR' | 'JPY';

// Currency symbols mapping
export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  VND: '₫',
  USD: '$',
  EUR: '€',
  JPY: '¥'
};

// Default exchange rates in case API fails
const DEFAULT_RATES: Record<CurrencyCode, number> = {
  VND: 30261.5714, // Approximate VND to USD rate
  USD: 1.149756,
  EUR: 1, // Approximate EUR to USD rate
  JPY: 175.907461,   // Approximate JPY to USD rate
};

// Cache exchange rates to reduce API calls
let cachedRates: Record<CurrencyCode, number> | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

/**
 * Fetch current exchange rates from API
 */
async function fetchExchangeRates(): Promise<Record<CurrencyCode, number>> {
  try {
    // First try our backend API
    const result = await exchangeRateApi.getExchangeRate('USD', Object.keys(CURRENCY_SYMBOLS).join(','));
    
    if (result && result.rate) {
      // Format the response to match expected structure
      const rates: Record<CurrencyCode, number> = {};
      
      // If we got a single rate (USD to VND for example)
      if (typeof result.rate === 'number') {
        rates[result.target as CurrencyCode] = result.rate;
        // Add USD rate (1.0)
        rates['USD'] = 1.0;
      }
      
      return rates;
    }
    
    // If backend API fails, try external API as fallback
    const response = await axios.get(FALLBACK_API_URL, {
      params: {
        base: 'USD',
        symbols: Object.keys(CURRENCY_SYMBOLS).join(',')
      }
    });
    
    if (response.data && response.data.rates) {
      return response.data.rates as Record<CurrencyCode, number>;
    }
    
    console.warn('Exchange rate API returned unexpected format, using default rates');
    return DEFAULT_RATES;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return DEFAULT_RATES;
  }
}

/**
 * Get current exchange rates (from cache if available)
 */
export async function getExchangeRates(): Promise<Record<CurrencyCode, number>> {
  const now = Date.now();
  
  // Use cached rates if they're still valid
  if (cachedRates && (now - lastFetchTime < CACHE_DURATION)) {
    return cachedRates;
  }
  
  // Fetch fresh rates
  const rates = await fetchExchangeRates();
  cachedRates = rates;
  lastFetchTime = now;
  
  return rates;
}

/**
 * Convert amount between currencies
 * @param amount - The amount to convert
 * @param fromCurrency - Source currency code
 * @param toCurrency - Target currency code
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode
): Promise<number> {
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  const rates = await getExchangeRates();
  
  // Convert to USD first (as base currency)
  const amountInUSD = fromCurrency === 'USD' 
    ? amount 
    : amount / rates[fromCurrency];
  
  // Then convert from USD to target currency
  const convertedAmount = toCurrency === 'USD'
    ? amountInUSD
    : amountInUSD * rates[toCurrency];
  
  return convertedAmount;
}

/**
 * Format amount with currency symbol
 * @param amount - The amount to format
 * @param currencyCode - The currency code
 */
export function formatCurrency(amount: number, currencyCode: CurrencyCode): string {
  const symbol = CURRENCY_SYMBOLS[currencyCode];
  
  // Format based on currency
  switch (currencyCode) {
    case 'VND':
      // VND doesn't use decimal places
      return `${symbol}${Math.round(amount).toLocaleString()}`;
    case 'JPY':
      // JPY typically doesn't use decimal places
      return `${symbol}${Math.round(amount).toLocaleString()}`;
    default:
      // Other currencies use 2 decimal places
      return `${symbol}${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }
}