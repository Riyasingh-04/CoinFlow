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

export interface DailyLimitStatus {
  todayLimit: number;
  spentToday: number;
  remainingToday: number;
  status: 'on-track' | 'over-today' | 'under-budget';
}

export function getAdjustedDailyLimit(
  monthlyBudget: number,
  transactions: Transaction[]
): DailyLimitStatus {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthTransactions = getCurrentMonthTransactions(transactions).filter(
    (t) => t.type === 'expense'
  );

  const spentSoFar = monthTransactions
    .filter((t) => {
      const day = new Date(t.date).getDate();
      return day < dayOfMonth;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const spentToday = monthTransactions
    .filter((t) => {
      const day = new Date(t.date).getDate();
      return day === dayOfMonth;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const remainingDays = daysInMonth - dayOfMonth + 1;
  const remainingBudget = monthlyBudget - spentSoFar;
  const todayLimit = remainingDays > 0 ? remainingBudget / remainingDays : 0;
  const remainingToday = todayLimit - spentToday;

  let status: 'on-track' | 'over-today' | 'under-budget' = 'on-track';
  if (remainingToday < 0) status = 'over-today';
  else if (spentToday < todayLimit * 0.5) status = 'under-budget';

  return {
    todayLimit,
    spentToday,
    remainingToday,
    status,
  };
}