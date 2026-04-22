---
name: UI selector patterns for this helpdesk app
description: Reliable Playwright selectors for shadcn/ui dialogs, table rows, and action buttons as used in this codebase
type: reference
---

## Dialogs (Radix / shadcn Dialog)

- Open/close: `page.getByRole("dialog")` — Radix renders with role="dialog"
- Heading: `dialog.getByRole("heading", { name: "..." })`
- Close (X) button: `dialog.getByRole("button", { name: "Close" })` — Radix adds aria-label="Close"
- Form fields inside dialog: scope to `dialog.getByLabel("...")` to avoid ambiguity when multiple dialogs could be mounted

## UsersTable

- Column headers use `<th>` with plain text — select with `page.getByRole("columnheader", { name: "..." })`
- Entire row: `page.getByRole("row", { name: /email@domain/ })`
- Individual cells: `page.getByRole("cell", { name: "...", exact: true })`
- Role badge is a `<span>` inside a cell — use `row.getByText("agent", { exact: true })` scoped to the row

## Action buttons in UsersTable

- Edit button: `aria-label="Edit {user.name}"` — use `page.getByRole("button", { name: "Edit Agent" })`
- Delete button: `aria-label="Delete {user.name}"` — use `page.getByRole("button", { name: "Delete Agent" })`
- Admin rows: Delete button is `disabled` when `user.role === "admin"`

## Waiting for table data

Use `await expect(page.getByRole("cell", { name: "admin@example.com" })).toBeVisible()` as the table-ready signal — this waits for the TanStack Query fetch to complete without relying on absence-of-spinner checks.

## Test isolation strategy for mutating tests

Tests that create/edit/delete users should use unique emails/names not shared with the two seeded users (admin@example.com / agent@example.com). When editing seeded users risks polluting other tests in the same run, create a throwaway user first within that test.
