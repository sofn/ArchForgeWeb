import { test, expect } from "@playwright/test";

test.describe("articles", () => {
  test("lists articles and opens an article detail", async ({ page }) => {
    await page.goto("/en/articles");
    await expect(page.getByRole("heading", { name: "All Articles" })).toBeVisible();
    await expect(page.getByPlaceholder("Search articles")).toBeVisible();

    const firstCard = page.locator('a[href*="/articles/"]').first();
    await expect(firstCard).toBeVisible();
    const title = await firstCard.locator("h3").textContent();

    await firstCard.click();
    await expect(page).toHaveURL(/\/en\/articles\/.+/);
    if (title) {
      await expect(page.getByRole("heading", { name: title.trim() }).first()).toBeVisible();
    }
  });
});
