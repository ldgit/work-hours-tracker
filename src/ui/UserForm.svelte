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
	<div>
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
	<div>
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

	input {
		width: 10rem;
		padding: 4px;
	}

	.buttonRow {
		margin-top: 0.5rem;
	}
</style>
