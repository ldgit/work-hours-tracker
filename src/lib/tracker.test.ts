import { expect, test } from "vitest";
import { createTracker } from "./tracker";

test("can create tracker", () => {
	expect(
		createTracker(
			{ id: "", username: "Mark S.", paidBreakDuration: 45 },
			{ workdays: [] },
		),
	).not.toBeFalsy();
});
