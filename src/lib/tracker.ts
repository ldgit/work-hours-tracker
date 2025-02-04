type EventType = "start-workday" | "end-workday" | "start-break" | "end-break";

interface Workday {
	configuration: Configuration;
	events: { time: Date; type: EventType }[];
}

interface TrackingData {
	user: string;
	workdays: Workday[];
}

interface Configuration {
	paidBreakDuration: number;
}

interface Tracker {
	startWorkday(): void;
	startBreak(): void;
	endBreak(): void;
	endWorkday(): void;
}

export function createTracker(
	config: Configuration,
	data: TrackingData,
): Tracker {
	return {
		startWorkday(): void {},
		startBreak(): void {},
		endBreak(): void {},
		endWorkday(): void {},
	};
}
