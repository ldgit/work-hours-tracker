<script lang="ts">
	let { width, value = $bindable(), ...rest } = $props();
</script>

<input {...rest} style="--input-width: {width}" bind:value />

<style>
	input {
		border-radius: 4px;
		padding: 6px;
		border: 1px var(--color-gray-600) solid;
		width: var(--input-width);
	}
</style>
