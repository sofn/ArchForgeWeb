import { test, expect } from "@playwright/test";

test.describe("locale switcher", () => {
  test("switches between English and Chinese", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("link", { name: "Articles", exact: true })).toBeVisible();

    await page.locator("header button:has-text('中文')").click();
    await expect(page).toHaveURL(/\/zh/);
    await expect(page.locator("html")).toHaveAttribute("lang", "zh");
    await expect(page.getByRole("link", { name: "文章", exact: true })).toBeVisible();

    await page.locator("header button:has-text('English')").click();
    await expect(page).toHaveURL(/\/en/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("link", { name: "Articles", exact: true })).toBeVisible();
  });
});
