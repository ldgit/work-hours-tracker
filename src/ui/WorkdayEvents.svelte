<script lang="ts">
	import { formatDate } from "date-fns";
	import { groupWorkdayEvents } from "../lib/groupWorkdayEvents";
	import type { WorkdayEvent } from "../lib/tracker";

	const { events }: { events: WorkdayEvent[] } = $props();
	const groupedEvents = $derived(groupWorkdayEvents(events));
</script>

<ol>
	{#each groupedEvents as { start, type, duration }}
		<li>
			<span class="time">{formatDate(start, "HH:mm:ss")}</span>
			<span class="eventType">
				{#if type === "start-workday"}
					Workday Started
				{:else if type === "break-ongoing"}
					On Break
				{:else if type === "break"}
					Break
				{:else if type === "end-workday"}
					Workday Ended
				{/if}
			</span>

			<span class="duration">
				{#if duration}
					Duration {duration.hours}:{duration.minutes}:{duration.seconds}
				{/if}
			</span>
		</li>
	{/each}
</ol>

<style>
	ol {
		list-style-type: none;
		background-color: #474747;
		padding: 0.6rem;
		height: 300px;
		overflow: scroll;
		border-radius: 8px;
		box-shadow: 1px 1px 5px #000000 inset;
	}

	li {
		width: 100%;
		display: flex;
		justify-content: flex-start;
		gap: 1rem;
	}

	.time {
		width: 75px;
	}

	.eventType {
		flex-grow: 2;
		text-align: left;
	}

	.duration {
		width: 135px;
		text-align: left;
	}
</style>
