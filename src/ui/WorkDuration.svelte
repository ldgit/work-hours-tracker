<script lang="ts">
	import { leftPadNumber } from "../lib/leftPadNumber";
	import type { Duration } from "../lib/tracker";

	const { timeWorked }: { timeWorked: Duration } = $props();
</script>

<div>
	<span>{leftPadNumber(timeWorked.hours)}</span>
	hr
	<span>{leftPadNumber(timeWorked.minutes)}</span>
	min
	<span>{leftPadNumber(timeWorked.seconds)}</span>
	sec
</div>

<style>
	div {
		font-size: 0.8rem;
		font-weight: 500;
		text-transform: lowercase;
	}
	span {
		font-size: 1.1rem;
		font-weight: 600;
	}
</style>
