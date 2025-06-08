<script lang="ts">
	import { onMount } from "svelte";
	import UserForm from "./ui/UserForm.svelte";
	import { type User } from "./lib/tracker";
	import WorkdayForm from "./ui/WorkdayForm.svelte";
	import { getDatabase } from "./lib/database";

	let user: User | null = $state(null);

	function setSelectedUser(selectedUser: User) {
		user = selectedUser;
	}

	onMount(async () => {
		const db = await getDatabase();
		const users = await db.getAllUsers();

		/**
		 * If there is more than one user in the database, just take the first one
		 * because the app currently only supports one user.
		 */
		if (users.length > 0) {
			user = users[0];
		}
	});

	async function updateDatabase(userToUpdate: User) {
		const db = await getDatabase();
		db.updateUser($state.snapshot(userToUpdate));
	}
</script>

<svelte:head>
	{#if !user}
		<link
			data-testid="favicon"
			rel="icon"
			href="{import.meta.env.BASE_URL}favicon/initial.ico"
		/>
	{/if}
</svelte:head>

<main>
	<h1>Welcome {user ? user.settings.username : "to Work Hours Tracker"}</h1>

	{#if !user}
		<UserForm onSubmit={setSelectedUser} />
	{:else}
		<WorkdayForm user={$state.snapshot(user)} onChange={updateDatabase} />
	{/if}
</main>
