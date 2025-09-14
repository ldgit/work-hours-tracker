<script lang="ts">
	const { children, hideOptionsButton, onOptionsClick } = $props();
</script>

<header>
	<h1>{@render children?.()}</h1>
	<div class="options">
		{#if !hideOptionsButton}
			<button title="Options" onclick={onOptionsClick}>
				<!-- https://fonts.google.com/icons?icon.set=Material+Symbols&icon.size=24&icon.color=%23e3e3e3 -->
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 -960 960 960"
					fill="currentColor"
				>
					<path
						d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"
					/>
				</svg>
			</button>
		{/if}
	</div>
</header>

<style>
	header {
		display: flex;
		width: 100%;
		text-align: center;
		color: white;
		margin-bottom: 1.5rem;
		align-items: center;
		padding: 1.4rem;
		padding-top: 0.5rem;
		padding-bottom: 0.5rem;
		background: linear-gradient(
			0deg,
			var(--color-gray-400) 0%,
			var(--color-gray-900) 100%
		);
	}

	h1 {
		font-size: 1.6rem;
		font-weight: 500;
		line-height: 1.6rem;
	}

	.options {
		display: flex;
		margin-left: auto;
	}

	button {
		width: 3rem;
		height: 3rem;
		padding: 0.25rem;
		border-radius: 0.375rem;
		border-style: none;
		background-color: transparent;
	}

	button:hover {
		color: var(--color-gray-700);
		background-color: var(--color-gray-200);
	}
</style>
