<script lang="ts">
	const { tracker } = $props();

	const mapping = {
		"not-working": "Not working",
		working: "Working",
		"on-break": "On break",
	};

	function getStatusClass() {
		if (!tracker.hasWorkdayStarted()) {
			return "not-working";
		}

		return tracker.hasBreakStarted() ? "on-break" : "working";
	}
</script>

<div class="status {getStatusClass()}">{mapping[getStatusClass()]}</div>

<style>
	.status {
		font-size: 1.3rem;
		font-weight: 700;
	}

	.working {
		color: #7fff00;
	}

	.not-working {
		color: #ff0000;
	}

	.on-break {
		color: #ffea00;
	}
</style>
