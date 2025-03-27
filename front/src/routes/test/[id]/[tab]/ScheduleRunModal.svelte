<script lang="ts">
	import { page } from '$app/state';
	import { runsStore } from '$lib';
	import { Button, Label, Modal, Range } from 'flowbite-svelte';
	let { open = $bindable() } = $props();

	let duration = $state(10);
	let users = $state(1);
	let rampUp = $state(0);
	let processes = $state(1);
	async function run() {
		await runsStore.start(page.params.id, duration / 60, users, rampUp / 60, processes);
		open = false;
	}
</script>

<Modal {open} title="Schedule run" on:close={() => (open = false)}>
	<div class="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
		<div>
			<Label>Duration</Label>
			<div>
				<Range min="10" max="600" step="10" bind:value={duration} />
				<span>{Math.floor(duration / 60)} min {Math.round(duration % 60)} sec</span>
			</div>
		</div>
		<div>
			<Label>Ramp up</Label>
			<div>
				<Range min="0" bind:max={duration} step="10" bind:value={rampUp} />
				<span>{Math.floor(rampUp / 60)} min {Math.round(rampUp % 60)} sec</span>
			</div>
		</div>
		<div>
			<Label>Users</Label>
			<div>
				<Range min="1" max="100" step="1" bind:value={users} />
				<span>{users}</span>
			</div>
		</div>
		<div>
			<Label>Processes</Label>
			<div>
				<Range min="1" max="10" step="1" bind:value={processes} />
				<span>{processes}</span>
			</div>
		</div>
		<div class="col-span-2 flex justify-end">
			<Button on:click={run}>Run</Button>
		</div>
	</div></Modal
>
