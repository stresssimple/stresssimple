<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { runStore } from '$lib/stores/run.store';
	import { TabItem, Tabs } from 'flowbite-svelte';
	import General from './General.svelte';
	import Logs from './Logs.svelte';
	import Audit from './Audit.svelte';

	onMount(async () => {
		runStore.clear();
		await runStore.load(page.params.runId);
	});
	$inspect($runStore);
</script>

<Tabs class="m-2">
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
