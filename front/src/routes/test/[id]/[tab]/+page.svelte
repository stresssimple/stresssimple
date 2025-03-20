<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import { activeTest } from '$lib/stores/tests.store';
	import Test from './Test.svelte';
	import Runs from './Runs.svelte';
	import { activeTab } from '$lib/stores/activeTab.store';
	const id = $derived(page.params.id);
	const tab = $derived(page.params.tab);
	$effect(() => activeTab.set(tab));
	$effect(() => {
		activeTest.setActiveById(id);
	});
</script>

<div class="h-full w-full">
	<Tabs tabStyle="underline">
		<TabItem title="Test" open={tab == 'test'} on:click={() => goto(`/test/${id}/test`)}>
			{#if $activeTest}
				<Test />
			{/if}
		</TabItem>
		<TabItem title="Runs" open={tab == 'runs'} on:click={() => goto(`/test/${id}/runs`)}>
			{#if $activeTest}
				<Runs />
			{/if}
		</TabItem>
	</Tabs>
</div>
