<script lang="ts">
	import { page } from '$app/state';
	import { toHumanDate } from '$lib';
	import axios from 'axios';
	import { onDestroy, onMount } from 'svelte';
	import { PUBLIC_API_URL } from '$env/static/public';

	let rows: any[] = $state<any[]>([]);
	let total: number = $state<number>(0);
	let interval: number;

	async function getLogs() {
		axios
			.get(`${PUBLIC_API_URL}/audit/${page.params.runId}/logs`)
			.then((res) => res.data)
			.then((data) => {
				total = data.total;
				rows = data.logs
					.map((line: any) => {
						try {
							line.timestamp = new Date(Number(line.timestamp));
							return line;
						} catch (e) {
							console.error('failed to parse >' + line + '<');
							return null;
						}
					})
					.filter((line: any) => line !== null);
				if (data.isFinal) {
					clearInterval(interval);
				}
			});
	}

	async function getRun() {
		await getLogs();
		interval = setInterval(getLogs, 1000);
	}

	onMount(async () => {
		console.log('onMount');
		await getRun();
	});
	onDestroy(() => {
		console.log('onDestroy');
		clearInterval(interval);
	});
</script>

<div>
	{#each rows as row}
		<div class="flex">
			<pre class="w-24 text-sm text-blue-600">{toHumanDate(new Date(row.timestamp))}</pre>
			<pre class="w-12 text-sm">{row.level}</pre>
			<pre class="w-12 text-sm">{row.processId}</pre>
			<pre class="text-sm">{row.message}</pre>
		</div>
	{/each}
</div>
