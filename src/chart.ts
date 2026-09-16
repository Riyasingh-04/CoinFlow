import { Chart, ArcElement, Tooltip, Legend, PieController } from 'chart.js';
import type { Transaction, Category } from './types';

Chart.register(ArcElement, Tooltip, Legend, PieController);

let chartInstance: Chart | null = null;

export function renderSpendingChart(
  canvas: HTMLCanvasElement,
  transactions: Transaction[],
  categories: Category[]
): void {
  const expenseTransactions = transactions.filter((t) => t.type === 'expense');

  const dataByCategory = categories
    .map((cat) => {
      const total = expenseTransactions
        .filter((t) => t.categoryId === cat.id)
        .reduce((sum, t) => sum + t.amount, 0);
      return { name: cat.name, color: cat.color, total };
    })
    .filter((c) => c.total > 0);

  // Destroy the previous chart instance before redrawing, or Chart.js will throw an error
  if (chartInstance) {
    chartInstance.destroy();
  }

  if (dataByCategory.length === 0) {
    return; // nothing to chart yet
  }

  chartInstance = new Chart(canvas, {
    type: 'pie',
    data: {
      labels: dataByCategory.map((c) => c.name),
      datasets: [
        {
          data: dataByCategory.map((c) => c.total),
          backgroundColor: dataByCategory.map((c) => c.color),
        },
      ],
    },
    options: {
      responsive: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#e5e5e5',
          },
        },
      },
    },
  });
}