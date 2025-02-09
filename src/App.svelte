<script lang="ts">
	import { getDatabase } from "./lib/database";
	import Button from "./ui/Button.svelte";

	let username = $state("");
	let paidBreakDuration = $state(45);
	async function getUserCount() {
		const db = await getDatabase();
		const userCount = await db.getUserCount();

		return userCount;
	}
</script>

<main>
	<h1>Welcome to Work Hours Tracker</h1>

	{#await getUserCount() then userCount}
		{#if userCount === 0}
			<form
				onsubmit={async (e) => {
					(await getDatabase()).insertUser({
						username,
						paidBreakDuration,
					});
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
		{/if}
	{/await}
</main>

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
