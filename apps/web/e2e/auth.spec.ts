import { test, expect } from "@playwright/test";

test.describe("authentication", () => {
  test("redirects to login for protected page, then logs in and out", async ({ page }) => {
    await page.goto("/articles/me");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { name: "Login to ArchForgeWeb" })).toBeVisible();

    await page.getByLabel("Username").fill("admin");
    await page.getByLabel("Password").fill("admin123");
    await page.getByRole("button", { name: "Login" }).click();

    await expect(page).toHaveURL("/");
    await expect(page.getByRole("button", { name: "Logout" }).first()).toBeVisible();

    await page.getByRole("button", { name: "Logout" }).first().click();
    await expect(page).toHaveURL("/login");
  });
});
