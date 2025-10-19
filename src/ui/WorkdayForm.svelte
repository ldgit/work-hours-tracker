<script lang="ts">
	import { createTracker, type User } from "../lib/tracker";
	import Button from "./Button.svelte";
	import ConfirmationModal from "./ConfirmationModal.svelte";
	import Favicon from "./Favicon.svelte";
	import Status from "./Status.svelte";
	import WorkdayEndEstimate from "./WorkdayEndEstimate.svelte";
	import WorkdayEvents from "./WorkdayEvents.svelte";
	import WorkDuration from "./WorkDuration.svelte";

	const { user: userProp, onChange } = $props();
	let user: User = $state(userProp);
	let endWorkdayClicked = $state(false);

	const tracker = createTracker(user);
	tracker.onChange(onChange);

	function startWorkday() {
		tracker.startWorkday();
	}

	function endWorkday() {
		endWorkdayClicked = true;
	}

	function confirmEndWorkday() {
		endWorkdayClicked = false;
		tracker.endWorkday();
	}

	const breakButtonWidth = "5.9rem";
</script>

<svelte:head>
	<Favicon
		iconName={tracker.hasWorkdayStarted()
			? tracker.hasBreakStarted()
				? "on-break.ico"
				: "working.ico"
			: "initial.ico"}
	/>
</svelte:head>

<section class="form">
	<Status {tracker} />

	{#if tracker.hasWorkdayStarted()}
		<div class="basicWorkInfo">
			<WorkDuration timeWorked={tracker.getTimeWorked()} />
			<WorkdayEndEstimate estimate={tracker.calculateWorkEndTime()} />
		</div>
	{/if}

	<div class="controls">
		<Button
			onclick={startWorkday}
			disabled={!tracker.canStartWorkday()}
			--flex-grow="1"
		>
			Start work
		</Button>
		{#if !tracker.hasBreakStarted()}
			<Button
				--flex-grow="1"
				--width={breakButtonWidth}
				onclick={tracker.startBreak}
				disabled={!tracker.hasWorkdayStarted()}
			>
				Start break
			</Button>
		{:else}
			<Button
				--flex-grow="1"
				--width={breakButtonWidth}
				onclick={tracker.endBreak}
				disabled={!tracker.hasWorkdayStarted()}
			>
				End break
			</Button>
		{/if}
		<Button
			--flex-grow="1"
			onclick={endWorkday}
			disabled={!tracker.hasWorkdayStarted() || tracker.hasBreakStarted()}
		>
			End work
		</Button>
	</div>

	<WorkdayEvents events={tracker.getCurrentWorkdayEvents()} />
</section>

{#if endWorkdayClicked}
	<ConfirmationModal
		onConfirm={confirmEndWorkday}
		onCancel={() => {
			endWorkdayClicked = false;
		}}
	>
		{#snippet title()}Are you sure?{/snippet}
		You will not be able to start new workday until the next day.
		{#snippet confirmText()}Yes, I'm done for today{/snippet}
		{#snippet cancelText()}Cancel{/snippet}
	</ConfirmationModal>
{/if}

<style>
	.form {
		width: 100%;
		max-width: 24rem;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.controls {
		width: 100%;
		display: flex;
		gap: 0.8rem;
		justify-content: space-between;
	}

	.basicWorkInfo {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.3rem;
		margin-bottom: 1rem;
	}
</style>
