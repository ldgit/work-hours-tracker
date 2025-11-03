import { addSeconds, differenceInSeconds, isSameDay } from "date-fns";
import { getTimeWorkedFromSecondsWorked } from "./getTimeWorkedFromSeconds";

export type EventType =
	| "start-workday"
	| "end-workday"
	| "start-break"
	| "end-break";

export interface User {
	id: string;
	settings: Settings;
	trackingData: TrackingData;
}

export interface WorkdayEvent {
	time: Date;
	type: EventType;
}

export interface Workday {
	events: WorkdayEvent[];
	/** In minutes. */
	paidBreakDuration: number;
	/** In hours. */
	workdayLength: number;
}

export interface TrackingData {
	workdays: Workday[];
}

export interface Settings {
	username: string;
	paidBreakDuration: number;
	// In hours.
	workdayLength: number;
}

export interface Duration {
	hours: number;
	minutes: number;
	seconds: number;
}

interface Tracker {
	startWorkday(): void;
	startBreak(): void;
	endBreak(): void;
	endWorkday(): void;
	canStartWorkday(): boolean;
	hasWorkdayStarted(): boolean;
	hasBreakStarted(): boolean;
	getTrackingData(): TrackingData;
	/**
	 * Gets the time worked for workday in progress or last full workday.
	 */
	getTimeWorked(): Duration;
	onChange(handler: (user: User, type: EventType) => void): void;
	getCurrentWorkdayEvents(): WorkdayEvent[];
	calculateWorkEndTime(): Date;
	changeWorkdayLength(newWorkdayLength: number): void;
	changePaidBreakDuration(newPaidBreakDuration: number): void;
}

function getSecondsWorked(currentWorkday: Workday | undefined): number {
	if (currentWorkday === undefined) {
		return 0;
	}

	// Only start-workday event has occurred.
	if (currentWorkday.events.length === 1) {
		const currentEvent = currentWorkday.events[0];
		const secondsWorked = differenceInSeconds(new Date(), currentEvent.time);

		return secondsWorked;
	}

	const secondsOnBreak = currentWorkday.events.reduce(
		(secondsOnBreakSoFar, currentEvent, index, events) => {
			const previousEvent = events[index - 1];
			if (currentEvent.type === "end-break") {
				secondsOnBreakSoFar += differenceInSeconds(
					currentEvent.time,
					previousEvent.time,
				);
			}

			// If break is ongoing when getTimeWorked method is called we add the
			// seconds elapsed since the start of the break.
			if (currentEvent.type === "start-break" && index === events.length - 1) {
				secondsOnBreakSoFar += differenceInSeconds(
					new Date(),
					currentEvent.time,
				);
			}

			return secondsOnBreakSoFar;
		},
		0,
	);

	const secondsWorked =
		currentWorkday.events.reduce(
			(secondsWorkedSoFar, currentEvent, index, events) => {
				const previousEvent = events[index - 1];
				if (
					currentEvent.type === "start-break" ||
					currentEvent.type === "end-workday"
				) {
					secondsWorkedSoFar += differenceInSeconds(
						currentEvent.time,
						previousEvent.time,
					);
				}

				// If the last event is end-break, measure time elapsed since it occurred.
				if (currentEvent.type === "end-break" && index === events.length - 1) {
					secondsWorkedSoFar += differenceInSeconds(
						new Date(),
						currentEvent.time,
					);
				}

				return secondsWorkedSoFar;
			},
			0,
		) + Math.min(currentWorkday.paidBreakDuration * 60, secondsOnBreak);

	return secondsWorked;
}

export function createTracker(user: User): Tracker {
	const data = user.trackingData;
	let onChangeCallback: (user: User, type: EventType) => void = () => {};

	return {
		onChange(callback) {
			onChangeCallback = callback;
		},
		startWorkday() {
			if (hasWorkdayStarted(getLastWorkday(data))) {
				throw new Error(
					"Cannot start workday if current workday has not ended.",
				);
			}

			data.workdays.push({
				paidBreakDuration: user.settings.paidBreakDuration,
				workdayLength: user.settings.workdayLength,
				events: [{ type: "start-workday", time: new Date() }],
			});

			onChangeCallback(user, "start-workday");
		},
		startBreak() {
			const currentWorkday = getLastWorkday(data);

			if (!hasWorkdayStarted(currentWorkday)) {
				throw new Error("Workday has not started.");
			}

			currentWorkday!.events.push({
				time: new Date(),
				type: "start-break",
			});
			onChangeCallback(user, "start-break");
		},
		endBreak() {
			const currentWorkday = getLastWorkday(data);
			if (currentWorkday === undefined) {
				throw new Error("Cannot end the break if a break has not started.");
			}

			const lastEvent = currentWorkday.events[currentWorkday.events.length - 1];

			if (lastEvent.type !== "start-break") {
				throw new Error("Cannot end the break if a break has not started.");
			}

			currentWorkday.events.push({ time: new Date(), type: "end-break" });
			onChangeCallback(user, "end-break");
		},
		endWorkday() {
			const lastWorkday = getLastWorkday(data);

			if (lastWorkday === undefined) {
				throw new Error("Cannot end the workday because it has not started.");
			}

			const lastEvent = lastWorkday.events[lastWorkday.events.length - 1];
			if (lastEvent.type === "end-workday") {
				throw new Error("Cannot end the workday because it has not started.");
			}

			lastWorkday.events.push({ time: new Date(), type: "end-workday" });
			onChangeCallback(user, "end-workday");
		},
		hasWorkdayStarted() {
			return hasWorkdayStarted(getLastWorkday(data));
		},
		canStartWorkday() {
			const currentWorkday = getLastWorkday(data);

			if (!currentWorkday) {
				return true;
			}

			const firstEvent = currentWorkday.events[0];
			if (isSameDay(firstEvent.time, new Date())) {
				return false;
			}

			return !hasWorkdayStarted(currentWorkday);
		},
		hasBreakStarted() {
			const currentWorkday = getLastWorkday(data);
			if (!currentWorkday) {
				return false;
			}

			const lastEvent = currentWorkday.events[currentWorkday.events.length - 1];

			return lastEvent.type === "start-break";
		},
		getTrackingData() {
			return data;
		},
		getTimeWorked() {
			const currentWorkday = getLastWorkday(data);

			return getTimeWorkedFromSecondsWorked(getSecondsWorked(currentWorkday));
		},
		getCurrentWorkdayEvents() {
			if (data.workdays.length === 0) {
				return [];
			}

			const workdayEvents = data.workdays[data.workdays.length - 1].events;

			return workdayEvents;
		},
		calculateWorkEndTime() {
			const currentWorkday = getLastWorkday(data);
			const workdayLength = hasWorkdayStarted(currentWorkday)
				? currentWorkday!.workdayLength
				: user.settings.workdayLength;
			const workdayLengthInSeconds = workdayLength * 60 * 60;
			const secondsWorked = getSecondsWorked(currentWorkday);

			if (secondsWorked <= workdayLengthInSeconds) {
				return addSeconds(new Date(), workdayLengthInSeconds - secondsWorked);
			}

			return new Date();
		},
		changeWorkdayLength(newWorkdayLength) {
			user.settings.workdayLength = newWorkdayLength;
			const currentWorkday = getLastWorkday(data);
			if (hasWorkdayStarted(currentWorkday)) {
				currentWorkday!.workdayLength = newWorkdayLength;
			}
		},
		changePaidBreakDuration(newPaidBreakDuration) {
			user.settings.paidBreakDuration = newPaidBreakDuration;
			const currentWorkday = getLastWorkday(data);
			if (hasWorkdayStarted(currentWorkday)) {
				currentWorkday!.paidBreakDuration = newPaidBreakDuration;
			}
		},
	};
}

function hasWorkdayStarted(workday: Workday | undefined) {
	if (workday === undefined) {
		return false;
	}

	const lastEvent = workday.events[workday.events.length - 1];
	if (lastEvent === undefined) {
		return false;
	}

	return lastEvent.type !== "end-workday";
}

function getLastWorkday(data: TrackingData): Workday | undefined {
	return data.workdays[data.workdays.length - 1];
}
