import { apiClient } from "../network/api-client.js";
import { createCacheManager } from "../storage/cache-manager.js";
import { resolveWithFallback } from "./provider-chain.js";
import { apiConfig } from "../config/api-config.example.js";

/** 환율 서비스. 기본 Remote Provider는 API Key가 필요 없는 Frankfurter(ECB 환율, HTTPS, CORS 허용)다. */
const cache = createCacheManager("exchange-cache");
const MOCK_TABLE = { USD: 1, KRW: 1350, JPY: 155, EUR: 0.92, GBP: 0.79, CNY: 7.2 };

async function fetchRates(base, symbols) {
  const { data } = await apiClient.get(`${apiConfig.exchange.baseUrl}/latest`, { query: { from: base, to: symbols.join(",") } });
  return { base: data.base, date: data.date, rates: data.rates };
}

function mockRates(base, symbols) {
  const baseRate = MOCK_TABLE[base] ?? 1;
  const rates = {};
  for (const symbol of symbols) rates[symbol] = Math.round(((MOCK_TABLE[symbol] ?? 1) / baseRate) * 10_000) / 10_000;
  return { base, date: "mock", rates };
}

export async function getExchangeRates(base, symbols) {
  const cacheKey = `${base}:${[...symbols].sort().join(",")}`;
  return resolveWithFallback("exchange", [
    {
      name: "frankfurter",
      run: async () => {
        const result = await fetchRates(base, symbols);
        cache.set(cacheKey, result, { ttl: 60 * 60_000 });
        return result;
      },
    },
    { name: "cache", run: async () => cache.get(cacheKey) },
    { name: "mock", run: async () => mockRates(base, symbols) },
  ]);
}

export function convertAmount(amount, rate) {
  return Math.round(amount * rate * 100) / 100;
}

export async function convertCurrency(amount, from, to) {
  const envelope = await getExchangeRates(from, [to]);
  const rate = envelope.data.rates[to];
  return { ...envelope, amount, from, to, rate, converted: convertAmount(amount, rate) };
}

export async function convertMultiple(amount, from, toList) {
  const envelope = await getExchangeRates(from, toList);
  const conversions = toList.map((currency) => ({
    currency,
    rate: envelope.data.rates[currency],
    converted: convertAmount(amount, envelope.data.rates[currency]),
  }));
  return { ...envelope, amount, from, conversions };
}

/** 여행 예산 항목들을 기준 통화로 환산해 amountBase 필드를 채운다 */
export async function convertExpensesToBase(expenses, baseCurrency) {
  const currencies = [...new Set(expenses.map((expense) => expense.currency).filter((currency) => currency !== baseCurrency))];
  if (currencies.length === 0) return expenses.map((expense) => ({ ...expense, amountBase: expense.amount }));
  const envelope = await getExchangeRates(baseCurrency, currencies);
  return expenses.map((expense) => {
    if (expense.currency === baseCurrency) return { ...expense, amountBase: expense.amount };
    const rateBaseToCurrency = envelope.data.rates[expense.currency];
    const amountBase = rateBaseToCurrency ? convertAmount(expense.amount, 1 / rateBaseToCurrency) : expense.amount;
    return { ...expense, amountBase };
  });
}

export function computeRateChange(current, previous) {
  if (!previous) return null;
  const diff = current - previous;
  return { diff, percent: (diff / previous) * 100, direction: diff > 0 ? "up" : diff < 0 ? "down" : "flat" };
}
