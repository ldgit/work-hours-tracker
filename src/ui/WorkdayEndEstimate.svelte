<script>
	import { formatDate } from "date-fns";

	const { estimate } = $props();
</script>

<div>
	Estimated work end: {formatDate(estimate, "HH:mm:ss")}
</div>

<style>
	div {
		color: var(--color-gray-500);
		line-height: 1.1rem;
	}
</style>
