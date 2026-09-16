import './style.css';
import { renderSpendingChart } from './chart';
import { loadTransactions, saveTransactions, loadCategories } from './storage';
import { createTransaction, deleteTransaction, getTotalBalance } from './transactions';
import { getBudgetProgress } from './budget';
import type { Transaction, Category } from './types';

let transactions: Transaction[] = loadTransactions();
const categories: Category[] = loadCategories();

const form = document.querySelector<HTMLFormElement>('#transaction-form')!;
const list = document.querySelector<HTMLUListElement>('#transaction-list')!;
const balanceEl = document.querySelector<HTMLParagraphElement>('#balance')!;
const categorySelect = document.querySelector<HTMLSelectElement>('#category')!;

function populateCategoryDropdown(): void {
  categorySelect.innerHTML = '';
  categories.forEach((cat) => {
    const option = document.createElement('option');
    option.value = cat.id;
    option.textContent = cat.name;
    categorySelect.appendChild(option);
  });
}

function getCategoryById(id: string | null): Category | undefined {
  return categories.find((c) => c.id === id);
}


const budgetList = document.querySelector<HTMLDivElement>('#budget-list')!;
const chartCanvas = document.querySelector<HTMLCanvasElement>('#spending-chart')!;
function renderBudgets(): void {
  budgetList.innerHTML = '';

  categories.forEach((cat) => {
    const progress = getBudgetProgress(cat, transactions);
    if (!progress) return; // skip categories with no budget set

    const item = document.createElement('div');
    item.className = 'budget-item';

    const label = document.createElement('p');
    label.textContent = `${progress.categoryName}: $${progress.spentAmount.toFixed(2)} / $${progress.budgetAmount.toFixed(2)}`;

    const barOuter = document.createElement('div');
    barOuter.className = 'budget-bar-outer';

    const barInner = document.createElement('div');
    barInner.className = `budget-bar-inner budget-${progress.status}`;
    barInner.style.width = `${progress.percentUsed}%`;

    barOuter.appendChild(barInner);
    item.appendChild(label);
    item.appendChild(barOuter);
    budgetList.appendChild(item);
  });
}


function render(): void {
  renderBudgets();
  renderSpendingChart(chartCanvas, transactions, categories);
  list.innerHTML = '';

  transactions.forEach((t) => {
    const li = document.createElement('li');

    const sign = t.type === 'income' ? '+' : '-';
    const category = getCategoryById(t.categoryId);

    const textSpan = document.createElement('span');
    textSpan.textContent = `${t.description}: ${sign}$${t.amount.toFixed(2)}`;
    if (category) {
      textSpan.textContent += ` [${category.name}]`;
      textSpan.style.borderLeft = `4px solid ${category.color}`;
      textSpan.style.paddingLeft = '8px';
    }

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => {
      transactions = deleteTransaction(transactions, t.id);
      saveTransactions(transactions);
      render();
    });

    li.appendChild(textSpan);
    li.appendChild(deleteBtn);
    list.appendChild(li);
  });

  balanceEl.textContent = `Balance: $${getTotalBalance(transactions).toFixed(2)}`;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const descriptionInput = document.querySelector<HTMLInputElement>('#description')!;
  const amountInput = document.querySelector<HTMLInputElement>('#amount')!;
  const typeInput = document.querySelector<HTMLSelectElement>('#type')!;

  const newTransaction = createTransaction(
    descriptionInput.value,
    parseFloat(amountInput.value),
    typeInput.value as 'income' | 'expense',
    categorySelect.value
  );

  transactions.push(newTransaction);
  saveTransactions(transactions);
  render();

  form.reset();
});

populateCategoryDropdown();
render();