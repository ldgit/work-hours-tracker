<script>
	import Button from "./Button.svelte";

	let { children, title, confirmText, cancelText, onConfirm, onCancel } =
		$props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div class="modal" onclick={onCancel} role="alertdialog">
	<div class="modalContent">
		<h2>{@render title()}</h2>
		<p>{@render children()}</p>
		<Button onclick={onConfirm}>{@render confirmText()}</Button>
		<Button onclick={onCancel}>{@render cancelText()}</Button>
	</div>
</div>

<style>
	h2 {
		margin-top: 0.2rem;
	}

	.modal {
		position: fixed;
		background-color: rgba(0, 0, 0, 0.4);
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	.modalContent {
		margin: 15% auto;
		background-color: #242424;
		opacity: 1;
		padding: 1rem;
		max-width: 600px;
		border-radius: 4px;
		box-shadow:
			0px 11px 15px -7px rgba(0, 0, 0, 0.2),
			0px 24px 38px 3px rgba(0, 0, 0, 0.14),
			0px 9px 46px 8px rgba(0, 0, 0, 0.12);
	}
</style>
