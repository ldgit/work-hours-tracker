<script lang="ts">
	import { getDatabase } from "../lib/database";
	import Button from "./Button.svelte";
	import Input from "./Input.svelte";

	let { onSubmit } = $props();

	let username = $state("");
	let paidBreakDuration = $state(45);
	let workdayLength = $state(8);
</script>

<form
	onsubmit={async (e) => {
		e.preventDefault();
		const db = await getDatabase();
		const userId = await db.insertUser({
			username,
			paidBreakDuration,
			workdayLength,
		});

		const user = await db.getUserById(userId);

		if (user) {
			onSubmit(user);
		}
	}}
>
	<div>
		<label>
			<span>Username</span>
			<Input
				bind:value={username}
				placeholder="username"
				required
				type="text"
				width="10rem"
			/>
		</label>
	</div>
	<div>
		<label>
			<span title="Union mandated!">Daily paid break</span>
			<Input
				bind:value={paidBreakDuration}
				type="number"
				placeholder="in minutes"
				required
				width="10rem"
			/>
		</label>
	</div>
	<div>
		<label>
			<span title="In hours">Workday length</span>
			<Input
				bind:value={workdayLength}
				type="number"
				placeholder="in hours"
				defaultValue="8"
				required
				width="10rem"
			/>
		</label>
	</div>

	<div class="buttonRow">
		<Button type="submit">Start tracking</Button>
	</div>
</form>

<style>
	form {
		width: 100%;
		max-width: 24rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-left: 0.7rem;
		margin-right: 0.7rem;
	}

	label {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.buttonRow {
		margin-top: 0.5rem;
	}
</style>
