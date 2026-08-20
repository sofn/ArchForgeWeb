import { test, expect } from "@playwright/test";

const username = process.env.E2E_USERNAME ?? "";
const password = process.env.E2E_PASSWORD ?? "";

test.skip(!username || !password, "E2E_USERNAME and E2E_PASSWORD must be set");

test.describe("authentication", () => {
  test("redirects to login for protected page, then logs in and out", async ({ page }) => {
    await page.goto("/en/articles/me");
    await expect(page).toHaveURL(/\/en\/login/);
    await expect(page.getByRole("heading", { name: "Login to ArchForgeWeb" })).toBeVisible();

    await page.getByLabel("Username").fill(username);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Login" }).click();

    await expect(page).toHaveURL(/\/en\/?$/);
    await expect(page.getByRole("button", { name: "Logout" }).first()).toBeVisible();

    await page.getByRole("button", { name: "Logout" }).first().click();
    await expect(page).toHaveURL(/\/en\/login/);
  });
});
