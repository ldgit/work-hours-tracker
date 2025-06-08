<script lang="ts">
	const { iconName }: { iconName: string } = $props();
</script>

<link
	data-testid="favicon"
	rel="icon"
	href="{import.meta.env.BASE_URL}favicon/{iconName}"
/>
