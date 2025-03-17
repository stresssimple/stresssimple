<script lang="ts">
	import { PUBLIC_API_URL } from '$env/static/public';

	import { afterNavigate, goto } from '$app/navigation';
	import { page } from '$app/state';
	import { runsStore } from '$lib/stores/runs.store';
	import axios from 'axios';

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
	import { StopOutline, DeleteRowOutline, GlobeOutline } from 'flowbite-svelte-icons';
	let duration = $state(0.5);
	let users = $state(1);
	let rampUp = $state(0);
	let auditType = $state('');
	let auditPercentage = $state(0);

	let timerInterval: number;

	async function run() {
		console.log({ duration, users, rampUp });
		await axios.post(`${PUBLIC_API_URL}/runs`, {
			durationMinutes: duration,
			users,
			rampUpMinutes: rampUp,
			testId: page.params.id,
			auditType,
			auditPercentage
		});
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
		await axios.post(`${PUBLIC_API_URL}/runs/` + page.params.id + '/' + runId + '/stop');
	}

	async function DeleteRun(e: Event, runId: string): Promise<void> {
		e.stopPropagation();
		await axios.delete(`${PUBLIC_API_URL}/runs/` + page.params.id + '/' + runId);
		runsStore.load(page.params.id);
	}
</script>

<div class="flex h-full w-full flex-col">
	<div class="flex w-full flex-row justify-between">
		<div class="text-2xl">{$activeTest.name}</div>
		<ButtonGroup>
			<Button on:click={run}>Run</Button>
		</ButtonGroup>
	</div>
</div>
<div class="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
	<div>
		<Label>Duration</Label>
		<div>
			<Range min="0.5" max="30" step="0.5" bind:value={duration} />
			<span>{duration} minutes</span>
		</div>
	</div>
	<div>
		<Label>Ramp up</Label>
		<div>
			<Range min="0" bind:max={duration} step="0.5" bind:value={rampUp} />
			<span>{rampUp} minutes</span>
		</div>
	</div>
	<div>
		<Label>Users</Label>
		<div>
			<Range min="1" max="100" step="1" bind:value={users} />
			<span>{users}</span>
		</div>
	</div>
	<!-- <div>
		<Label>Audit type</Label>
		<div>
			<Select bind:value={auditType}>
				<option value="">None</option>
				<option value="SomeErrors">Some errors</option>
				<option value="AllErrors">All errors</option>
				<option value="AllErrorAndSomeRequests">All errors and some requests</option>
				<option value="SomeRequests">Some requests</option>
				<option value="AllRequests">All requests</option>
			</Select>
		</div>
	</div>
	{#if auditType && (auditType === 'SomeErrors' || auditType === 'SomeRequests')}
		<div>
			<Label>Audit percentage</Label>
			<div>
				<Range min="0" max="100" step="1" bind:value={auditPercentage} />
				<span>{auditPercentage}%</span>
			</div>
		</div>
	{/if} -->
</div>

<div>
	<Table shadow border={3} frame={true} hoverable={true} class="mt-6">
		<TableHead>
			<TableHeadCell>Users</TableHeadCell>
			<TableHeadCell>Duration</TableHeadCell>
			<TableHeadCell>Ramp up</TableHeadCell>
			<TableHeadCell>Start time</TableHeadCell>
			<TableHeadCell>Run time</TableHeadCell>
			<TableHeadCell>Status</TableHeadCell>
			<TableHeadCell>Last updated</TableHeadCell>
			<TableHeadCell>Error</TableHeadCell>
			<TableHeadCell></TableHeadCell>
		</TableHead>
		<TableBody>
			{#each $runsStore as run}
				<TableBodyRow on:click={() => goto('runs/' + run.runId)} class="cursor-pointer">
					<TableBodyCell>{run.users}</TableBodyCell>
					<TableBodyCell>{run.durationMinutes}min</TableBodyCell>
					<TableBodyCell>{run.rampUpMinutes == 0 ? '-' : run.rampUpMinutes + 'min'}</TableBodyCell>
					<TableBodyCell>{toHumanDate(run.startTime)}</TableBodyCell>
					<TableBodyCell
						>{toHumanTime(run.lastUpdated.getTime() - run.startTime.getTime())}</TableBodyCell
					>
					<TableBodyCell>{run.status}</TableBodyCell>
					<TableBodyCell>{toHumanDate(run.lastUpdated)}</TableBodyCell>
					<TableBodyCell>{run.error}</TableBodyCell>
					<TableBodyCell>
						{#if run.status === 'running'}
							<Button size="xs" color="yellow" on:click={(e) => StopRun(e, run.runId)}>
								<StopOutline size="xs" />
							</Button>
						{:else}
							<Button size="xs" color="red" on:click={(e) => DeleteRun(e, run.runId)}>
								<DeleteRowOutline size="xs" />
							</Button>
						{/if}
					</TableBodyCell>
				</TableBodyRow>
			{/each}
		</TableBody>
	</Table>
</div>

<style lang="postcss">
	@reference 'tailwindcss';
</style>
