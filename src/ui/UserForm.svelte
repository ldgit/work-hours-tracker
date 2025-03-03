<script lang="ts">
	import { getDatabase } from "../lib/database";
	import Button from "./Button.svelte";

	let { onSubmit } = $props();

	let username = $state("");
	let paidBreakDuration = $state(45);
</script>

<form
	onsubmit={async (e) => {
		e.preventDefault();
		const db = await getDatabase();
		const userId = await db.insertUser({
			username,
			paidBreakDuration,
		});

		const user = await db.getUserById(userId);

		if (user) {
			onSubmit(user);
		}
	}}
>
	<div class="inputRow">
		<label>
			<span>Username</span>
			<input
				bind:value={username}
				placeholder="username"
				required
				type="text"
			/>
		</label>
	</div>
	<div class="inputRow">
		<label>
			<span title="Union mandated!">Daily paid break</span>
			<input
				bind:value={paidBreakDuration}
				type="number"
				placeholder="in minutes"
				required
			/>
		</label>
	</div>
	<div>
		<Button type="submit">Start tracking!</Button>
	</div>
</form>

<style>
	.inputRow {
		margin-bottom: 0.4rem;
	}

	label {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	input {
		padding: 4px;
		margin: 4px;
	}
</style>
