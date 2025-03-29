<script lang="ts">
	import { page } from '$app/state';
	import { runsStore } from '$lib';
	import {
		Button,
		ButtonGroup,
		Input,
		Label,
		Modal,
		Radio,
		RadioButton,
		Range
	} from 'flowbite-svelte';
	let { open = $bindable() } = $props();

	const percentNames = [
		{ value: 1, name: '100%' },
		{ value: 0.5, name: '50%' },
		{ value: 0.1, name: '10%' },
		{ value: 0.01, name: '1%' },
		{ value: 0.001, name: '0.1%' },
		{ value: 0.0001, name: '0.01%' }
	] as { value: number; name: string }[];

	let duration = $state(10);
	let users = $state(1);
	let rampUp = $state(0);
	let processes = $state(1);
	let auditErrors = $state('all');
	let auditErrorsPercent = $state(1);
	let auditErrorsPercentValue = $state(4);
	let auditErrorsPercentName = $state('');

	$effect(() => {
		auditErrorsPercent = percentNames[auditErrorsPercentValue].value;
		auditErrorsPercentName = percentNames[auditErrorsPercentValue].name;
	});

	let auditSuccess = $state('some');
	let auditSuccessPercent = $state(1);
	let auditSuccessPercentValue = $state(1);
	let auditSuccessPercentName = $state('');

	$effect(() => {
		auditSuccessPercent = percentNames[auditSuccessPercentValue].value;
		auditSuccessPercentName = percentNames[auditSuccessPercentValue].name;
	});

	async function run() {
		await runsStore.start(
			page.params.id,
			duration / 60,
			users,
			rampUp / 60,
			processes,
			auditErrors,
			auditErrorsPercent,
			auditSuccess,
			auditSuccessPercent
		);
		open = false;
	}

	function adjustUsers(value: number): void {
		if (users + value < 1) {
			users = 1;
		} else if (users + value > 9999) {
			users = 9999;
		} else {
			users += value;
		}
	}
</script>

<Modal {open} title="Schedule run" on:close={() => (open = false)}>
	<div class="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
		<div>
			<Label>Duration</Label>
			<div>
				<Range min="10" max="3600" step="10" bind:value={duration} />
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
				<Range min="1" max="9999" step="1" bind:value={users} />
				<div class="flex flex-row items-center justify-between">
					<span class="mr-4">{users}</span>
					<ButtonGroup class="" size="xs">
						<Button class="" size="xs" on:click={() => adjustUsers(-100)}>-100</Button>
						<Button class="" size="xs" on:click={() => adjustUsers(-10)}>-10</Button>
						<Button class="" size="xs" on:click={() => adjustUsers(-1)}>-1</Button>
						<Button class="" size="xs" on:click={() => adjustUsers(1)}>+1</Button>
						<Button class="" size="xs" on:click={() => adjustUsers(10)}>+10</Button>
						<Button class="" size="xs" on:click={() => adjustUsers(100)}>+100</Button>
					</ButtonGroup>
				</div>
			</div>
		</div>
		<div>
			<Label>Processes</Label>
			<div>
				<Range min="1" max="50" step="1" bind:value={processes} />
				<span>{processes}</span>
			</div>
		</div>
		<h2 class="col-span-2 text-xl">Auditing</h2>
		<div class="">
			<h3 class="m-4 text-lg">Errors</h3>
			<div class="flex flex-col gap-2">
				<Radio name="audit-errors" value={'none'} bind:group={auditErrors}>None</Radio>
				<Radio name="audit-errors" value={'all'} bind:group={auditErrors}>All</Radio>
				<Radio name="audit-errors" value={'some'} bind:group={auditErrors}>
					<span>Some</span>
					{#if auditErrors === 'some'}
						<Range
							min="0"
							max={percentNames.length - 1}
							step="1"
							bind:value={auditErrorsPercentValue}
							class="m-2"
						/>
						<span>{auditErrorsPercentName}</span>
					{/if}
				</Radio>
			</div>
		</div>
		<div>
			<h3 class="m-4 text-lg">Success</h3>
			<div class="flex flex-col gap-2">
				<Radio name="audit-success" value={'none'} bind:group={auditSuccess}>None</Radio>
				<Radio name="audit-success" value={'all'} bind:group={auditSuccess}>All</Radio>
				<Radio name="audit-success" value={'some'} bind:group={auditSuccess}>
					<span>Some</span>
					{#if auditSuccess === 'some'}
						<Range
							min="0"
							max={percentNames.length - 1}
							step="1"
							bind:value={auditSuccessPercentValue}
							class="m-2"
						/>
						<span>{auditSuccessPercentName}</span>
					{/if}
				</Radio>
			</div>
		</div>
	</div>

	<div class="col-span-2 w-full" slot="footer">
		<div class="flex w-full flex-row justify-end">
			<Button on:click={run}>Run</Button>
		</div>
	</div>
</Modal>
