<script lang="ts">
	import type { HTMLButtonAttributes } from "svelte/elements";

	let { children, ...rest }: HTMLButtonAttributes = $props();
</script>

<button {...rest}>
	{@render children?.()}
</button>

<style>
	button {
		padding: 0.6rem;
		width: var(--width, auto);
		border-style: none;
		border-radius: 0.5rem;
		flex-grow: var(--flex-grow);
	}

	button:hover {
		background-color: var(--color-gray-600);
	}

	button:active {
		background-color: var(--color-gray-400);
	}
</style>
