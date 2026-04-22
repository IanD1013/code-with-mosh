import { test, expect, type Page } from "@playwright/test";
import path from "path";

// All user-management tests run as admin (the only role with access to /users).
// Tests that mutate state (create / edit / delete) use unique emails so they can
// be re-run without conflicts from leftover data in the dev database.

test.use({
  storageState: path.resolve(__dirname, ".auth/admin.json"),
});

// Unique suffix per test worker so parallel tests never collide on the same email.
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// ---------------------------------------------------------------------------
// Helper: wait for the users table to finish loading
// ---------------------------------------------------------------------------

async function waitForTableReady(page: Page) {
  await expect(
    page.getByRole("cell", { name: "admin@example.com" })
  ).toBeVisible();
}

// ---------------------------------------------------------------------------
// READ — list users
// ---------------------------------------------------------------------------

test.describe("User management — list (read)", () => {
  test("admin sees the Users page heading and table columns", async ({ page }) => {
    await page.goto("/users");

    await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();

    for (const header of ["Name", "Email", "Role", "Created"]) {
      await expect(page.getByRole("columnheader", { name: header })).toBeVisible();
    }
  });

  test("seeded admin user is shown in the table with the admin role badge", async ({
    page,
  }) => {
    await page.goto("/users");
    await waitForTableReady(page);

    const adminRow = page.getByRole("row", { name: /admin@example\.com/ });
    await expect(adminRow.getByRole("cell", { name: "Admin", exact: true })).toBeVisible();
    await expect(adminRow.getByText("admin", { exact: true })).toBeVisible();
  });

  test("seeded agent user is shown in the table with the agent role badge", async ({
    page,
  }) => {
    await page.goto("/users");
    await waitForTableReady(page);

    const agentRow = page.getByRole("row", { name: /agent@example\.com/ });
    await expect(agentRow.getByRole("cell", { name: "Agent", exact: true })).toBeVisible();
    await expect(agentRow.getByText("agent", { exact: true })).toBeVisible();
  });

  test("New User button is visible on the Users page", async ({ page }) => {
    await page.goto("/users");
    await expect(page.getByRole("button", { name: "New User" })).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// CREATE — happy path
// ---------------------------------------------------------------------------

test.describe("User management — create", () => {
  test("admin can open the New User dialog", async ({ page }) => {
    await page.goto("/users");

    await page.getByRole("button", { name: "New User" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: "New User" })).toBeVisible();

    await expect(dialog.getByLabel("Name")).toBeVisible();
    await expect(dialog.getByLabel("Email")).toBeVisible();
    await expect(dialog.getByLabel("Password")).toBeVisible();

    await expect(dialog.getByRole("button", { name: "Create User" })).toBeVisible();
  });

  test("admin can create a new agent user and it appears in the table", async ({
    page,
  }) => {
    const id = uid();
    const email = `create-${id}@example.com`;
    const name = `Create ${id}`;

    await page.goto("/users");
    await waitForTableReady(page);

    await page.getByRole("button", { name: "New User" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await dialog.getByLabel("Name").fill(name);
    await dialog.getByLabel("Email").fill(email);
    await dialog.getByLabel("Password").fill("securepass1");

    await dialog.getByRole("button", { name: "Create User" }).click();
    await expect(dialog).not.toBeVisible();

    await expect(page.getByRole("cell", { name: email })).toBeVisible();
    await expect(page.getByRole("cell", { name: name, exact: true })).toBeVisible();

    const newRow = page.getByRole("row", { name: new RegExp(email.replace(".", "\\.")) });
    await expect(newRow.getByText("agent", { exact: true })).toBeVisible();
  });

  test("creating a user closes the dialog and resets the form", async ({
    page,
  }) => {
    const id = uid();

    await page.goto("/users");
    await waitForTableReady(page);

    await page.getByRole("button", { name: "New User" }).click();
    const dialog = page.getByRole("dialog");

    await dialog.getByLabel("Name").fill(`FormReset ${id}`);
    await dialog.getByLabel("Email").fill(`formreset-${id}@example.com`);
    await dialog.getByLabel("Password").fill("password999");
    await dialog.getByRole("button", { name: "Create User" }).click();

    await expect(dialog).not.toBeVisible();

    // Reopen — form should be blank
    await page.getByRole("button", { name: "New User" }).click();
    await expect(dialog.getByLabel("Name")).toHaveValue("");
    await expect(dialog.getByLabel("Email")).toHaveValue("");
  });
});

// ---------------------------------------------------------------------------
// EDIT — happy path
// ---------------------------------------------------------------------------

test.describe("User management — edit", () => {
  test("each user row has an Edit button", async ({ page }) => {
    await page.goto("/users");
    await waitForTableReady(page);

    await expect(page.getByRole("button", { name: "Edit Admin" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Edit Agent" })).toBeVisible();
  });

  test("clicking Edit opens the dialog pre-populated with the user's data", async ({
    page,
  }) => {
    await page.goto("/users");
    await waitForTableReady(page);

    await page.getByRole("button", { name: "Edit Agent" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: "Edit User" })).toBeVisible();

    await expect(dialog.getByLabel("Name")).toHaveValue("Agent");
    await expect(dialog.getByLabel("Email")).toHaveValue("agent@example.com");
    await expect(dialog.getByLabel("Password")).toHaveValue("");

    await expect(dialog.getByRole("button", { name: "Save Changes" })).toBeVisible();
  });

  test("admin can rename a user and the new name appears in the table", async ({
    page,
  }) => {
    const id = uid();
    const email = `rename-${id}@example.com`;
    const originalName = `Rename ${id}`;
    const updatedName = `Renamed ${id}`;

    await page.goto("/users");
    await waitForTableReady(page);

    // Create a throwaway user so we don't mutate the seeded agent
    await page.getByRole("button", { name: "New User" }).click();
    let dialog = page.getByRole("dialog");
    await dialog.getByLabel("Name").fill(originalName);
    await dialog.getByLabel("Email").fill(email);
    await dialog.getByLabel("Password").fill("password123");
    await dialog.getByRole("button", { name: "Create User" }).click();
    await expect(dialog).not.toBeVisible();

    await page.getByRole("button", { name: `Edit ${originalName}` }).click();
    dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    const nameInput = dialog.getByLabel("Name");
    await nameInput.clear();
    await nameInput.fill(updatedName);

    await dialog.getByRole("button", { name: "Save Changes" }).click();
    await expect(dialog).not.toBeVisible();

    await expect(
      page.getByRole("cell", { name: updatedName, exact: true })
    ).toBeVisible();
  });

  test("admin can change a user's email and the new email appears in the table", async ({
    page,
  }) => {
    const id = uid();
    const originalEmail = `edit-email-${id}@example.com`;
    const updatedEmail = `edited-email-${id}@example.com`;
    const name = `EditEmail ${id}`;

    await page.goto("/users");
    await waitForTableReady(page);

    // Create a throwaway user
    await page.getByRole("button", { name: "New User" }).click();
    let dialog = page.getByRole("dialog");
    await dialog.getByLabel("Name").fill(name);
    await dialog.getByLabel("Email").fill(originalEmail);
    await dialog.getByLabel("Password").fill("password123");
    await dialog.getByRole("button", { name: "Create User" }).click();
    await expect(dialog).not.toBeVisible();

    await page.getByRole("button", { name: `Edit ${name}` }).click();
    dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    const emailInput = dialog.getByLabel("Email");
    await emailInput.clear();
    await emailInput.fill(updatedEmail);

    await dialog.getByRole("button", { name: "Save Changes" }).click();
    await expect(dialog).not.toBeVisible();

    await expect(page.getByRole("cell", { name: updatedEmail })).toBeVisible();
    await expect(page.getByRole("cell", { name: originalEmail })).not.toBeVisible();
  });

  test("Edit dialog can be dismissed with Cancel (X button) without saving", async ({
    page,
  }) => {
    await page.goto("/users");
    await waitForTableReady(page);

    await page.getByRole("button", { name: "Edit Agent" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    const nameInput = dialog.getByLabel("Name");
    await nameInput.clear();
    await nameInput.fill("Should Not Be Saved");

    await dialog.getByRole("button", { name: "Close" }).click();
    await expect(dialog).not.toBeVisible();

    // Original name is still in the table
    await expect(
      page.getByRole("cell", { name: "Agent", exact: true })
    ).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// DELETE — happy path
// ---------------------------------------------------------------------------

test.describe("User management — delete", () => {
  test("admin user's Delete button is disabled (admins cannot be deleted)", async ({
    page,
  }) => {
    await page.goto("/users");
    await waitForTableReady(page);

    const deleteAdminButton = page.getByRole("button", { name: "Delete Admin" });
    await expect(deleteAdminButton).toBeDisabled();
  });

  test("agent user's Delete button is enabled", async ({ page }) => {
    await page.goto("/users");
    await waitForTableReady(page);

    await expect(page.getByRole("button", { name: "Delete Agent" })).toBeEnabled();
  });

  test("clicking Delete opens a confirmation dialog naming the user", async ({
    page,
  }) => {
    await page.goto("/users");
    await waitForTableReady(page);

    await page.getByRole("button", { name: "Delete Agent" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: "Delete User" })).toBeVisible();

    await expect(dialog.getByText("Agent")).toBeVisible();
    await expect(dialog.getByText(/cannot be undone/i)).toBeVisible();

    await expect(dialog.getByRole("button", { name: "Delete" })).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Cancel" })).toBeVisible();
  });

  test("admin can delete a non-admin user and the row is removed from the table", async ({
    page,
  }) => {
    const id = uid();
    const email = `delete-${id}@example.com`;
    const name = `Delete ${id}`;

    await page.goto("/users");
    await waitForTableReady(page);

    // Create a fresh user to delete so we preserve the seeded agent for other tests
    await page.getByRole("button", { name: "New User" }).click();
    let dialog = page.getByRole("dialog");
    await dialog.getByLabel("Name").fill(name);
    await dialog.getByLabel("Email").fill(email);
    await dialog.getByLabel("Password").fill("password123");
    await dialog.getByRole("button", { name: "Create User" }).click();
    await expect(dialog).not.toBeVisible();

    await expect(page.getByRole("cell", { name: email })).toBeVisible();

    await page.getByRole("button", { name: `Delete ${name}` }).click();
    dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await dialog.getByRole("button", { name: "Delete" }).click();
    await expect(dialog).not.toBeVisible();

    await expect(page.getByRole("cell", { name: email })).not.toBeVisible();
  });

  test("Cancel button in the Delete dialog closes it without deleting the user", async ({
    page,
  }) => {
    await page.goto("/users");
    await waitForTableReady(page);

    await page.getByRole("button", { name: "Delete Agent" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(dialog).not.toBeVisible();

    await expect(
      page.getByRole("cell", { name: "agent@example.com" })
    ).toBeVisible();
  });
});
