import { test, expect } from "@playwright/test"

test("homepage renders", async ({ page }) => {
  await page.goto("/")
  await expect(page.locator("h1").first()).toBeVisible()
})

test("navigates to articles page", async ({ page }) => {
  await page.goto("/")
  await page.getByRole("link", { name: "写作" }).click()
  await expect(page).toHaveURL("/posts")
})

test("opens search dialog", async ({ page }) => {
  await page.goto("/")
  await page.getByRole("button", { name: "探索" }).click()
  await expect(page.getByPlaceholder("搜索笔记和想法...")).toBeVisible()
})

test("header logo links to home", async ({ page }) => {
  await page.goto("/about")
  await page.getByRole("link", { name: "sayliks's Corner" }).click()
  await expect(page).toHaveURL("/")
})
