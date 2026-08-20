import { test, expect } from "@playwright/test";

test.describe("home page", () => {
  test("displays greeting and navigates to articles", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("h1")).toContainText(/Good (morning|afternoon|evening)/);
    await page.getByRole("link", { name: "Articles", exact: true }).click();
    await expect(page).toHaveURL("/en/articles");
    await expect(page.getByRole("heading", { name: "All Articles" })).toBeVisible();
  });
});
