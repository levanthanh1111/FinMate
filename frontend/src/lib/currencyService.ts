import { exchangeRateApi } from './api';

// Define currency types (match backend local rates: USD, VND, JPY, KRW, HKD, CNY + EUR as base)
export type CurrencyCode = 'VND' | 'USD' | 'EUR' | 'JPY' | 'KRW' | 'HKD' | 'CNY';
export type RateSource = 'local' | 'latest' | 'default';

type RatesOptions = {
  forceRefresh?: boolean;
};

// Currency symbols mapping
export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  VND: '₫',
  USD: '$',
  EUR: '€',
  JPY: '¥',
  KRW: '₩',
  HKD: 'HK$',
  CNY: 'CN¥'
};

export const CURRENCY_LABELS: Record<CurrencyCode, string> = {
  VND: 'Vietnamese Dong',
  USD: 'US Dollar',
  EUR: 'Euro',
  JPY: 'Japanese Yen',
  KRW: 'South Korean Won',
  HKD: 'Hong Kong Dollar',
  CNY: 'Chinese Yuan'
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
let lastRateSource: RateSource = 'default';
let lastRateUpdatedAt: number | null = null;
const conversionMemo = new Map<string, number>();

/**
 * Fetch rates from local backend API (EUR-based).
 * Response: { base: "EUR", rates: { USD, VND, JPY, ... } }
 */
async function fetchExchangeRates(): Promise<Record<CurrencyCode, number>> {
  try {
    const result = await exchangeRateApi.getRatesFromLocal();
    if (result?.success && result?.rates) {
      const rates: Record<string, number> = { EUR: 1, ...result.rates };
      lastRateSource = 'local';
      lastRateUpdatedAt = Date.now();
      return rates as Record<CurrencyCode, number>;
    }
    // Fallback: try getLatestRates (fetches from API if local empty)
    const latest = await exchangeRateApi.getLatestRates(false);
    if (latest?.success && latest?.rates) {
      const rates: Record<string, number> = { EUR: 1, ...latest.rates };
      lastRateSource = 'latest';
      lastRateUpdatedAt = Date.now();
      return rates as Record<CurrencyCode, number>;
    }
    lastRateSource = 'default';
    lastRateUpdatedAt = Date.now();
    return DEFAULT_RATES;
  } catch (error) {
    console.error('Error fetching exchap0: { forceRefresh: boolean; }nge rates:', error);
    lastRateSource = 'default';
    lastRateUpdatedAt = Date.now();
    return DEFAULT_RATES;
  }
}

/**
 * Get exchange rates (from local DB via backend). Cached for 1 hour.
 */
export async function getExchangeRates(options: RatesOptions = {}): Promise<Record<CurrencyCode, number>> {
  const now = Date.now();
  if (!options.forceRefresh && cachedRates && now - lastFetchTime < CACHE_DURATION) {
    return cachedRates;
  }
  const rates = await fetchExchangeRates();
  conversionMemo.clear();
  cachedRates = rates;
  lastFetchTime = now;
  return rates;
}

export function getLastRateSource(): RateSource {
  return lastRateSource;
}

export function getLastRateUpdatedAt(): number | null {
  return lastRateUpdatedAt;
}

export function getCurrencyLocale(currencyCode: CurrencyCode): string {
  return currencyCode === 'VND' ? 'vi-VN' : 'en-US';
}

export function getInputLocale(currencyCode: CurrencyCode): string {
  if (currencyCode === 'VND') return 'en-US';
  return getCurrencyLocale(currencyCode);
}

export function hasMinorUnits(currencyCode: CurrencyCode): boolean {
  return !['VND', 'JPY', 'KRW'].includes(currencyCode);
}

export function getCurrencyDisplay(currencyCode: CurrencyCode): string {
  return `${CURRENCY_SYMBOLS[currencyCode]} ${currencyCode}`;
}

export function formatNumberInput(amount: number, currencyCode: CurrencyCode): string {
  return amount.toLocaleString(getInputLocale(currencyCode), {
    minimumFractionDigits: 0,
    maximumFractionDigits: hasMinorUnits(currencyCode) ? 2 : 0
  });
}

export function parseMoneyInput(value: string, currencyCode?: CurrencyCode): number {
  const normalized = value.replace(/[^\d,.-]/g, '').trim();
  if (!normalized) return NaN;

  if (currencyCode && !hasMinorUnits(currencyCode)) {
    const isNegative = normalized.startsWith('-');
    const digitsOnly = normalized.replace(/[^\d]/g, '');
    if (!digitsOnly) return NaN;
    const parsed = Number(digitsOnly);
    return isNegative ? -parsed : parsed;
  }

  const lastComma = normalized.lastIndexOf(',');
  const lastDot = normalized.lastIndexOf('.');
  const decimalIdx = Math.max(lastComma, lastDot);

  if (decimalIdx === -1) {
    const intOnly = normalized.replace(/[,.]/g, '');
    return Number(intOnly);
  }

  const intPart = normalized.slice(0, decimalIdx).replace(/[,.]/g, '');
  const decimalPart = normalized.slice(decimalIdx + 1).replace(/[,.]/g, '');
  return Number(`${intPart}.${decimalPart}`);
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

export async function convertVndAmounts(amounts: number[], toCurrency: CurrencyCode): Promise<number[]> {
  const missingIndices: number[] = [];
  const results = amounts.map((amount, index) => {
    const key = `${toCurrency}:${amount}`;
    const cached = conversionMemo.get(key);
    if (cached !== undefined) {
      return cached;
    }
    missingIndices.push(index);
    return 0;
  });

  if (missingIndices.length > 0) {
    const converted = await Promise.all(
      missingIndices.map((idx) => convertCurrency(amounts[idx], 'VND', toCurrency))
    );

    missingIndices.forEach((idx, convertedIdx) => {
      const value = converted[convertedIdx];
      const key = `${toCurrency}:${amounts[idx]}`;
      conversionMemo.set(key, value);
      results[idx] = value;
    });
  }

  return results;
}

/**
 * Format amount with currency symbol.
 */
export function formatCurrency(amount: number, currencyCode: CurrencyCode): string {
  const locale = getCurrencyLocale(currencyCode);
  const minimumFractionDigits = hasMinorUnits(currencyCode) ? 2 : 0;
  const maximumFractionDigits = hasMinorUnits(currencyCode) ? 2 : 0;

  return `${CURRENCY_SYMBOLS[currencyCode]}${amount.toLocaleString(locale, {
    minimumFractionDigits,
    maximumFractionDigits
  })}`;
}

export function formatCompactCurrency(amount: number, currencyCode: CurrencyCode): string {
  const locale = getCurrencyLocale(currencyCode);
  const absAmount = Math.abs(amount);

  if (absAmount < 1000) {
    return formatCurrency(amount, currencyCode);
  }

  return `${CURRENCY_SYMBOLS[currencyCode]}${new Intl.NumberFormat(locale, {
    notation: 'compact',
    minimumFractionDigits: 0,
    maximumFractionDigits: absAmount < 1000000 ? 1 : 2,
  }).format(amount)}`;
}
