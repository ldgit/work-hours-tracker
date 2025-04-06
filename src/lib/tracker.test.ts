import { beforeEach, afterEach, expect, test, vi } from "vitest";
import {
	createTracker,
	type EventType,
	type Duration,
	type User,
	type Workday,
	type WorkdayEvent,
} from "./tracker";
import { subHours, subMinutes, subSeconds } from "date-fns";

/**
 * Default user starts fresh with no workdays.
 */
let defaultUser: User;

beforeEach(() => {
	defaultUser = {
		id: "66734552-01fb-4663-9c91-27a84ff07efa",
		settings: {
			username: "Mark S.",
			paidBreakDuration: 45,
		},
		// Default user *must* start with zero workdays worked because some tests rely on this.
		trackingData: { workdays: [] },
	};
});

afterEach(() => {
	vi.useRealTimers();
});

test("tracker can start the workday", () => {
	const tracker = createTracker(defaultUser);
	expect(tracker.hasWorkdayStarted()).toStrictEqual(false);

	expect(tracker.startWorkday());

	expect(tracker.hasWorkdayStarted()).toStrictEqual(true);
	expect(tracker.hasBreakStarted()).toStrictEqual(false);
});

test("tracker can start a break", () => {
	const currentDate = new Date();
	defaultUser.trackingData = {
		workdays: [
			{
				events: [{ type: "start-workday", time: subHours(currentDate, 2) }],
				paidBreakDuration: 35,
			},
		],
	};
	const tracker = createTracker(defaultUser);

	tracker.startBreak();

	expect(tracker.hasBreakStarted()).toStrictEqual(true);
	expect(tracker.hasWorkdayStarted()).toStrictEqual(true);
});

test("tracker cannot start a break if workday has not started", () => {
	const currentDate = new Date();
	defaultUser.trackingData = {
		workdays: [
			{
				events: [
					{ type: "start-workday", time: subHours(currentDate, 2) },
					{ type: "end-workday", time: currentDate },
				],
				paidBreakDuration: 35,
			},
		],
	};
	const tracker = createTracker(defaultUser);

	expect(() => tracker.startBreak()).toThrowError(
		new Error("Workday has not started."),
	);
});

(
	[
		{ description: "fresh tracking data", workdays: [] },
		{
			description: "workday started",
			workdays: [
				{
					events: [{ type: "start-workday", time: subHours(new Date(), 2) }],
					paidBreakDuration: 35,
				},
			],
		},
		{
			description: "workday ended",
			workdays: [
				{
					events: [
						{ type: "start-workday", time: subHours(new Date(), 2) },
						{ type: "end-workday", time: new Date() },
					],
					paidBreakDuration: 35,
				},
			],
		},
		{
			description: "break ended",
			workdays: [
				{
					events: [
						{ type: "start-workday", time: subHours(new Date(), 2) },
						{ type: "start-break", time: subHours(new Date(), 1) },
						{ type: "end-break", time: new Date() },
					],
					paidBreakDuration: 35,
				},
			],
		},
	] as { description: string; workdays: Workday[] }[]
).forEach(({ description, workdays }) => {
	test(`tracker cannot end a break if one has not started (${description})`, () => {
		const tracker = createTracker({
			...defaultUser,
			trackingData: { workdays },
		});

		expect(() => tracker.endBreak()).toThrowError(
			new Error("Cannot end the break if a break has not started."),
		);
	});
});

test("tracker can end a break", () => {
	const currentDate = new Date();
	const tracker = createTracker({
		...defaultUser,
		trackingData: {
			workdays: [
				{
					events: [{ type: "start-workday", time: subHours(currentDate, 2) }],
					paidBreakDuration: 35,
				},
			],
		},
	});
	tracker.startBreak();

	tracker.endBreak();

	expect(tracker.hasBreakStarted()).toStrictEqual(false);
});

test("workday can last after midnight the next day ", () => {
	const currentDate = new Date();
	const tracker = createTracker({
		...defaultUser,
		trackingData: {
			workdays: [
				{
					events: [{ type: "start-workday", time: subHours(currentDate, 24) }],
					paidBreakDuration: 35,
				},
			],
		},
	});
	expect(tracker.hasWorkdayStarted()).toStrictEqual(true);

	tracker.endWorkday();

	expect(tracker.hasWorkdayStarted()).toStrictEqual(false);
});

test("tracker cannot start a new workday if previous one has not ended", () => {
	const currentDate = new Date();
	const tracker = createTracker({
		...defaultUser,
		trackingData: {
			workdays: [
				{
					events: [{ type: "start-workday", time: subHours(currentDate, 2) }],
					paidBreakDuration: 35,
				},
			],
		},
	});

	expect(() => tracker.startWorkday()).toThrowError(
		new Error("Cannot start workday if current workday has not ended."),
	);
});

(
	[
		{ description: "fresh tracking data", workdays: [] },
		{
			description: "last workday ended",
			workdays: [
				{
					events: [
						{ type: "start-workday", time: subHours(new Date(), 2) },
						{ type: "end-workday", time: new Date() },
					],
					paidBreakDuration: 35,
				},
			],
		},
	] as { description: string; workdays: Workday[] }[]
).forEach(({ description, workdays }) => {
	test(`tracker cannot end a workday that has not started (${description})`, () => {
		const tracker = createTracker({
			...defaultUser,
			trackingData: { workdays },
		});

		expect(() => tracker.endWorkday()).toThrowError(
			new Error("Cannot end the workday because it has not started."),
		);
	});
});

test("tracker can end the workday", () => {
	const currentDate = new Date();
	const tracker = createTracker({
		...defaultUser,
		trackingData: {
			workdays: [
				{
					events: [{ type: "start-workday", time: subHours(currentDate, 2) }],
					paidBreakDuration: 35,
				},
			],
		},
	});
	expect(tracker.hasWorkdayStarted()).toStrictEqual(true);

	tracker.endWorkday();

	expect(tracker.hasWorkdayStarted()).toStrictEqual(false);
});

(
	[
		{
			description: "fresh tracking data",
			workdays: [],
			expected: { hours: 0, minutes: 0, seconds: 0 },
		},
		{
			description: "last workday ended",
			workdays: [
				{
					events: [
						{ type: "start-workday", time: subHours(new Date(), 2) },
						{ type: "end-workday", time: new Date() },
					],
					paidBreakDuration: 35,
				},
			],
			expected: { hours: 2, minutes: 0, seconds: 0 },
		},
		{
			description: "workday still in progress, no breaks",
			workdays: [
				{
					events: [{ type: "start-workday", time: subHours(new Date(), 2) }],
					paidBreakDuration: 35,
				},
			],
			expected: { hours: 2, minutes: 0, seconds: 0 },
		},
		{
			description: "without breaks",
			workdays: [
				{
					events: [
						{
							type: "start-workday",
							time: subSeconds(subMinutes(subHours(new Date(), 2), 33), 12),
						},
						{ type: "end-workday", time: new Date() },
					],
					paidBreakDuration: 35,
				},
			],
			expected: { hours: 2, minutes: 33, seconds: 12 },
		},
		{
			description: "1 one 24 minutes and 35 seconds break, no paid break",
			workdays: [
				{
					events: [
						// Workday lasted 4 hours
						{ type: "start-workday", time: subHours(new Date(), 4) },
						{ type: "start-break", time: subHours(new Date(), 2) },
						// Break lasted 24 minutes and 35 seconds
						{
							type: "end-break",
							time: subSeconds(subMinutes(subHours(new Date(), 1), 35), 25),
						},
						{ type: "end-workday", time: new Date() },
					],
					paidBreakDuration: 0,
				},
			],
			expected: { hours: 3, minutes: 35, seconds: 25 },
		},
		{
			description: "One 30 minute break, 45 min paid break",
			workdays: [
				{
					events: [
						// Workday lasted 4 hours
						{ type: "start-workday", time: subHours(new Date(), 4) },
						{ type: "start-break", time: subHours(new Date(), 2) },
						{
							type: "end-break",
							time: subMinutes(subHours(new Date(), 1), 30),
						},
						{ type: "end-workday", time: new Date() },
					],
					paidBreakDuration: 45,
				},
			],
			expected: { hours: 4, minutes: 0, seconds: 0 },
		},
		{
			description: "Break currently in progress, no paid break",
			workdays: [
				{
					events: [
						{ type: "start-workday", time: subHours(new Date(), 4) },
						{ type: "start-break", time: subHours(new Date(), 1) },
					],
					paidBreakDuration: 0,
				},
			],
			expected: { hours: 3, minutes: 0, seconds: 0 },
		},
		{
			description: "Break currently in progress, 30 minute paid break",
			workdays: [
				{
					events: [
						{ type: "start-workday", time: subHours(new Date(), 4) },
						{ type: "start-break", time: subMinutes(new Date(), 30) },
					],
					paidBreakDuration: 30,
				},
			],
			expected: { hours: 4, minutes: 0, seconds: 0 },
		},
		{
			description: "Break currently in progress, 20 minute paid break",
			workdays: [
				{
					events: [
						{ type: "start-workday", time: subHours(new Date(), 4) },
						{ type: "start-break", time: subMinutes(new Date(), 30) },
					],
					paidBreakDuration: 20,
				},
			],
			expected: { hours: 3, minutes: 50, seconds: 0 },
		},
		{
			description:
				"30 minute break currently in progress, 45 minute paid break",
			workdays: [
				{
					events: [
						{ type: "start-workday", time: subHours(new Date(), 4) },
						{ type: "start-break", time: subMinutes(new Date(), 30) },
					],
					paidBreakDuration: 45,
				},
			],
			expected: { hours: 4, minutes: 0, seconds: 0 },
		},
		{
			description:
				"One 1 hour 24 minutes and 35 seconds break, 30 minute paid break",
			workdays: [
				{
					events: [
						// Workday lasted 4 hours
						{ type: "start-workday", time: subHours(new Date(), 4) },
						{ type: "start-break", time: subHours(new Date(), 2) },
						// Break lasted 24 minutes and 35 seconds
						{
							type: "end-break",
							time: subSeconds(subMinutes(subHours(new Date(), 1), 35), 25),
						},
						{ type: "end-workday", time: new Date() },
					],
					paidBreakDuration: 30,
				},
			],
			expected: { hours: 4, minutes: 0, seconds: 0 },
		},
		{
			description:
				"One half-hour break, workday not ended, 45 minute paid break",
			workdays: [
				{
					events: [
						{ type: "start-workday", time: subHours(new Date(), 4) },
						{ type: "start-break", time: subHours(new Date(), 2) },
						{
							type: "end-break",
							time: subMinutes(subHours(new Date(), 1), 30),
						},
					],
					paidBreakDuration: 45,
				},
			],
			expected: { hours: 4, minutes: 0, seconds: 0 },
		},
		{
			description:
				"One 1 hour 24 minutes and 35 seconds break, 10 minute paid break",
			workdays: [
				{
					events: [
						// Workday lasted 4 hours
						{ type: "start-workday", time: subHours(new Date(), 4) },
						{ type: "start-break", time: subHours(new Date(), 2) },
						// Break lasted 24 minutes and 35 seconds
						{
							type: "end-break",
							time: subSeconds(subMinutes(subHours(new Date(), 1), 35), 25),
						},
						{ type: "end-workday", time: new Date() },
					],
					paidBreakDuration: 10,
				},
			],
			expected: { hours: 3, minutes: 45, seconds: 25 },
		},
		{
			description: "Multiple breaks, 10 minute paid break",
			workdays: [
				{
					events: [
						// Workday lasted 4 hours
						{ type: "start-workday", time: subHours(new Date(), 4) },
						// Break lasts 24 minutes and 35 seconds
						{ type: "start-break", time: subHours(new Date(), 2) },
						{
							type: "end-break",
							time: subSeconds(subMinutes(subHours(new Date(), 1), 35), 25),
						},
						// Break lasts 10 minutes and 24 seconds
						{
							type: "start-break",
							time: subSeconds(subMinutes(new Date(), 35), 25),
						},
						{
							type: "end-break",
							time: subSeconds(subMinutes(new Date(), 25), 1),
						},
						{ type: "end-workday", time: new Date() },
					],
					paidBreakDuration: 10,
				},
			],
			expected: { hours: 3, minutes: 35, seconds: 1 },
		},
	] as { description: string; workdays: Workday[]; expected: Duration }[]
).forEach(({ description, workdays, expected }) => {
	test(`get time worked since workday started (${description})`, () => {
		const tracker = createTracker({
			...defaultUser,
			trackingData: { workdays },
		});

		expect(tracker.getTimeWorked()).toEqual(expected);
	});
});

test(`getTimeWorked only returns time worked for last workday`, () => {
	const tracker = createTracker({
		...defaultUser,
		trackingData: {
			workdays: [
				{
					events: [
						// Workday lasted 8 hours
						{ type: "start-workday", time: subHours(new Date(), 8) },
						{ type: "end-workday", time: new Date() },
					],
					paidBreakDuration: 5,
				},
				// We measure this workday.
				{
					events: [
						// Workday lasted 4 hours
						{ type: "start-workday", time: subHours(new Date(), 4) },
						// 10 minute break
						{ type: "start-break", time: subMinutes(new Date(), 35) },
						{ type: "end-break", time: subMinutes(new Date(), 25) },
						{ type: "end-workday", time: new Date() },
					],
					paidBreakDuration: 5,
				},
			],
		},
	});

	expect(tracker.getTimeWorked()).toEqual({
		hours: 3,
		minutes: 55,
		seconds: 0,
	});
});

test("tracker returns updated tracking data", () => {
	vi.useFakeTimers();
	const tracker = createTracker({
		...defaultUser,
		trackingData: { workdays: [] },
	});
	const expectedStartDate = new Date();

	tracker.startWorkday();
	expect(tracker.getTrackingData()).toEqual({
		workdays: [
			{
				events: [{ time: expectedStartDate, type: "start-workday" }],
				paidBreakDuration: 45,
			},
		],
	});

	vi.advanceTimersByTime(1000 * 60 * 30);
	const expectedBreakStartDate = new Date();
	tracker.startBreak();
	expect(tracker.getTrackingData()).toEqual({
		workdays: [
			{
				events: [
					{ time: expectedStartDate, type: "start-workday" },
					{ time: expectedBreakStartDate, type: "start-break" },
				],
				paidBreakDuration: 45,
			},
		],
	});

	vi.advanceTimersByTime(1000 * 60 * 30);
	tracker.endBreak();
	const expectedBreakEndDate = new Date();
	expect(tracker.getTrackingData()).toEqual({
		workdays: [
			{
				events: [
					{ time: expectedStartDate, type: "start-workday" },
					{ time: expectedBreakStartDate, type: "start-break" },
					{ time: expectedBreakEndDate, type: "end-break" },
				],
				paidBreakDuration: 45,
			},
		],
	});

	vi.advanceTimersByTime(1000 * 60 * 30);
	tracker.endWorkday();
	const expectedEndDate = new Date();
	expect(tracker.getTrackingData()).toEqual({
		workdays: [
			{
				events: [
					{ time: expectedStartDate, type: "start-workday" },
					{ time: expectedBreakStartDate, type: "start-break" },
					{ time: expectedBreakEndDate, type: "end-break" },
					{ time: expectedEndDate, type: "end-workday" },
				],
				paidBreakDuration: 45,
			},
		],
	});
});

test("trackers can exchange tracking data", () => {
	const oldTracker = createTracker({
		...defaultUser,
		trackingData: { workdays: [] },
	});
	expect(oldTracker.startWorkday());

	const newTracker = createTracker({
		...defaultUser,
		trackingData: oldTracker.getTrackingData(),
	});

	expect(newTracker.hasWorkdayStarted()).toStrictEqual(true);
	expect(newTracker.hasBreakStarted()).toStrictEqual(false);
});

test("getCurrentWorkdayEvents should return empty list for newly created tracker", () => {
	expect(createTracker(defaultUser).getCurrentWorkdayEvents()).toEqual([]);
});

test("getCurrentWorkdayEvents should return correct list ", () => {
	const tracker = createTracker(defaultUser);
	vi.useFakeTimers();

	vi.setSystemTime(new Date(2024, 4, 1, 9, 0, 0));
	tracker.startWorkday();
	vi.setSystemTime(new Date(2024, 4, 1, 9, 30, 0));
	tracker.startBreak();
	vi.setSystemTime(new Date(2024, 4, 1, 9, 45, 0));
	tracker.endBreak();
	vi.setSystemTime(new Date(2024, 4, 1, 17, 0, 0));
	tracker.endWorkday();

	expect(tracker.getCurrentWorkdayEvents()).toEqual([
		{ type: "start-workday", time: new Date(2024, 4, 1, 9, 0, 0) },
		{ type: "start-break", time: new Date(2024, 4, 1, 9, 30, 0) },
		{ type: "end-break", time: new Date(2024, 4, 1, 9, 45, 0) },
		{ type: "end-workday", time: new Date(2024, 4, 1, 17, 0, 0) },
	] as WorkdayEvent[]);

	vi.setSystemTime(new Date(2024, 4, 2, 8, 0, 0));
	tracker.startWorkday();
	vi.setSystemTime(new Date(2024, 4, 2, 8, 30, 0));
	tracker.startBreak();
	vi.setSystemTime(new Date(2024, 4, 2, 8, 45, 0));
	tracker.endBreak();
	vi.setSystemTime(new Date(2024, 4, 2, 16, 0, 0));
	tracker.endWorkday();

	expect(tracker.getCurrentWorkdayEvents()).toEqual([
		{ type: "start-workday", time: new Date(2024, 4, 2, 8, 0, 0) },
		{ type: "start-break", time: new Date(2024, 4, 2, 8, 30, 0) },
		{ type: "end-break", time: new Date(2024, 4, 2, 8, 45, 0) },
		{ type: "end-workday", time: new Date(2024, 4, 2, 16, 0, 0) },
	] as WorkdayEvent[]);
});

test("full work day with breaks test", () => {
	vi.useFakeTimers();
	vi.setSystemTime(new Date(2024, 4, 1, 8, 0, 0));
	defaultUser.settings.paidBreakDuration = 45;
	const tracker = createTracker(defaultUser);

	tracker.startWorkday();
	expect(tracker.hasWorkdayStarted()).toStrictEqual(true);
	expect(tracker.hasBreakStarted()).toStrictEqual(false);

	// Two hours pass.
	vi.advanceTimersByTime(1000 * 60 * 60 * 2);
	expect(tracker.getTimeWorked()).toEqual({
		hours: 2,
		minutes: 0,
		seconds: 0,
	} as Duration);

	// Take a half-hour break.
	tracker.startBreak();
	vi.advanceTimersByTime(1000 * 60 * 30);
	expect(tracker.getTimeWorked()).toEqual({
		hours: 2,
		minutes: 30,
		seconds: 0,
	} as Duration);
	tracker.endBreak();

	// Half an hour passes.
	vi.advanceTimersByTime(1000 * 60 * 30);
	expect(tracker.getTimeWorked()).toEqual({
		hours: 3,
		minutes: 0,
		seconds: 0,
	} as Duration);

	// Take another 5 minute break
	tracker.startBreak();
	vi.advanceTimersByTime(1000 * 60 * 5);
	tracker.endBreak();
	expect(tracker.getTimeWorked()).toEqual({
		hours: 3,
		minutes: 5,
		seconds: 0,
	} as Duration);

	// Hour passes.
	vi.advanceTimersByTime(1000 * 60 * 60);
	expect(tracker.getTimeWorked()).toEqual({
		hours: 4,
		minutes: 5,
		seconds: 0,
	} as Duration);

	// Take 15 minute break, total break time 5 minutes over paid break amount.
	tracker.startBreak();
	vi.advanceTimersByTime(1000 * 60 * 15);
	tracker.endBreak();
	expect(tracker.getTimeWorked()).toEqual({
		hours: 4,
		minutes: 15,
		seconds: 0,
	} as Duration);

	// 4 hours pass.
	vi.advanceTimersByTime(1000 * 60 * 60 * 4);
	expect(tracker.getTimeWorked()).toEqual({
		hours: 8,
		minutes: 15,
		seconds: 0,
	} as Duration);

	// End workday.
	tracker.endWorkday();
	expect(tracker.getTimeWorked()).toEqual({
		hours: 8,
		minutes: 15,
		seconds: 0,
	} as Duration);

	// Wait another 4 hours after workday end, timeWorked should not change.
	vi.advanceTimersByTime(1000 * 60 * 60 * 4);
	expect(tracker.getTimeWorked()).toEqual({
		hours: 8,
		minutes: 15,
		seconds: 0,
	} as Duration);
});

test("hasBreakStarted returns false if workday has not started", () => {
	const tracker = createTracker(defaultUser);
	expect(tracker.hasBreakStarted()).toStrictEqual(false);
});

test("canStartWorkday returns false if workday has started", () => {
	const tracker = createTracker(defaultUser);
	tracker.startWorkday();
	expect(tracker.canStartWorkday()).toStrictEqual(false);
});

test("canStartWorkday returns true if workday has not started", () => {
	const tracker = createTracker(defaultUser);
	expect(tracker.canStartWorkday()).toStrictEqual(true);
});

test("canStartWorkday returns false if workday has ended and next day has not begun", () => {
	vi.useFakeTimers();
	vi.setSystemTime(new Date(2024, 4, 1, 10, 0, 0));
	const tracker = createTracker(defaultUser);
	tracker.startWorkday();
	// 8 hours has passed, it's 18:00h.
	vi.advanceTimersByTime(1000 * 60 * 60 * 8);

	tracker.endWorkday();

	expect(tracker.canStartWorkday()).toStrictEqual(false);
});

test("canStartWorkday returns true if workday has ended and next day has begun", () => {
	vi.useFakeTimers();
	vi.setSystemTime(new Date(2024, 4, 1, 10, 0, 0));
	const tracker = createTracker(defaultUser);
	tracker.startWorkday();
	// 16 hours has passed, it's 02:00h next day.
	vi.advanceTimersByTime(1000 * 60 * 60 * 16);
	tracker.endWorkday();
	// 6 hours has passed, it's 08:00h next day.
	vi.advanceTimersByTime(1000 * 60 * 60 * 6);

	expect(tracker.canStartWorkday()).toStrictEqual(true);
});

test("onChange should register a callback to be called whenever tracker state updates", () => {
	vi.useFakeTimers();
	vi.setSystemTime(new Date(2024, 4, 1, 8, 0, 0));
	const tracker = createTracker(defaultUser);
	const changelog: { user: User; type: EventType }[] = [];
	tracker.onChange((user, type) => {
		changelog.push({ user, type });
	});

	expect(changelog).toHaveLength(0);
	tracker.startWorkday();
	expect(changelog).toHaveLength(1);
	expect(changelog[0].user.trackingData.workdays[0].events).toHaveLength(1);
	expect(changelog[0].type).toEqual("start-workday");

	vi.advanceTimersByTime(1000 * 60 * 60 * 1);
	tracker.startBreak();
	expect(changelog).toHaveLength(2);
	expect(changelog[1].user.trackingData.workdays[0].events).toHaveLength(2);
	expect(changelog[1].type).toEqual("start-break");

	vi.advanceTimersByTime(1000 * 60 * 60 * 1);
	tracker.endBreak();
	expect(changelog).toHaveLength(3);
	expect(changelog[2].user.trackingData.workdays[0].events).toHaveLength(3);
	expect(changelog[2].type).toEqual("end-break");

	vi.advanceTimersByTime(1000 * 60 * 60 * 1);
	tracker.endWorkday();
	expect(changelog).toHaveLength(4);
	expect(changelog[3].user.trackingData.workdays[0].events).toHaveLength(4);
	expect(changelog[3].type).toEqual("end-workday");
});
