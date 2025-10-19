<script lang="ts">
	import type { User } from "../lib/tracker";
	import Button from "./Button.svelte";
	import Input from "./Input.svelte";

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
		<Input
			bind:value={paidBreakDuration}
			placeholder="Daily paid break"
			required
			type="number"
			width="10rem"
		/>
	</label>
	<label>
		<span>Workday length</span>
		<Input
			bind:value={workdayLength}
			placeholder="Workday length"
			required
			type="number"
			step="any"
			width="10rem"
		/>
	</label>
	<Button type="submit">Save</Button>
	<Button onclick={() => onCancel()}>Cancel</Button>
</form>

<style>
	form {
		/* Size and centering */
		position: fixed;
		right: 1rem;
		top: 5.2rem;
		width: 16rem;
		height: 16rem;
		max-width: 100vw;
		max-height: 100dvh;
		margin: auto;

		border-radius: 8px;
		padding: 0.8rem;
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
		background-color: var(--color-gray-800);
		box-shadow: 1px 1px 5px var(--color-gray-950);
	}
</style>
