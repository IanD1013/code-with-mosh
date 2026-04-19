import { test, expect } from "@playwright/test";
import path from "path";

// ---------------------------------------------------------------------------
// Users page — admin (uses saved session to skip login UI)
// ---------------------------------------------------------------------------

test.describe("Users page — admin", () => {
  test.use({
    storageState: path.resolve(__dirname, ".auth/admin.json"),
  });

  test("admin can navigate to /users and sees the users table", async ({
    page,
  }) => {
    await page.goto("/users");
    await expect(page).toHaveURL("/users");

    // Page heading
    await expect(
      page.getByRole("heading", { name: "Users" })
    ).toBeVisible();

    // Column headers
    const columnHeaders = ["Name", "Email", "Role", "Created"];
    for (const header of columnHeaders) {
      await expect(
        page.getByRole("columnheader", { name: header })
      ).toBeVisible();
    }
  });

  test("users table contains seeded admin user row", async ({ page }) => {
    await page.goto("/users");

    // Wait for table data to load (loading spinner disappears)
    await expect(page.getByText("Loading...")).not.toBeVisible();

    // Admin row: name and email
    await expect(page.getByRole("cell", { name: "Admin" })).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "admin@example.com" })
    ).toBeVisible();

    // Admin role badge in the admin row
    const adminRow = page.getByRole("row", { name: /admin@example\.com/ });
    await expect(adminRow.getByText("admin")).toBeVisible();
  });

  test("users table contains seeded agent user row", async ({ page }) => {
    await page.goto("/users");

    await expect(page.getByText("Loading...")).not.toBeVisible();

    // Agent row: name and email
    await expect(page.getByRole("cell", { name: "Agent" })).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "agent@example.com" })
    ).toBeVisible();

    // Agent role badge in the agent row
    const agentRow = page.getByRole("row", { name: /agent@example\.com/ });
    await expect(agentRow.getByText("agent")).toBeVisible();
  });

  test("users table shows exactly two seeded users", async ({ page }) => {
    await page.goto("/users");

    await expect(page.getByText("Loading...")).not.toBeVisible();

    // tbody rows — one per user (excludes the thead row)
    const dataRows = page.getByRole("row").filter({ has: page.getByRole("cell") });
    await expect(dataRows).toHaveCount(2);
  });

  test("admin nav link is visible and links to /users", async ({ page }) => {
    await page.goto("/users");

    const usersNavLink = page.getByRole("link", { name: "Users" });
    await expect(usersNavLink).toBeVisible();
    await expect(usersNavLink).toHaveAttribute("href", "/users");
  });
});

// ---------------------------------------------------------------------------
// Users page — agent (role-based redirect)
// ---------------------------------------------------------------------------

test.describe("Users page — agent", () => {
  test.use({
    storageState: path.resolve(__dirname, ".auth/agent.json"),
  });

  test("agent visiting /users is redirected to /", async ({ page }) => {
    await page.goto("/users");
    await expect(page).toHaveURL("/");
  });

  test("Users nav link is not visible to an agent", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("link", { name: "Users" })
    ).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Users page — unauthenticated
// ---------------------------------------------------------------------------

test.describe("Users page — unauthenticated", () => {
  test("unauthenticated user visiting /users is redirected to /login", async ({
    page,
  }) => {
    await page.goto("/users");
    await expect(page).toHaveURL("/login");
  });
});
