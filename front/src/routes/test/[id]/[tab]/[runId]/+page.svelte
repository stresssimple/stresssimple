<script lang="ts">
	import { onMount } from 'svelte';
	import axios from 'axios';
	import { page } from '$app/state';
	import { runStore } from '$lib/stores/run.store';
	import { TabItem, Tabs } from 'flowbite-svelte';
	import General from './General.svelte';
	import { runsStore, toHumanDate, toHumanTime } from '$lib';
	import Logs from './Logs.svelte';
	import Audit from './Audit.svelte';

	onMount(async () => {
		runStore.clear();
		await runStore.load(page.params.runId);
	});
	let runtimeMilliseconds = $derived(() => {
		if (!$runStore) {
			return undefined;
		}
		const end = $runStore.endTime ?? $runStore.lastUpdated;
		return end.getTime() - $runStore.startTime.getTime();
	});
	$inspect($runStore);
</script>

{#if $runStore && $runStore.id === page.params.runId}
	<div class="flex flex-col items-center">
		<h1 class="text-3xl">Test run</h1>
		<pre>{$runStore.runId}</pre>
		<h2 class="text-xl">
			Started {toHumanDate($runStore.startTime)}, run for {toHumanTime(runtimeMilliseconds())}, and
			now is {$runStore.status}.
		</h2>
	</div>
{/if}
<Tabs>
	<TabItem title="Overview" open>
		<General />
	</TabItem>
	<TabItem title="Logs">
		<Logs />
	</TabItem>
	<TabItem title="Audit">
		<Audit />
	</TabItem>
</Tabs>
