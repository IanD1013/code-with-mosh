import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "server/.env.test") });

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  projects: [
    // Run the auth setup before any tests that need saved sessions
    {
      name: "auth setup",
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["auth setup"],
    },
  ],
  webServer: [
    {
      command: "npx tsx --watch src/index.ts",
      cwd: path.resolve(__dirname, "server"),
      port: 3000,
      reuseExistingServer: !process.env.CI,
      env: {
        DATABASE_URL: process.env.DATABASE_URL!,
        BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET!,
        BETTER_AUTH_URL: process.env.BETTER_AUTH_URL!,
        ADMIN_EMAIL: process.env.ADMIN_EMAIL!,
        ADMIN_PASSWORD: process.env.ADMIN_PASSWORD!,
        CLIENT_URL: process.env.CLIENT_URL!,
      },
    },
    {
      command: "npm run dev",
      cwd: path.resolve(__dirname, "client"),
      port: 5173,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
