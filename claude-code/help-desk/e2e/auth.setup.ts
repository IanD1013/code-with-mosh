import { test as setup } from "@playwright/test";
import path from "path";

const adminFile = path.resolve(__dirname, ".auth/admin.json");
const agentFile = path.resolve(__dirname, ".auth/agent.json");

setup("authenticate as admin", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@example.com");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("/");
  await page.context().storageState({ path: adminFile });
});

setup("authenticate as agent", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("agent@example.com");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("/");
  await page.context().storageState({ path: agentFile });
});
