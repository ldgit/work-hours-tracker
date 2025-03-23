import { test, expect, Page } from "@playwright/test";

test("first visit, full workday", async ({ page }) => {
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

	// User work hours tracking interface is shown
	await expect(
		page.getByRole("heading", { name: "Welcome Mark S" }),
	).toBeVisible();
	await expect(
		page.getByRole("button", { name: "Start Workday" }),
	).toBeEnabled();
	await expect(
		page.getByRole("button", { name: "Start Break" }),
	).toBeDisabled();
	await expect(
		page.getByRole("button", { name: "End Workday" }),
	).toBeDisabled();

	// Workday starts at 8:05:00
	await page.clock.setFixedTime(new Date(2025, 2, 2, 8, 5, 0));
	await page.getByRole("button", { name: "Start Workday" }).click();

	await expect(
		page.getByRole("button", { name: "Start Workday" }),
	).toBeDisabled();
	await expect(page.getByRole("button", { name: "Start Break" })).toBeEnabled();
	await expect(page.getByRole("button", { name: "End Workday" })).toBeEnabled();

	// Take a break at 8:35:00
	await page.clock.setFixedTime(new Date(2025, 2, 2, 8, 35, 0));
	await page.getByRole("button", { name: "Start Break" }).click();

	await expect(
		page.getByRole("button", { name: "Start Workday" }),
	).toBeDisabled();
	await expect(
		page.getByRole("button", { name: "End Workday" }),
	).toBeDisabled();
	await expect(
		page.getByRole("button", { name: "Start Break" }),
	).not.toBeVisible();
	await expect(page.getByRole("button", { name: "End Break" })).toBeVisible();

	// End the break at 9:05:00
	await page.clock.setFixedTime(new Date(2025, 2, 2, 9, 5, 0));
	await page.getByRole("button", { name: "End Break" }).click();

	await expect(
		page.getByRole("button", { name: "Start Workday" }),
	).toBeDisabled();
	await expect(page.getByRole("button", { name: "End Workday" })).toBeEnabled();
	await expect(page.getByRole("button", { name: "Start Break" })).toBeVisible();
	await expect(
		page.getByRole("button", { name: "End Break" }),
	).not.toBeVisible();

	// End work at 16:05:00
	await page.clock.setFixedTime(new Date(2025, 2, 2, 16, 5, 0));
	await page.getByRole("button", { name: "End Workday" }).click();
	await expect(
		page.getByRole("heading", { name: "Are you sure?" }),
	).toBeVisible();
	await expect(
		page.getByText(
			"You will not be able to start new workday until the next day.",
		),
	).toBeVisible();
	await expect(
		page.getByRole("button", { name: "Yes, I'm done for today" }),
	).toBeVisible();
	await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();

	await page.getByRole("button", { name: "Yes, I'm done for today" }).click();

	// Modal closes.
	await expect(
		page.getByRole("heading", { name: "Are you sure?" }),
	).not.toBeVisible();
	await expect(
		page.getByText(
			"You will not be able to start new workday until the next day.",
		),
	).not.toBeVisible();
	await expect(
		page.getByRole("button", { name: "Yes, I'm done for today" }),
	).not.toBeVisible();
	await expect(page.getByRole("button", { name: "Cancel" })).not.toBeVisible();

	await expect(
		page.getByRole("button", { name: "Start Workday" }),
	).toBeDisabled();
	await expect(
		page.getByRole("button", { name: "Start Break" }),
	).toBeDisabled();
	await expect(
		page.getByRole("button", { name: "End Workday" }),
	).toBeDisabled();
});

test("User data persists through reloads", async ({ page }) => {
	await page.goto("/");
	await expect(
		page.getByRole("heading", { name: "Welcome to Work Hours Tracker" }),
	).toBeVisible();
	await expect(page.getByLabel("Username")).toBeVisible();
	await expect(page.getByLabel("Daily paid break")).toBeVisible();
	await expect(page.getByLabel("Username")).toContainText("");
	await expect(page.getByLabel("Daily paid break")).toContainText("");

	// Fill in the initial form
	await page.getByLabel("Username").fill("Helly R");
	await page.getByLabel("Daily paid break").fill("45");
	await page.getByText("Start tracking!").click();

	await expect(
		page.getByRole("heading", { name: "Welcome Helly R" }),
	).toBeVisible();
	await expect(
		page.getByRole("button", { name: "Start Workday" }),
	).toBeEnabled();
	await expect(
		page.getByRole("button", { name: "Start Break" }),
	).toBeDisabled();
	await expect(
		page.getByRole("button", { name: "End Workday" }),
	).toBeDisabled();

	await page.reload();

	await expect(
		page.getByRole("heading", { name: "Welcome Helly R" }),
	).toBeVisible();
	await expect(
		page.getByRole("button", { name: "Start Workday" }),
	).toBeEnabled();
	await expect(
		page.getByRole("button", { name: "Start Break" }),
	).toBeDisabled();
	await expect(
		page.getByRole("button", { name: "End Workday" }),
	).toBeDisabled();
});

test("Tracking data persists through reloads", async ({ page }) => {
	await page.goto("/");
	await expect(
		page.getByRole("heading", { name: "Welcome to Work Hours Tracker" }),
	).toBeVisible();
	// Fill in the initial form
	await page.getByLabel("Username").fill("Burt G");
	await page.getByLabel("Daily paid break").fill("45");
	await page.getByText("Start tracking!").click();
	// 8:05:00 hours
	await page.clock.setFixedTime(new Date(2025, 2, 2, 8, 5, 0));
	await page.getByRole("button", { name: "Start Workday" }).click();
	await page.clock.setFixedTime(new Date(2025, 2, 2, 8, 35, 0));
	await page.getByRole("button", { name: "Start Break" }).click();
	// Buttons in correct state after starting the break.
	await expect(
		page.getByRole("button", { name: "Start Workday" }),
	).toBeDisabled();
	await expect(
		page.getByRole("button", { name: "End Workday" }),
	).toBeDisabled();
	await expect(
		page.getByRole("button", { name: "Start Break" }),
	).not.toBeVisible();
	await expect(page.getByRole("button", { name: "End Break" })).toBeVisible();

	await page.reload();

	// Buttons in correct state after starting the break even after reloading.
	await expect(
		page.getByRole("button", { name: "Start Workday" }),
	).toBeDisabled();
	await expect(
		page.getByRole("button", { name: "End Workday" }),
	).toBeDisabled();
	await expect(
		page.getByRole("button", { name: "Start Break" }),
	).not.toBeVisible();
	await expect(page.getByRole("button", { name: "End Break" })).toBeVisible();
});

[
	{
		desc: "clicking the cancel button",
		getCancelElement: async (page: Page) =>
			await page.getByRole("button", { name: "Cancel" }),
	},
	{
		desc: "clicking outside modal",
		getCancelElement: async (page: Page) => await page.getByRole("alertdialog"),
	},
].forEach(({ desc, getCancelElement }) => {
	test(`Can close confirm end workday dialog by ${desc}`, async ({ page }) => {
		await page.goto("/");
		// Fill in the initial form
		await page.getByLabel("Username").fill("Mark S");
		await page.getByLabel("Daily paid break").fill("30");
		await page.getByText("Start tracking!").click();

		// Workday starts at 8:05:00
		await page.clock.setFixedTime(new Date(2025, 2, 2, 8, 5, 0));
		await page.getByRole("button", { name: "Start Workday" }).click();
		await page.clock.setFixedTime(new Date(2025, 2, 2, 8, 35, 0));
		await page.getByRole("button", { name: "End Workday" }).click();

		// Confirmation modal opens.
		await expect(
			page.getByRole("heading", { name: "Are you sure?" }),
		).toBeVisible();
		await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();

		(await getCancelElement(page)).click();

		// Modal is closed
		await expect(
			page.getByRole("heading", { name: "Are you sure?" }),
		).not.toBeVisible();
		// Everything else unchanged
		await expect(
			page.getByRole("button", { name: "Start Workday" }),
		).toBeDisabled();
		await expect(
			page.getByRole("button", { name: "Start Break" }),
		).toBeEnabled();
		await expect(
			page.getByRole("button", { name: "End Workday" }),
		).toBeEnabled();
	});
});
