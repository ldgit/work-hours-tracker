<script lang="ts">
	import UserForm from "./ui/UserForm.svelte";
	import { type User } from "./lib/tracker";
	import WorkdayForm from "./ui/WorkdayForm.svelte";

	let user: User | null = $state(null);

	function setSelectedUser(selectedUser: User) {
		user = selectedUser;
	}
</script>

<main>
	<h1>Welcome {user ? user.settings.username : "to Work Hours Tracker"}</h1>

	{#if !user}
		<UserForm onSubmit={setSelectedUser} />
	{:else}
		<WorkdayForm {user} />
	{/if}
</main>
