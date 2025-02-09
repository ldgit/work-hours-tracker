<script lang="ts">
	const { children, ...rest } = $props();
</script>

<button {...rest}>
	{@render children()}
</button>

<style>
	button {
		margin: 0.4rem;
		padding: 0.4rem;
	}
</style>
