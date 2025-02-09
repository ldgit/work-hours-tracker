import { test, expect } from "@playwright/test";

test("on first visit create a basic config", async ({ page }) => {
	await page.goto("/");

	await expect(page).toHaveTitle("Work Hours Tracker");
	await expect(
		page.getByRole("heading", { name: "Welcome to Work Hours Tracker" }),
	).toBeVisible();
	await expect(page.getByLabel("Username")).toBeVisible();
	await expect(page.getByLabel("Daily paid break")).toBeVisible();
	await expect(page.getByLabel("Username")).toContainText("");
	await expect(page.getByLabel("Daily paid break")).toContainText("");

	// Fill in the initial form
	await page.getByLabel("Username").fill("Mark S");
	await page.getByLabel("Daily paid break").fill("30");
	await page.getByText("Start tracking!").click();

	// Form is gone
	await expect(page.getByLabel("Username")).not.toBeVisible();
	await expect(page.getByLabel("Daily paid break")).not.toBeVisible();
	await expect(page.getByText("Start tracking!")).not.toBeVisible();

	await page.reload();

	// Form is still gone
	await expect(page.getByLabel("Username")).not.toBeVisible();
	await expect(page.getByLabel("Daily paid break")).not.toBeVisible();
	await expect(page.getByText("Start tracking!")).not.toBeVisible();
});
