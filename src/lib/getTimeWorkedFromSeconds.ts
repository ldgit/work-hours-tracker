import type { Duration } from "./tracker";

export function getTimeWorkedFromSecondsWorked(
	secondsWorked: number,
): Duration {
	const hours = Math.floor(secondsWorked / (60 * 60));
	const minutes = Math.floor((secondsWorked - hours * 60 * 60) / 60);
	const seconds = secondsWorked - hours * 60 * 60 - minutes * 60;

	return { hours: hours, minutes: minutes, seconds: seconds };
}
