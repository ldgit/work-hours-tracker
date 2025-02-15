import { differenceInSeconds } from "date-fns";

type EventType = "start-workday" | "end-workday" | "start-break" | "end-break";

export interface WorkdayEvent {
	time: Date;
	type: EventType;
}

export interface Workday {
	paidBreakDuration: number;
	events: WorkdayEvent[];
}

interface TrackingData {
	workdays: Workday[];
}

export interface UserSettings {
	id: string;
	username: string;
	paidBreakDuration: number;
}

export interface TimeWorked {
	hours: number;
	minutes: number;
	seconds: number;
}

interface Tracker {
	startWorkday(): void;
	startBreak(): void;
	endBreak(): void;
	endWorkday(): void;
	hasWorkdayStarted(): boolean;
	hasBreakStarted(): boolean;
	getTrackingData(): TrackingData;
	/**
	 * Gets the time worked for workday in progress or last full workday.
	 */
	getTimeWorked(): TimeWorked;
}

export function createTracker(
	settings: UserSettings,
	data: TrackingData,
): Tracker {
	return {
		startWorkday() {
			if (hasWorkdayStarted(data)) {
				throw new Error(
					"Cannot start workday if current workday has not ended.",
				);
			}

			data.workdays.push({
				paidBreakDuration: settings.paidBreakDuration,
				events: [{ type: "start-workday", time: new Date() }],
			});
		},
		startBreak() {
			if (!hasWorkdayStarted(data)) {
				throw new Error("Workday has not started.");
			}

			const currentWorkday = getLastWorkday(data);

			currentWorkday.events.push({
				time: new Date(),
				type: "start-break",
			});
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
		},
		hasWorkdayStarted() {
			return hasWorkdayStarted(data);
		},
		hasBreakStarted() {
			const currentWorkday = getLastWorkday(data);
			const lastEvent = currentWorkday.events[currentWorkday.events.length - 1];

			return lastEvent.type === "start-break";
		},
		getTrackingData() {
			return data;
		},
		getTimeWorked() {
			const currentWorkday = getLastWorkday(data);
			if (currentWorkday === undefined) {
				return { hours: 0, minutes: 0, seconds: 0 };
			}

			if (currentWorkday.events.length === 1) {
				const currentEvent = currentWorkday.events[0];
				const secondsWorked = differenceInSeconds(
					new Date(),
					currentEvent.time,
				);

				return getTimeWorkedFromSecondsWorked(secondsWorked);
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
					if (
						currentEvent.type === "start-break" &&
						index === events.length - 1
					) {
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
						if (
							currentEvent.type === "end-break" &&
							index === events.length - 1
						) {
							secondsWorkedSoFar += differenceInSeconds(
								new Date(),
								currentEvent.time,
							);
						}

						return secondsWorkedSoFar;
					},
					0,
				) + Math.min(currentWorkday.paidBreakDuration * 60, secondsOnBreak);

			return getTimeWorkedFromSecondsWorked(secondsWorked);
		},
	};
}

function hasWorkdayStarted(data: TrackingData) {
	const lastWorkday = getLastWorkday(data);

	if (lastWorkday === undefined) {
		return false;
	}

	const lastEvent = lastWorkday.events[lastWorkday.events.length - 1];
	if (lastEvent === undefined) {
		return false;
	}

	return lastEvent.type !== "end-workday";
}

function getLastWorkday(data: TrackingData): Workday {
	return data.workdays[data.workdays.length - 1];
}

function getTimeWorkedFromSecondsWorked(secondsWorked: number): TimeWorked {
	const hours = Math.floor(secondsWorked / (60 * 60));
	const minutes = Math.floor((secondsWorked - hours * 60 * 60) / 60);
	const seconds = secondsWorked - hours * 60 * 60 - minutes * 60;

	return { hours: hours, minutes: minutes, seconds: seconds };
}
