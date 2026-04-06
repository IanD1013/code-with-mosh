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

This is a single-file React app (`src/App.jsx`) with no routing, no external state library, and no backend — all state lives in `useState` hooks and resets on page refresh.

**Data model:** each transaction has `{ id, description, amount, type, category, date }`. `type` is either `"income"` or `"expense"`. `amount` is stored as a string (not a number), which causes arithmetic bugs in the summary totals.

**Key behaviors:**
- Summary cards (Income / Expenses / Balance) are derived by filtering and reducing `transactions` state.
- The transaction list supports client-side filtering by `type` and `category`.
- New transactions are appended via form submit in `handleSubmit`.

**Categories** are a hardcoded array: `["food", "housing", "utilities", "transport", "entertainment", "salary", "other"]`.

Styles are in `src/App.css`. CSS class names `income-amount`, `expense-amount`, and `balance-amount` control the color of monetary values throughout the UI.
