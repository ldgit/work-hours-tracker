type EventType = "start-workday" | "end-workday" | "start-break" | "end-break";

interface Workday {
	id: string;
	paidBreakDuration: number;
	date: Date;
	events: { time: Date; type: EventType }[];
}

interface TrackingData {
	workdays: Workday[];
}

export interface UserSettings {
	id: string;
	username: string;
	paidBreakDuration: number;
}

interface Tracker {
	startWorkday(): void;
	startBreak(): void;
	endBreak(): void;
	endWorkday(): void;
}

export function createTracker(
	settings: UserSettings,
	data: TrackingData,
): Tracker {
	return {
		startWorkday(): void {},
		startBreak(): void {},
		endBreak(): void {},
		endWorkday(): void {},
	};
}
