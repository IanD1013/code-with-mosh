# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install       # install dependencies
npm run dev       # start dev server at http://localhost:5173
npm run build     # production build
npm run lint      # run ESLint
npm run preview   # preview production build locally
```

## Architecture

React app with no routing, no external state library, and no backend — all state lives in `useState` hooks and resets on page refresh.

**Component tree:**
- `App` — holds `transactions` state and passes it down; renders the three child components.
  - `Summary` — receives `transactions`, computes `totalIncome`, `totalExpenses`, and `balance` internally.
  - `TransactionForm` — owns its own form state; calls `onAdd(transaction)` prop on submit.
  - `TransactionList` — receives `transactions`, owns filter state (`filterType`, `filterCategory`) internally.

**Data model:** each transaction has `{ id, description, amount, type, category, date }`. `type` is either `"income"` or `"expense"`. `amount` is a number.

**Categories** are a hardcoded array defined in both `TransactionForm` and `TransactionList`: `["food", "housing", "utilities", "transport", "entertainment", "salary", "other"]`.

Styles are in `src/App.css`. CSS class names `income-amount`, `expense-amount`, and `balance-amount` control the color of monetary values throughout the UI.
