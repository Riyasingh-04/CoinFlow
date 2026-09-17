import type { Transaction } from './types';

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstWeekdayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay(); // 0 = Sunday
}

export function formatDateKey(year: number, month: number, day: number): string {
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

export function getSpendingByDate(transactions: Transaction[]): Map<string, number> {
  const map = new Map<string, number>();

  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const current = map.get(t.date) ?? 0;
      map.set(t.date, current + t.amount);
    });

  return map;
}

export function getIntensityClass(amount: number, maxAmount: number): string {
  if (amount === 0) return '';
  const ratio = maxAmount > 0 ? amount / maxAmount : 0;

  if (ratio > 0.66) return 'intensity-high';
  if (ratio > 0.33) return 'intensity-mid';
  return 'intensity-low';
}

export function getTransactionsForDate(transactions: Transaction[], dateKey: string): Transaction[] {
  return transactions.filter((t) => t.date === dateKey);
}