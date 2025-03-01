<script lang="ts">
	import { createTracker } from "../lib/tracker";
	import Button from "./Button.svelte";

	const { user } = $props();
	const tracker = $state(createTracker(user));

	function startWorkday() {
		tracker.startWorkday();
	}
</script>

<Button onclick={startWorkday} disabled={tracker.hasWorkdayStarted()}>
	Start Workday
</Button>
<Button disabled={!tracker.hasWorkdayStarted()}>Start break</Button>
<Button disabled={!tracker.hasWorkdayStarted()}>End workday</Button>
