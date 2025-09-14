<script lang="ts">
	import type { User } from "../lib/tracker";

	interface UpdatedOptions {
		paidBreakDuration?: number;
		workdayLength?: number;
	}

	const {
		user,
		onSubmit,
		onCancel,
	}: {
		user: User | null;
		onSubmit(options: UpdatedOptions): void;
		onCancel(): void;
	} = $props();

	let paidBreakDuration = $state(user?.settings.paidBreakDuration);
	let workdayLength = $state(user?.settings.workdayLength);
</script>

<form
	onsubmit={async (e) => {
		e.preventDefault();
		onSubmit({ paidBreakDuration, workdayLength });
	}}
>
	<label>
		<span>Daily paid break</span>
		<input
			bind:value={paidBreakDuration}
			placeholder="Daily paid break"
			required
			type="text"
		/>
	</label>
	<label>
		<span>Workday length</span>
		<input
			bind:value={workdayLength}
			placeholder="Workday length"
			required
			type="text"
		/>
	</label>
	<button type="submit">Save</button>
	<button onclick={() => onCancel()}>Cancel</button>
</form>
