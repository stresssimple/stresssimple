<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import { page } from '$app/state';
	import { runsStore } from '$lib/stores/runs.store';
	import { fade } from 'svelte/transition';

	import { onDestroy, onMount } from 'svelte';
	import { activeTest, toHumanDate, toHumanTime } from '$lib';
	import {
		Label,
		Select,
		Button,
		Table,
		TableHead,
		TableHeadCell,
		TableBody,
		TableBodyRow,
		TableBodyCell,
		Range,
		ButtonGroup
	} from 'flowbite-svelte';
	let duration = $state(10);
	let users = $state(1);
	let rampUp = $state(0);

	let timerInterval: number;

	async function run() {
		await runsStore.start(page.params.id, duration / 60, users, rampUp / 60);
	}

	afterNavigate(() => {
		runsStore.clear();
	});

	onMount(() => {
		runsStore.load(page.params.id);
		timerInterval = setInterval(() => {
			runsStore.load(page.params.id);
		}, 1000);
	});

	onDestroy(() => {
		clearInterval(timerInterval);
	});

	async function StopRun(e: Event, runId: string): Promise<void> {
		e.stopPropagation();
		await runsStore.stop(runId);
		await runsStore.load(page.params.id);
	}

	async function DeleteRun(e: Event, runId: string): Promise<void> {
		e.stopPropagation();
		await runsStore.delete(runId);
		await runsStore.load(page.params.id);
	}
</script>

<div class="flex h-full w-full flex-col">
	<div class="flex w-full flex-row justify-between">
		<div class="text-2xl">{$activeTest.name}</div>
		<ButtonGroup>
			<Button class="w-24" on:click={run}>Run</Button>
		</ButtonGroup>
	</div>
</div>
<div class="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
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
</div>

{#if $runsStore.length > 0}
	<div transition:fade>
		<Table hoverable={true} class="mt-6" noborder={true}>
			<TableHead>
				<TableHeadCell>Users</TableHeadCell>
				<TableHeadCell>Duration</TableHeadCell>
				<TableHeadCell>Ramp up</TableHeadCell>
				<TableHeadCell>Start time</TableHeadCell>
				<TableHeadCell>Run time</TableHeadCell>
				<TableHeadCell>Status</TableHeadCell>
				<TableHeadCell>Last updated</TableHeadCell>
				<TableHeadCell></TableHeadCell>
			</TableHead>
			<TableBody>
				{#each $runsStore as run}
					<TableBodyRow on:click={() => goto('runs/' + run.id)} class="cursor-pointer">
						<TableBodyCell>{run.numberOfUsers}</TableBodyCell>
						<TableBodyCell
							>{Math.floor((run.durationMinutes * 60) / 60)}min {Math.round(
								(run.durationMinutes * 60) % 60
							)}sec</TableBodyCell
						>
						<TableBodyCell>
							{#if run.rampUpMinutes == 0}
								-
							{:else}
								{Math.floor((run.rampUpMinutes * 60) / 60)}min {Math.round(
									(run.rampUpMinutes * 60) % 60
								)}sec
							{/if}
						</TableBodyCell>
						<TableBodyCell>{toHumanDate(run.startTime)}</TableBodyCell>
						<TableBodyCell
							>{toHumanTime(run.lastUpdated.getTime() - run.startTime.getTime())}</TableBodyCell
						>
						<TableBodyCell>{run.status}</TableBodyCell>
						<TableBodyCell>{toHumanDate(run.lastUpdated)}</TableBodyCell>
						<TableBodyCell>
							{#if run.status === 'running' || run.status === 'created'}
								<Button class="h-6 w-6" size="xs" color="none" on:click={(e) => StopRun(e, run.id)}
									>🚫</Button
								>
							{:else}
								<Button class="h-6 w-6" size="xs" color="red" on:click={(e) => DeleteRun(e, run.id)}
									>✕</Button
								>
							{/if}
						</TableBodyCell>
					</TableBodyRow>
				{/each}
			</TableBody>
		</Table>
	</div>
{/if}

<style lang="postcss">
	@reference 'tailwindcss';
</style>
