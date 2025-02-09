<script lang="ts">
	import { getDatabase } from "./lib/database";
	import UserForm from "./ui/UserForm.svelte";

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
			<UserForm />
		{/if}
	{/await}
</main>
