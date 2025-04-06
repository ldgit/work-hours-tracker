import { differenceInSeconds } from "date-fns";
import { getTimeWorkedFromSecondsWorked } from "./getTimeWorkedFromSeconds";
import type { Duration, WorkdayEvent } from "./tracker";

type EventType = "break" | "break-ongoing" | "start-workday" | "end-workday";

export interface Event {
	type: EventType;
	start: Date;
	end?: Date;
	/** Duration of the event, null for 'start-work' event. */
	duration: Duration | null;
}

export function groupWorkdayEvents(events: WorkdayEvent[]): Event[] {
	return events.reduce(
		(groupedEvents, { type, time }, index, fullEventList) => {
			if (type === "start-workday") {
				groupedEvents = [
					...groupedEvents,
					{ type, duration: null, start: time },
				];
			}

			if (type === "start-break" && index === fullEventList.length - 1) {
				const duration = getTimeWorkedFromSecondsWorked(
					differenceInSeconds(new Date(), time),
				);
				groupedEvents = [
					...groupedEvents,
					{ type: "break-ongoing", duration, start: time, end: new Date() },
				];
			}

			if (type === "end-break") {
				const startBreakEvent = fullEventList[index - 1];
				const duration = getTimeWorkedFromSecondsWorked(
					differenceInSeconds(time, startBreakEvent.time),
				);
				groupedEvents = [
					...groupedEvents,
					{ type: "break", duration, start: startBreakEvent.time, end: time },
				];
			}

			if (type === "end-workday") {
				const startWorkdayEvent = fullEventList[0];
				const duration = getTimeWorkedFromSecondsWorked(
					differenceInSeconds(time, startWorkdayEvent.time),
				);
				groupedEvents = [
					...groupedEvents,
					{ type: "end-workday", duration, start: time },
				];
			}

			return groupedEvents;
		},
		[] as Event[],
	);
}
