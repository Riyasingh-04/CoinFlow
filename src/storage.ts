import type { Transaction, Category } from './types';

const TRANSACTIONS_KEY = 'transactions';
const CATEGORIES_KEY = 'categories';

export function loadTransactions(): Transaction[] {
  const raw = localStorage.getItem(TRANSACTIONS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Transaction[];
  } catch {
    console.error('Failed to parse transactions from storage');
    return [];
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
}

export function loadCategories(): Category[] {
  const raw = localStorage.getItem(CATEGORIES_KEY);
  if (!raw) return getDefaultCategories();
  try {
    return JSON.parse(raw) as Category[];
  } catch {
    console.error('Failed to parse categories from storage');
    return getDefaultCategories();
  }
}

export function saveCategories(categories: Category[]): void {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

function getDefaultCategories(): Category[] {
  return [
    { id: 'food', name: 'Food', color: '#f97316', monthlyBudget: 8000 },
    { id: 'rent', name: 'Rent', color: '#3b82f6', monthlyBudget: 15000 },
    { id: 'entertainment', name: 'Entertainment', color: '#a855f7', monthlyBudget: 3000 },
    { id: 'transport', name: 'Transport', color: '#22c55e', monthlyBudget: 2000 },
    { id: 'other', name: 'Other', color: '#6b7280', monthlyBudget: null },
  ];
}