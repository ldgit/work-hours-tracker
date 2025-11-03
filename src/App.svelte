<script lang="ts">
	import { onMount } from "svelte";
	import UserForm from "./ui/UserForm.svelte";
	import { createTracker, type User } from "./lib/tracker";
	import WorkdayForm from "./ui/WorkdayForm.svelte";
	import { getDatabase } from "./lib/database";
	import Favicon from "./ui/Favicon.svelte";
	import Header from "./ui/Header.svelte";
	import OptionsForm from "./ui/OptionsForm.svelte";

	let user: User | null = $state(null);
	let showOptionsMenu: boolean = $state(false);

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
		<Favicon iconName="initial.ico" />
	{/if}
</svelte:head>

<Header
	hideOptionsButton={!user}
	onOptionsClick={() => {
		showOptionsMenu = !showOptionsMenu;
	}}
>
	{user ? user.settings.username : "Work Hours Tracker"}
</Header>

<main>
	{#if !user}
		<UserForm onSubmit={setSelectedUser} />
	{:else}
		<WorkdayForm {user} onChange={updateDatabase} />
	{/if}

	{#if showOptionsMenu}
		<OptionsForm
			onSubmit={async ({ paidBreakDuration, workdayLength }) => {
				showOptionsMenu = !showOptionsMenu;
				const tracker = createTracker(user!);
				if (paidBreakDuration) {
					tracker.changePaidBreakDuration(paidBreakDuration);
				}

				if (workdayLength) {
					tracker.changeWorkdayLength(workdayLength);
				}

				await updateDatabase(user!);
			}}
			onCancel={() => (showOptionsMenu = false)}
			{user}
		/>
	{/if}
</main>
