export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  categoryId: string | null;
  date: string; // ISO format: "2026-09-16"
}

export interface Category {
  id: string;
  name: string;
  color: string;
  monthlyBudget: number | null;
}