import { expect, test, vi } from "vitest";
import { groupWorkdayEvents, type Event } from "./groupWorkdayEvents";

test("groupWorkdayEvents should return empty list when given an empty list", () => {
	expect(groupWorkdayEvents([])).toEqual([]);
});

test("groupWorkdayEvents should return start workday event", () => {
	expect(
		groupWorkdayEvents([
			{ time: new Date(2024, 4, 2, 8, 0, 0), type: "start-workday" },
		]),
	).toEqual([
		{
			type: "start-workday",
			duration: null,
			start: new Date(2024, 4, 2, 8, 0, 0),
		},
	] as Event[]);
});

test("groupWorkdayEvents should return ongoing break event", () => {
	vi.useFakeTimers();
	vi.setSystemTime(new Date(2024, 4, 2, 8, 30, 15));

	expect(
		groupWorkdayEvents([
			{ time: new Date(2024, 4, 2, 8, 0, 0), type: "start-break" },
		]),
	).toEqual([
		{
			type: "break-ongoing",
			duration: { hours: 0, minutes: 30, seconds: 15 },
			start: new Date(2024, 4, 2, 8, 0, 0),
			end: new Date(2024, 4, 2, 8, 30, 15),
		},
	] as Event[]);
});

test("groupWorkdayEvents should combine consecutive start and end break events into a single break", () => {
	vi.useFakeTimers();
	vi.setSystemTime(new Date(2024, 4, 2, 8, 30, 15));

	expect(
		groupWorkdayEvents([
			{ time: new Date(2024, 4, 2, 8, 0, 0), type: "start-break" },
			{ time: new Date(2024, 4, 2, 8, 15, 0), type: "end-break" },
		]),
	).toEqual([
		{
			type: "break",
			duration: { hours: 0, minutes: 15, seconds: 0 },
			start: new Date(2024, 4, 2, 8, 0, 0),
			end: new Date(2024, 4, 2, 8, 15, 0),
		},
	] as Event[]);
});

test("groupWorkdayEvents should return end-work event", () => {
	vi.useFakeTimers();
	vi.setSystemTime(new Date(2024, 4, 2, 8, 30, 15));

	expect(
		groupWorkdayEvents([
			{ time: new Date(2024, 4, 2, 8, 0, 0), type: "start-workday" },
			{ time: new Date(2024, 4, 2, 16, 5, 55), type: "end-workday" },
		]),
	).toEqual([
		{
			type: "start-workday",
			duration: null,
			start: new Date(2024, 4, 2, 8, 0, 0),
		},
		{
			type: "end-workday",
			duration: { hours: 8, minutes: 5, seconds: 55 },
			start: new Date(2024, 4, 2, 16, 5, 55),
		},
	] as Event[]);
});
