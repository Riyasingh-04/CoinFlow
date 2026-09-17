<div align="center">
  <img src="public/favicon.svg" alt="Coinflow Logo" width="72" height="72" />
  <h1>Coinflow</h1>
  <p><strong>Modern, aesthetic personal finance tracker with an electric Neon Obsidian design.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white" alt="Chart.js" />
    <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="License" />
  </p>
</div>

---

## ⚡ Overview

**Coinflow** is a client-side expense tracking web application engineered for individuals who appreciate both financial clarity and visual polish. Built with Vite and TypeScript, it replaces cluttered spreadsheets with a high-contrast, frosted-glass dashboard that turns daily bookkeeping into a frictionless visual habit.

---

## ✨ Features

* **Real-Time Cashflow Dynamics:** Instant recalculation of total net balance, monthly inflow (income), and outflow (expenses).
* **Reactive Donut Visualizer:** Interactive spending breakdown powered by Chart.js with responsive category slicing.
* **Smart Budget Thresholds:** Dynamic progress bars that shift visual state as category spending approaches predefined caps.
* **Persistent Local Vault:** Fast local data persistence to retain transactions, categories, and custom limits across browser sessions.
* **Neon Obsidian Interface:** High-end glassmorphism design featuring deep dark mode, backdrop blurs, and an electric violet-to-cyan gradient palette.

---

## 🛠️ Tech Stack

* **Build Tool:** [Vite](https://vitejs.dev/)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Data Visualization:** [Chart.js](https://www.chartjs.org/)
* **Styling:** Modern CSS (Custom Properties, Glassmorphism, CSS Grid)
* **Assets:** Custom Vector SVG Monogram

---

## 📁 Project Architecture

```text
CoinFlow/
├── public/
│   └── favicon.svg         # Monogram brand mark & favicon
├── src/
│   ├── assets/             # Bundled static assets
│   ├── budget.ts           # Budget limit calculations & progress tracking
│   ├── chart.ts            # Chart.js initialization & reactive render logic
│   ├── storage.ts          # LocalStorage abstractions and data adapters
│   ├── transactions.ts     # CRUD actions for income/expense flow
│   ├── types.ts            # Core TypeScript interfaces and schemas
│   ├── main.ts             # Application entry point & DOM event wiring
│   └── style.css           # Neon obsidian theme & glassmorphism utilities
├── index.html              # Shell layout & semantic markup
├── package.json            # Scripts & project dependencies
├── tsconfig.json           # TypeScript compilation config
└── vite.config.ts          # Vite bundler configuration
