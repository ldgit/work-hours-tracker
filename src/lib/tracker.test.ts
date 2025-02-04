import { expect, test } from "vitest";
import { createTracker } from "./tracker";

test("can create tracker", () => {
	expect(
		createTracker({ paidBreakDuration: 45 }, { user: "Mark S.", workdays: [] }),
	).not.toBeFalsy();
});
