/// <reference types="@vitest/browser/providers/playwright" />

import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		// Exclude functional tests.
		exclude: [...configDefaults.exclude, "tests/**"],
		testTimeout: 2000,
		browser: {
			enabled: true,
			provider: "playwright",
			headless: true,
			screenshotFailures: false,
			// https://vitest.dev/guide/browser/playwright
			instances: [
				{ browser: "chromium" },
				{ browser: "firefox" },
				{ browser: "webkit" },
			],
		},
	},
});
