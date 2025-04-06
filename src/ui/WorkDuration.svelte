<script lang="ts">
	import type { Duration } from "../lib/tracker";

	const { timeWorked }: { timeWorked: Duration } = $props();
</script>

<div>
	Work duration: {timeWorked.hours} hours, {timeWorked.minutes} minutes, {timeWorked.seconds}
	seconds
</div>

<style>
	div {
		padding: 1rem;
		padding-top: 0rem;
	}
</style>
