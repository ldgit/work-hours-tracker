<script lang="ts">
	import { onMount } from "svelte";
	import { getDatabase } from "./lib/database";
	import UserForm from "./ui/UserForm.svelte";

	let showUserForm = $state(false);

	onMount(async () => {
		const db = await getDatabase();
		showUserForm = (await db.getUserCount()) === 0;
	});
</script>

<main>
	<h1>Welcome to Work Hours Tracker</h1>

	{#if showUserForm}
		<UserForm />
	{/if}
</main>
