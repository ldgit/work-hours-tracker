import { test, expect, Page } from "@playwright/test";

const delay = (milliseconds: number) =>
	new Promise((resolve) => setTimeout(resolve, milliseconds));

test("first visit, full workday", async ({ page }) => {
	await page.goto("/");

	await expect(page).toHaveTitle("Work Hours Tracker");
	await expect(page.getByTestId("favicon")).toHaveAttribute(
		"href",
		"/work-hours-tracker/favicon/initial.ico",
	);
	await expect(
		page.getByRole("heading", { name: "Work Hours Tracker" }),
	).toBeVisible();
	await expect(page.getByLabel("Username")).toBeVisible();
	await expect(page.getByLabel("Daily paid break")).toBeVisible();
	await expect(page.getByLabel("Workday length")).toBeVisible();
	await expect(page.getByLabel("Username")).toContainText("");
	await expect(page.getByLabel("Daily paid break")).toContainText("");
	await expect(page.getByTitle("Options")).not.toBeVisible();

	// Fill in the initial form
	await page.getByLabel("Username").fill("Mark S");
	await page.getByLabel("Daily paid break").fill("30");
	await page.getByLabel("Workday length").fill("6");
	await page.getByText("Start tracking").click();

	// Form is gone
	await expect(page.getByLabel("Username")).not.toBeVisible();
	await expect(page.getByLabel("Daily paid break")).not.toBeVisible();
	await expect(page.getByLabel("Workday length")).not.toBeVisible();
	await expect(page.getByText("Start tracking")).not.toBeVisible();

	// User work hours tracking interface is shown
	await expect(page.getByRole("heading", { name: "Mark S" })).toBeVisible();
	await expect(page.getByRole("button", { name: "Start Work" })).toBeEnabled();
	await expect(
		page.getByRole("button", { name: "Start Break" }),
	).toBeDisabled();
	await expect(page.getByRole("button", { name: "End Work" })).toBeDisabled();

	await expect(page.getByText("Not working")).toBeVisible();
	await expect(page.getByText("Not working")).toHaveCSS(
		"color",
		"rgb(255, 0, 0)",
	);

	await expect(page.getByTitle("Options")).toBeVisible();

	// Favicon updated
	await expect(page.getByTestId("favicon")).toHaveAttribute(
		"href",
		"/work-hours-tracker/favicon/initial.ico",
	);

	// Workday starts at 8:05:00
	await page.clock.setFixedTime(new Date(2025, 2, 2, 8, 5, 0));
	await page.getByRole("button", { name: "Start Work" }).click();

	await expect(page.getByRole("button", { name: "Start Work" })).toBeDisabled();
	await expect(page.getByRole("button", { name: "Start Break" })).toBeEnabled();
	await expect(page.getByRole("button", { name: "End Work" })).toBeEnabled();
	await expect(page.getByText("Working")).toBeVisible();
	await expect(page.getByText("Working")).toHaveCSS(
		"color",
		"rgb(127, 255, 0)",
	);
	await expect(page.getByTestId("favicon")).toHaveAttribute(
		"href",
		"/work-hours-tracker/favicon/working.ico",
	);

	// Take a break at 8:35:00
	await page.clock.setFixedTime(new Date(2025, 2, 2, 8, 35, 0));
	await page.getByRole("button", { name: "Start Break" }).click();

	await expect(page.getByRole("button", { name: "Start Work" })).toBeDisabled();
	await expect(page.getByRole("button", { name: "End Work" })).toBeDisabled();
	await expect(
		page.getByRole("button", { name: "Start Break" }),
	).not.toBeVisible();
	await expect(page.getByRole("button", { name: "End Break" })).toBeVisible();
	await expect(page.getByText("On break")).toBeVisible();
	await expect(page.getByText("On break")).toHaveCSS(
		"color",
		"rgb(255, 234, 0)",
	);
	await expect(page.getByTestId("favicon")).toHaveAttribute(
		"href",
		"/work-hours-tracker/favicon/on-break.ico",
	);

	// End the break at 9:05:00
	await page.clock.setFixedTime(new Date(2025, 2, 2, 9, 5, 0));
	await page.getByRole("button", { name: "End Break" }).click();

	await expect(page.getByRole("button", { name: "Start Work" })).toBeDisabled();
	await expect(page.getByRole("button", { name: "End Work" })).toBeEnabled();
	await expect(page.getByRole("button", { name: "Start Break" })).toBeVisible();
	await expect(
		page.getByRole("button", { name: "End Break" }),
	).not.toBeVisible();

	// End work at 16:05:00
	await page.clock.setFixedTime(new Date(2025, 2, 2, 16, 5, 0));
	await page.getByRole("button", { name: "End Work" }).click();
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
	await expect(page.getByTestId("favicon")).toHaveAttribute(
		"href",
		"/work-hours-tracker/favicon/working.ico",
	);

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

	await expect(page.getByRole("button", { name: "Start Work" })).toBeDisabled();
	await expect(
		page.getByRole("button", { name: "Start Break" }),
	).toBeDisabled();
	await expect(page.getByRole("button", { name: "End Work" })).toBeDisabled();
	await expect(page.getByText("Not working")).toBeVisible();
	await expect(page.getByText("Not working")).toHaveCSS(
		"color",
		"rgb(255, 0, 0)",
	);
	await expect(page.getByTestId("favicon")).toHaveAttribute(
		"href",
		"/work-hours-tracker/favicon/initial.ico",
	);
});

test("User data persists through reloads", async ({ page }) => {
	await page.goto("/");
	await expect(
		page.getByRole("heading", { name: "Work Hours Tracker" }),
	).toBeVisible();
	await expect(page.getByLabel("Username")).toBeVisible();
	await expect(page.getByLabel("Daily paid break")).toBeVisible();
	await expect(page.getByLabel("Username")).toContainText("");
	await expect(page.getByLabel("Daily paid break")).toContainText("");

	// Fill in the initial form
	await page.getByLabel("Username").fill("Helly R");
	await page.getByLabel("Daily paid break").fill("45");
	await page.getByText("Start tracking").click();

	await expect(page.getByRole("heading", { name: "Helly R" })).toBeVisible();
	await expect(page.getByRole("button", { name: "Start Work" })).toBeEnabled();
	await expect(
		page.getByRole("button", { name: "Start Break" }),
	).toBeDisabled();
	await expect(page.getByRole("button", { name: "End Work" })).toBeDisabled();

	await page.reload();

	await expect(page.getByRole("heading", { name: "Helly R" })).toBeVisible();
	await expect(page.getByRole("button", { name: "Start Work" })).toBeEnabled();
	await expect(
		page.getByRole("button", { name: "Start Break" }),
	).toBeDisabled();
	await expect(page.getByRole("button", { name: "End Work" })).toBeDisabled();
});

test("Tracking data persists through reloads", async ({ page }) => {
	await page.goto("/");
	await expect(
		page.getByRole("heading", { name: "Work Hours Tracker" }),
	).toBeVisible();
	// Fill in the initial form
	await page.getByLabel("Username").fill("Burt G");
	await page.getByLabel("Daily paid break").fill("45");
	await page.getByText("Start tracking").click();
	// 8:05:00 hours
	await page.clock.setFixedTime(new Date(2025, 2, 2, 8, 5, 0));
	await page.getByRole("button", { name: "Start Work" }).click();
	await page.clock.setFixedTime(new Date(2025, 2, 2, 8, 35, 0));
	await page.getByRole("button", { name: "Start Break" }).click();
	// Buttons in correct state after starting the break.
	await expect(page.getByRole("button", { name: "Start Work" })).toBeDisabled();
	await expect(page.getByRole("button", { name: "End Work" })).toBeDisabled();
	await expect(
		page.getByRole("button", { name: "Start Break" }),
	).not.toBeVisible();
	await expect(page.getByRole("button", { name: "End Break" })).toBeVisible();

	await page.reload();

	// Buttons in correct state after starting the break even after reloading.
	await expect(page.getByRole("button", { name: "Start Work" })).toBeDisabled();
	await expect(page.getByRole("button", { name: "End Work" })).toBeDisabled();
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
	test(`Can close confirm end work dialog by ${desc}`, async ({ page }) => {
		await page.goto("/");
		// Fill in the initial form
		await page.getByLabel("Username").fill("Mark S");
		await page.getByLabel("Daily paid break").fill("30");
		await page.getByText("Start tracking").click();

		// Workday starts at 8:05:00
		await page.clock.setFixedTime(new Date(2025, 2, 2, 8, 5, 0));
		await page.getByRole("button", { name: "Start Work" }).click();
		await page.clock.setFixedTime(new Date(2025, 2, 2, 8, 35, 0));
		await page.getByRole("button", { name: "End Work" }).click();

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
			page.getByRole("button", { name: "Start Work" }),
		).toBeDisabled();
		await expect(
			page.getByRole("button", { name: "Start Break" }),
		).toBeEnabled();
		await expect(page.getByRole("button", { name: "End Work" })).toBeEnabled();
	});
});

test("Display hours worked so far", async ({ page }) => {
	await page.goto("/");
	await page.getByLabel("Username").fill("Mark S");
	await page.getByLabel("Daily paid break").fill("30");
	await page.getByText("Start tracking").click();

	await expect(page.getByText(/\d+ hr \d+ min \d+ sec/)).not.toBeVisible();

	await page.clock.setFixedTime(new Date(2025, 2, 2, 8, 5, 0));
	await page.getByRole("button", { name: "Start Work" }).click();

	await expect(page.getByText("00 hr 00 min 00 sec")).toBeVisible();

	await page.clock.setFixedTime(new Date(2025, 2, 2, 9, 5, 0));
	await page.reload();
	await expect(page.getByText("01 hr 00 min 00 sec")).toBeVisible();

	await page.clock.setFixedTime(new Date(2025, 2, 2, 9, 15, 25));
	await page.reload();
	await expect(page.getByText("01 hr 10 min 25 sec")).toBeVisible();

	await page.clock.setFixedTime(new Date(2025, 2, 2, 16, 10, 30));
	await expect(page.getByText(/\d+ hr \d+ min \d+ sec/)).toBeVisible();
	await page.getByRole("button", { name: "End Work" }).click();
	await page.getByRole("button", { name: "Yes, I'm done for today" }).click();
	// Test fails without this delay in headless chromium browser for playwright
	// versions 1.52.0 or higher.
	await delay(10);
	await page.reload();
	await expect(page.getByText(/\d+ hr \d+ min \d+ sec/)).not.toBeVisible();
});

test("can change paid break duration through the options menu after workday started", async ({
	page,
}) => {
	await page.goto("/");
	await page.getByLabel("Username").fill("Mark S");
	await page.getByText("Start tracking").click();
	await expect(page.getByTitle("Options")).toBeVisible();
	// Start work and use the full paid break.
	await page.clock.setFixedTime(new Date(2025, 2, 2, 8, 5, 0));
	await page.getByRole("button", { name: "Start work" }).click();
	await page.clock.setFixedTime(new Date(2025, 2, 2, 9, 5, 0));
	await page.getByRole("button", { name: "Start break" }).click();
	await page.clock.setFixedTime(new Date(2025, 2, 2, 9, 55, 0));
	await page.getByRole("button", { name: "End break" }).click();
	await expect(page.getByText("01 hr 45 min 00 sec")).toBeVisible();
	await expect(page.getByLabel("Daily paid break")).not.toBeVisible();

	await page.getByTitle("Options").click();
	await expect(page.getByLabel("Daily paid break")).toBeVisible();
	await expect(
		page.getByRole("spinbutton", { name: "Daily paid break" }),
	).toHaveValue("45"); // default
	await page.getByLabel("Daily paid break").fill("35");
	await page.getByRole("button", { name: "Save" }).click();

	// Form is closed.
	await expect(page.getByLabel("Daily paid break")).not.toBeVisible();
	// Smaller paid break should reduce hours worked.
	await expect(page.getByText("01 hr 35 min 00 sec")).toBeVisible();
	// Test fails without this delay in headless chromium browser for playwright
	// versions 1.52.0 or higher.
	await delay(10);
	await page.reload();
	await expect(
		page.getByText("01 hr 35 min 00 sec"),
		"Changes should be saved in the actual database",
	).toBeVisible();
});

test("can change paid break duration through the options menu before workday started", async ({
	page,
}) => {
	await page.goto("/");
	await page.getByLabel("Username").fill("Mark S");
	await page.getByText("Start tracking").click();
	await expect(page.getByTitle("Options")).toBeVisible();

	await page.getByTitle("Options").click();
	await expect(page.getByLabel("Daily paid break")).toBeVisible();
	await expect(
		page.getByRole("spinbutton", { name: "Daily paid break" }),
	).toHaveValue("45"); // default
	await page.getByLabel("Daily paid break").fill("35");
	await page.getByRole("button", { name: "Save" }).click();

	// Form is closed.
	await expect(page.getByLabel("Daily paid break")).not.toBeVisible();
	// Start work, work for one hour, then do a 50 minute break.
	await page.clock.setFixedTime(new Date(2025, 2, 2, 8, 5, 0));
	await page.getByRole("button", { name: "Start work" }).click();
	await page.clock.setFixedTime(new Date(2025, 2, 2, 9, 5, 0));
	await page.getByRole("button", { name: "Start break" }).click();
	await page.clock.setFixedTime(new Date(2025, 2, 2, 9, 55, 0));
	await page.getByRole("button", { name: "End break" }).click();
	// Smaller paid break should reduce hours worked.
	await expect(page.getByText("01 hr 35 min 00 sec")).toBeVisible();
	// Test fails without this delay in headless chromium browser for playwright
	// versions 1.52.0 or higher.
	await delay(10);
	await page.reload();
	await expect(
		page.getByText("01 hr 35 min 00 sec"),
		"Changes should be saved in the actual database",
	).toBeVisible();
});

test("can see the current estimate of when the workday will end", async ({
	page,
}) => {
	await page.goto("/");
	await page.getByLabel("Username").fill("Mark S");
	await expect(page.getByText(/Estimated work end:/)).not.toBeVisible();
	await page.getByText("Start tracking").click();
	await page.clock.setFixedTime(new Date(2025, 2, 2, 8, 5, 0));
	await expect(page.getByText(/Estimated work end:/)).not.toBeVisible();
	await page.getByRole("button", { name: "Start work" }).click();
	await expect(page.getByText("Estimated work end: 16:05:00")).toBeVisible();
});

test("can change workday length through the options menu before workday starts", async ({
	page,
}) => {
	await page.goto("/");
	await page.getByLabel("Username").fill("Mark S");
	await expect(page.getByText(/Estimated work end:/)).not.toBeVisible();
	await page.getByText("Start tracking").click();
	await page.clock.setFixedTime(new Date(2025, 2, 2, 8, 5, 0));
	await expect(page.getByText(/Estimated work end:/)).not.toBeVisible();

	await page.getByTitle("Options").click();
	await expect(page.getByLabel("Workday length")).toBeVisible();
	await expect(
		page.getByRole("spinbutton", { name: "Workday length" }),
	).toHaveValue("8"); // default
	await page.getByLabel("Workday length").fill("6");
	await page.getByRole("button", { name: "Save" }).click();

	await page.getByRole("button", { name: "Start work" }).click();
	await expect(page.getByText("Estimated work end: 14:05:00")).toBeVisible();
});

test("can change workday length through the options menu after workday starts", async ({
	page,
}) => {
	await page.goto("/");
	await page.getByLabel("Username").fill("Mark S");
	await page.getByText("Start tracking").click();
	await page.clock.setFixedTime(new Date(2025, 2, 2, 8, 5, 0));
	await page.getByRole("button", { name: "Start work" }).click();

	await page.getByTitle("Options").click();
	await expect(page.getByLabel("Workday length")).toBeVisible();
	await page.getByLabel("Workday length").fill("5");
	await page.getByRole("button", { name: "Save" }).click();

	await expect(page.getByText("Estimated work end: 13:05:00")).toBeVisible();
});

test("submit Options form without changing values", async ({ page }) => {
	await page.goto("/");
	await page.getByLabel("Username").fill("Mark S");
	await page.getByText("Start tracking").click();

	await saveUnchangedOptionsForm(page);

	await page.clock.setFixedTime(new Date(2025, 2, 2, 8, 0, 0));
	await page.getByRole("button", { name: "Start work" }).click();
	await page.clock.setFixedTime(new Date(2025, 2, 2, 9, 0, 0));
	await page.getByRole("button", { name: "Start break" }).click();
	await page.clock.setFixedTime(new Date(2025, 2, 2, 10, 0, 0));
	await page.getByRole("button", { name: "End break" }).click();

	await expect(page.getByText("Estimated work end: 16:15:00")).toBeVisible();
	await expect(page.getByText("01 hr 45 min 00 sec")).toBeVisible();

	await saveUnchangedOptionsForm(page);

	await expect(page.getByText("Estimated work end: 16:15:00")).toBeVisible();
	await expect(page.getByText("01 hr 45 min 00 sec")).toBeVisible();
});

test("cancel Options form should close it without saving changes", async ({
	page,
}) => {
	await page.goto("/");
	await page.getByLabel("Username").fill("Mark S");
	await page.getByText("Start tracking").click();
	await page.clock.setFixedTime(new Date(2025, 2, 2, 8, 0, 0));
	await page.getByRole("button", { name: "Start work" }).click();
	await page.clock.setFixedTime(new Date(2025, 2, 2, 9, 0, 0));
	await page.getByRole("button", { name: "Start break" }).click();
	await page.clock.setFixedTime(new Date(2025, 2, 2, 10, 0, 0));
	await page.getByRole("button", { name: "End break" }).click();

	await page.getByTitle("Options").click();
	await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();
	await page.getByLabel("Daily paid break").fill("35");
	await page.getByLabel("Workday length").fill("6");
	await page.getByRole("button", { name: "Cancel" }).click();

	await expect(page.getByText("Estimated work end: 16:15:00")).toBeVisible();
	await expect(page.getByText("01 hr 45 min 00 sec")).toBeVisible();
});

async function saveUnchangedOptionsForm(page: Page) {
	await page.getByTitle("Options").click();
	await expect(page.getByLabel("Daily paid break")).toBeVisible();
	await expect(page.getByLabel("Workday length")).toBeVisible();
	await page.getByRole("button", { name: "Save" }).click();
}
