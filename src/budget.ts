import type { Transaction, Category } from './types';

export interface BudgetProgress {
  categoryId: string;
  categoryName: string;
  color: string;
  budgetAmount: number;
  spentAmount: number;
  remaining: number;
  percentUsed: number;
  status: 'safe' | 'warning' | 'exceeded';
}

export function getCurrentMonthTransactions(transactions: Transaction[]): Transaction[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  return transactions.filter((t) => {
    const tDate = new Date(t.date);
    return tDate.getFullYear() === currentYear && tDate.getMonth() === currentMonth;
  });
}

export function getSpentByCategory(transactions: Transaction[], categoryId: string): number {
  return transactions
    .filter((t) => t.categoryId === categoryId && t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getBudgetProgress(
  category: Category,
  allTransactions: Transaction[]
): BudgetProgress | null {
  if (category.monthlyBudget === null) return null;

  const monthTransactions = getCurrentMonthTransactions(allTransactions);
  const spentAmount = getSpentByCategory(monthTransactions, category.id);
  const budgetAmount = category.monthlyBudget;
  const remaining = budgetAmount - spentAmount;
  const percentUsed = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;

  let status: 'safe' | 'warning' | 'exceeded' = 'safe';
  if (percentUsed >= 100) status = 'exceeded';
  else if (percentUsed >= 75) status = 'warning';

  return {
    categoryId: category.id,
    categoryName: category.name,
    color: category.color,
    budgetAmount,
    spentAmount,
    remaining,
    percentUsed: Math.min(percentUsed, 100), // cap at 100 for the bar width
    status,
  };
}