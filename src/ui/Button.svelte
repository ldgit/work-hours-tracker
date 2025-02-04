<script lang="ts">
	const { children, ...rest } = $props();
</script>

<button {...rest}>
	{@render children()}
</button>
