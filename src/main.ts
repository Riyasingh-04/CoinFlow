import {
  getDaysInMonth,
  getFirstWeekdayOfMonth,
  formatDateKey,
  getSpendingByDate,
  getIntensityClass,
  getTransactionsForDate,
} from './calendar';
import './style.css';
import { renderSpendingChart } from './chart';
import { loadTransactions, saveTransactions, loadCategories } from './storage';
import { createTransaction, deleteTransaction, getTotalBalance } from './transactions';
import type { Transaction, Category } from './types';
import { getBudgetProgress, getAdjustedDailyLimit } from './budget';

let transactions: Transaction[] = loadTransactions();
const categories: Category[] = loadCategories();
const form = document.querySelector<HTMLFormElement>('#transaction-form')!;
const list = document.querySelector<HTMLUListElement>('#transaction-list')!;
const balanceEl = document.querySelector<HTMLParagraphElement>('#balance')!;
const categorySelect = document.querySelector<HTMLSelectElement>('#category')!;
const toastContainer = document.querySelector<HTMLDivElement>('#toast-container')!;
const navItems = document.querySelectorAll<HTMLButtonElement>('.nav-item');
const pages = document.querySelectorAll<HTMLElement>('.page');
const filterButtons = document.querySelectorAll<HTMLButtonElement>('.filter-btn');
const transactionsTableBody = document.querySelector<HTMLTableSectionElement>('#transactions-table-body')!;
let currentFilter: 'all' | 'income' | 'expense' = 'all';
const calendarGrid = document.querySelector<HTMLDivElement>('#calendar-grid')!;
const calendarMonthLabel = document.querySelector<HTMLSpanElement>('#calendar-month-label')!;
const calendarDetail = document.querySelector<HTMLDivElement>('#calendar-detail')!;
const prevMonthBtn = document.querySelector<HTMLButtonElement>('#prev-month')!;
const nextMonthBtn = document.querySelector<HTMLButtonElement>('#next-month')!;
const today = new Date();
let calendarYear = today.getFullYear();
let calendarMonth = today.getMonth();
let selectedDateKey: string | null = null;
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const dailyLimitAmount = document.querySelector<HTMLParagraphElement>('#daily-limit-amount')!;
const dailyLimitStatus = document.querySelector<HTMLParagraphElement>('#daily-limit-status')!;
const budgetsPageGrid = document.querySelector<HTMLDivElement>('#budgets-page-grid')!;


navItems.forEach((btn) => {
  btn.addEventListener('click', () => {
    const targetPage = btn.dataset.page;

    navItems.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    pages.forEach((page) => {
      page.classList.toggle('active', page.id === `page-${targetPage}`);
    });
  });
});


function showUndoToast(message: string, onUndo: () => void): void {
  const toast = document.createElement('div');
  toast.className = 'toast';

  const text = document.createElement('span');
  text.textContent = message;

  const undoBtn = document.createElement('button');
  undoBtn.textContent = 'Undo';

  let dismissed = false;

  const timeoutId = setTimeout(() => {
    if (!dismissed) {
      toast.remove();
    }
  }, 4000);

  undoBtn.addEventListener('click', () => {
    dismissed = true;
    clearTimeout(timeoutId);
    toast.remove();
    onUndo();
  });

  toast.appendChild(text);
  toast.appendChild(undoBtn);
  toastContainer.appendChild(toast);
}

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
const themeToggle = document.querySelector<HTMLButtonElement>('#theme-toggle')!;
const THEME_KEY = 'theme';

function applyTheme(theme: 'light' | 'dark'): void {
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    themeToggle.textContent = '☀️';
  } else {
    document.documentElement.removeAttribute('data-theme');
    themeToggle.textContent = '🌙';
  }
  localStorage.setItem(THEME_KEY, theme);
}

function initTheme(): void {
  const saved = localStorage.getItem(THEME_KEY);
  const theme = saved === 'light' ? 'light' : 'dark';
  applyTheme(theme);
}

themeToggle.addEventListener('click', () => {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  applyTheme(isLight ? 'dark' : 'light');
});


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

function renderTransactionsPage(): void {
  transactionsTableBody.innerHTML = '';

  const filtered = transactions.filter((t) => {
    if (currentFilter === 'all') return true;
    return t.type === currentFilter;
  });

  filtered.forEach((t) => {
    const row = document.createElement('tr');
    const category = getCategoryById(t.categoryId);
    const sign = t.type === 'income' ? '+' : '-';
    const amountClass = t.type === 'income' ? 'amount-income' : 'amount-expense';

    row.innerHTML = `
      <td>${t.description}</td>
      <td>${
        category
          ? `<span class="category-badge" style="background:${category.color}22; color:${category.color};">${category.name}</span>`
          : '—'
      }</td>
      <td>${t.date}</td>
      <td class="${amountClass}">${sign}$${t.amount.toFixed(2)}</td>
      <td></td>
    `;

    const deleteCell = row.querySelector('td:last-child')!;
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'table-delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => {
      const deletedTransaction = t;
      const deletedIndex = transactions.findIndex((tx) => tx.id === t.id);

      transactions = deleteTransaction(transactions, t.id);
      render();

      showUndoToast(`Deleted "${deletedTransaction.description}"`, () => {
        transactions.splice(deletedIndex, 0, deletedTransaction);
        saveTransactions(transactions);
        render();
      });

      setTimeout(() => {
        saveTransactions(transactions);
      }, 4100);
    });
    deleteCell.appendChild(deleteBtn);

    transactionsTableBody.appendChild(row);
  });
}

filterButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter as 'all' | 'income' | 'expense';
    renderTransactionsPage();
  });
});

function renderCalendar(): void {
  calendarGrid.innerHTML = '';
  calendarMonthLabel.textContent = `${MONTH_NAMES[calendarMonth]} ${calendarYear}`;

  const daysInMonth = getDaysInMonth(calendarYear, calendarMonth);
  const firstWeekday = getFirstWeekdayOfMonth(calendarYear, calendarMonth);
  const spendingMap = getSpendingByDate(transactions);
  const maxAmount = Math.max(...Array.from(spendingMap.values()), 0);

  for (let i = 0; i < firstWeekday; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'calendar-day empty';
    calendarGrid.appendChild(emptyCell);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = formatDateKey(calendarYear, calendarMonth, day);
    const amountSpent = spendingMap.get(dateKey) ?? 0;
    const intensityClass = getIntensityClass(amountSpent, maxAmount);

    const cell = document.createElement('div');
    cell.className = `calendar-day ${intensityClass}`;
    if (dateKey === selectedDateKey) cell.classList.add('selected');
    cell.textContent = String(day);

    cell.addEventListener('click', () => {
      selectedDateKey = dateKey;
      renderCalendar();
      renderCalendarDetail(dateKey);
    });

    calendarGrid.appendChild(cell);
  }
}

function renderCalendarDetail(dateKey: string): void {
  const dayTransactions = getTransactionsForDate(transactions, dateKey);
  const total = dayTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  calendarDetail.innerHTML = '';

  const title = document.createElement('p');
  title.className = 'calendar-detail-title';
  title.textContent = `${dateKey} — $${total.toFixed(2)} spent`;
  calendarDetail.appendChild(title);

  if (dayTransactions.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'placeholder-text';
    empty.textContent = 'No transactions on this day.';
    calendarDetail.appendChild(empty);
    return;
  }

  dayTransactions.forEach((t) => {
    const row = document.createElement('div');
    row.className = 'calendar-detail-row';
    const sign = t.type === 'income' ? '+' : '-';
    row.innerHTML = `<span>${t.description}</span><span>${sign}$${t.amount.toFixed(2)}</span>`;
    calendarDetail.appendChild(row);
  });
}

prevMonthBtn.addEventListener('click', () => {
  calendarMonth -= 1;
  if (calendarMonth < 0) {
    calendarMonth = 11;
    calendarYear -= 1;
  }
  renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
  calendarMonth += 1;
  if (calendarMonth > 11) {
    calendarMonth = 0;
    calendarYear += 1;
  }
  renderCalendar();
});

function renderBudgetsPage(): void {
  const budgetedCategories = categories.filter((c) => c.monthlyBudget !== null);
  const totalMonthlyBudget = budgetedCategories.reduce(
    (sum, c) => sum + (c.monthlyBudget ?? 0),
    0
  );

  if (totalMonthlyBudget > 0) {
    const limitStatus = getAdjustedDailyLimit(totalMonthlyBudget, transactions);

    dailyLimitAmount.textContent = `$${Math.max(limitStatus.remainingToday, 0).toFixed(2)}`;

    const statusMessages: Record<string, string> = {
      'on-track': 'You\'re on track for the month.',
      'over-today': 'You\'ve gone over today\'s limit — tomorrow\'s limit will be tighter.',
      'under-budget': 'You\'re under budget today — nice!',
    };

    dailyLimitStatus.textContent = statusMessages[limitStatus.status];
    dailyLimitStatus.className = `status-${limitStatus.status}`;
  } else {
    dailyLimitAmount.textContent = '—';
    dailyLimitStatus.textContent = 'Set a budget on at least one category to see this.';
    dailyLimitStatus.className = '';
  }

  budgetsPageGrid.innerHTML = '';

  budgetedCategories.forEach((cat) => {
    const progress = getBudgetProgress(cat, transactions);
    if (!progress) return;

    const card = document.createElement('div');
    card.className = 'budget-page-card';

    card.innerHTML = `
      <div class="budget-page-card-header">
        <span class="budget-page-dot" style="background:${cat.color};"></span>
        <span class="budget-page-name">${progress.categoryName}</span>
      </div>
      <p class="budget-page-amounts">$${progress.spentAmount.toFixed(2)} / $${progress.budgetAmount.toFixed(2)}</p>
      <div class="budget-bar-outer">
        <div class="budget-bar-inner budget-${progress.status}" style="width:${progress.percentUsed}%;"></div>
      </div>
    `;

    budgetsPageGrid.appendChild(card);
  });
}



function render(): void {
  renderBudgets();
  renderSpendingChart(chartCanvas, transactions, categories);
  renderTransactionsPage();
  renderCalendar();
  renderBudgetsPage();
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
  const deletedTransaction = t;
  const deletedIndex = transactions.findIndex((tx) => tx.id === t.id);

  transactions = deleteTransaction(transactions, t.id);
  render(); // update UI immediately, but don't save yet

  showUndoToast(`Deleted "${deletedTransaction.description}"`, () => {
    transactions.splice(deletedIndex, 0, deletedTransaction);
    saveTransactions(transactions);
    render();
  });

  // finalize the deletion in storage after the toast expires
  setTimeout(() => {
    saveTransactions(transactions);
  }, 4100);
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

initTheme();
populateCategoryDropdown();
render();