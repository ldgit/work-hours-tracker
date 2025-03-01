<script lang="ts">
	import type { HTMLButtonAttributes } from "svelte/elements";

	let { children, ...rest }: HTMLButtonAttributes = $props();
</script>

<button {...rest}>
	{@render children?.()}
</button>

<style>
	button {
		margin: 0.4rem;
		padding: 0.4rem;
	}
</style>
