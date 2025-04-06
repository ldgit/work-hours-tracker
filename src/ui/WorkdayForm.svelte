<script lang="ts">
	import { createTracker, type User } from "../lib/tracker";
	import Button from "./Button.svelte";
	import ConfirmationModal from "./ConfirmationModal.svelte";
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
</script>

{#if tracker.hasWorkdayStarted()}
	<WorkDuration timeWorked={tracker.getTimeWorked()} />
{/if}

<Button onclick={startWorkday} disabled={!tracker.canStartWorkday()}>
	Start Workday
</Button>
{#if !tracker.hasBreakStarted()}
	<Button onclick={tracker.startBreak} disabled={!tracker.hasWorkdayStarted()}>
		Start break
	</Button>
{:else}
	<Button onclick={tracker.endBreak} disabled={!tracker.hasWorkdayStarted()}>
		End break
	</Button>
{/if}
<Button
	onclick={endWorkday}
	disabled={!tracker.hasWorkdayStarted() || tracker.hasBreakStarted()}
>
	End workday
</Button>

<WorkdayEvents events={tracker.getCurrentWorkdayEvents()} />

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
