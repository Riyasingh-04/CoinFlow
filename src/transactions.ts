import type { Transaction } from './types';

export function createTransaction(
  description: string,
  amount: number,
  type: 'income' | 'expense',
  categoryId: string | null
): Transaction {
  return {
    id: crypto.randomUUID(),
    description,
    amount,
    type,
    categoryId,
    date: new Date().toISOString().split('T')[0],
  };
}

export function deleteTransaction(transactions: Transaction[], id: string): Transaction[] {
  return transactions.filter((t) => t.id !== id);
}

export function getTotalBalance(transactions: Transaction[]): number {
  return transactions.reduce((total, t) => {
    return t.type === 'income' ? total + t.amount : total - t.amount;
  }, 0);
}