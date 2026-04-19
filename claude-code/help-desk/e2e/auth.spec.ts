import { test, expect, type Page } from "@playwright/test";
import path from "path";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

// ---------------------------------------------------------------------------
// Login — happy paths
// ---------------------------------------------------------------------------

test.describe("Login — happy paths", () => {
  test("admin can log in and lands on home page", async ({ page }) => {
    await login(page, "admin@example.com", "password123");
    await page.waitForURL("/");
    await expect(page.getByText("Welcome to Helpdesk")).toBeVisible();
    // Admin sees their name and the Users nav link
    await expect(page.getByText("Admin")).toBeVisible();
    await expect(page.getByRole("link", { name: "Users" })).toBeVisible();
  });

  test("agent can log in and lands on home page", async ({ page }) => {
    await login(page, "agent@example.com", "password123");
    await page.waitForURL("/");
    await expect(page.getByText("Welcome to Helpdesk")).toBeVisible();
    // Agent sees their name but not the Users nav link
    await expect(page.getByText("Agent")).toBeVisible();
    await expect(page.getByRole("link", { name: "Users" })).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Login — failures
// ---------------------------------------------------------------------------

test.describe("Login — failures", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("wrong password shows server error", async ({ page }) => {
    await page.getByLabel("Email").fill("admin@example.com");
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText(/invalid/i)).toBeVisible();
    await expect(page).toHaveURL("/login");
  });

  test("wrong email shows server error", async ({ page }) => {
    await page.getByLabel("Email").fill("nobody@example.com");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText(/invalid/i)).toBeVisible();
    await expect(page).toHaveURL("/login");
  });

  test("empty email shows client-side validation error", async ({ page }) => {
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText(/valid email/i)).toBeVisible();
    await expect(page).toHaveURL("/login");
  });

  test("empty password shows client-side validation error", async ({ page }) => {
    await page.getByLabel("Email").fill("admin@example.com");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText(/password is required/i)).toBeVisible();
    await expect(page).toHaveURL("/login");
  });

  test("entirely empty form shows both validation errors", async ({ page }) => {
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText(/valid email/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
    await expect(page).toHaveURL("/login");
  });
});

// ---------------------------------------------------------------------------
// Sign-up disabled
// ---------------------------------------------------------------------------

test.describe("Sign-up disabled", () => {
  test("login page has no sign-up link or registration form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("link", { name: /sign up|register|create account/i })).not.toBeVisible();
    await expect(page.getByText(/sign up|register|create account/i)).not.toBeVisible();
  });

  test("navigating to /register redirects away from login page", async ({ page }) => {
    await page.goto("/register");
    // The wildcard route catches unknown paths and redirects to /
    // which in turn redirects to /login since the user is unauthenticated
    await expect(page).toHaveURL("/login");
  });
});

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------

test.describe("Logout", () => {
  test("admin can sign out and is redirected to login", async ({ page }) => {
    await login(page, "admin@example.com", "password123");
    await page.waitForURL("/");
    await page.getByRole("button", { name: "Sign out" }).click();
    await page.waitForURL("/login");
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("agent can sign out and is redirected to login", async ({ page }) => {
    await login(page, "agent@example.com", "password123");
    await page.waitForURL("/");
    await page.getByRole("button", { name: "Sign out" }).click();
    await page.waitForURL("/login");
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Route protection — unauthenticated
// ---------------------------------------------------------------------------

test.describe("Route protection — unauthenticated", () => {
  test("visiting / redirects to /login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/login");
  });

  test("visiting /users redirects to /login", async ({ page }) => {
    await page.goto("/users");
    await expect(page).toHaveURL("/login");
  });

  test("unknown route redirects to /login via /", async ({ page }) => {
    await page.goto("/does-not-exist");
    await expect(page).toHaveURL("/login");
  });
});

// ---------------------------------------------------------------------------
// Route protection — role-based (use saved sessions to skip login UI)
// ---------------------------------------------------------------------------

test.describe("Route protection — admin", () => {
  test.use({
    storageState: path.resolve(__dirname, ".auth/admin.json"),
  });

  test("admin can access /users", async ({ page }) => {
    await page.goto("/users");
    await expect(page).toHaveURL("/users");
    // Should not be redirected away
    await expect(page.getByRole("link", { name: "Users" })).toBeVisible();
  });

  test("admin can access / (home)", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");
    await expect(page.getByText("Welcome to Helpdesk")).toBeVisible();
  });
});

test.describe("Route protection — agent", () => {
  test.use({
    storageState: path.resolve(__dirname, ".auth/agent.json"),
  });

  test("agent visiting /users is redirected to /", async ({ page }) => {
    await page.goto("/users");
    await expect(page).toHaveURL("/");
  });

  test("agent can access / (home)", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");
    await expect(page.getByText("Welcome to Helpdesk")).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Guest route — authenticated users are bounced away from /login
// ---------------------------------------------------------------------------

test.describe("Guest route — admin", () => {
  test.use({
    storageState: path.resolve(__dirname, ".auth/admin.json"),
  });

  test("authenticated admin visiting /login is redirected to /", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL("/");
  });
});

test.describe("Guest route — agent", () => {
  test.use({
    storageState: path.resolve(__dirname, ".auth/agent.json"),
  });

  test("authenticated agent visiting /login is redirected to /", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL("/");
  });
});

// ---------------------------------------------------------------------------
// Session persistence
// ---------------------------------------------------------------------------

test.describe("Session persistence", () => {
  test("session survives a full page reload", async ({ page }) => {
    await login(page, "admin@example.com", "password123");
    await page.waitForURL("/");
    await page.reload();
    // Still on home page — not sent back to login
    await expect(page).toHaveURL("/");
    await expect(page.getByText("Welcome to Helpdesk")).toBeVisible();
    await expect(page.getByText("Admin")).toBeVisible();
  });

  test("after logout, session is gone and protected routes redirect", async ({ page }) => {
    await login(page, "admin@example.com", "password123");
    await page.waitForURL("/");
    await page.getByRole("button", { name: "Sign out" }).click();
    await page.waitForURL("/login");
    // Try to navigate back to / — should be bounced to /login again
    await page.goto("/");
    await expect(page).toHaveURL("/login");
  });
});
