<script lang="ts">
	import { formatDate } from "date-fns";
	import { groupWorkdayEvents } from "../lib/groupWorkdayEvents";
	import type { WorkdayEvent } from "../lib/tracker";

	const { events }: { events: WorkdayEvent[] } = $props();
	const groupedEvents = $derived(groupWorkdayEvents(events));
</script>

<ol>
	{#each groupedEvents as { start, end, type, duration } (start)}
		<li>
			<span class="time">
				{formatDate(start, "HH:mm:ss")}
				{#if end}
					<br />
					{formatDate(end, "HH:mm:ss")}
				{/if}
			</span>
			<span class="eventType">
				{#if type === "start-workday"}
					Workday Started
				{:else if type === "break-ongoing"}
					Break started
				{:else if type === "break"}
					Break
				{:else if type === "end-workday"}
					Workday Ended
				{/if}
			</span>

			<div class="duration">
				{#if duration}
					<span>
						Duration {duration.hours}:{duration.minutes}:{duration.seconds}
					</span>
				{/if}
			</div>
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
		gap: 0.5rem;
		border-bottom: 1px solid #767676;
	}

	.time {
		width: 75px;
	}

	.eventType {
		display: flex;
		align-items: center; /* Align vertical */
		flex-grow: 2;
		text-align: left;
	}

	.duration {
		display: flex;
		align-items: center; /* Align vertical */
		width: 135px;
		text-align: left;
	}
</style>
