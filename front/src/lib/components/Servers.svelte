<script lang="ts">
	import { Range } from 'flowbite-svelte';
	import { serversStore } from '$lib/stores/servers.store';
	import { Indicator } from 'flowbite-svelte';

	let servers = $state($serversStore);
	$effect(() => {
		const srvrs = $serversStore;
		for (const server of srvrs) {
			const indicators = [];
			for (let i = 0; i < server.maxProcesses; i++) {
				if (server.processes[i]) {
					indicators.push(server.processes[i].status);
				} else {
					indicators.push('Free');
				}
			}
			server.indicators = indicators;
		}
		servers = srvrs;
	});

	function statucToColor(status: string) {
		switch (status) {
			case 'Free':
				return 'green';
			case 'Busy':
				return 'red';
			case 'Warning':
				return 'yellow';
			default:
				return 'blue';
		}
	}
</script>

<div>
	<h2 class="m-2 text-lg font-semibold">Servers</h2>
	{#each servers as server}
		<div class="m-2 rounded-lg border border-gray-400 bg-gray-100 p-2">
			<pre class="m-2 text-sm">{server.name}</pre>
			<pre class="m-2 text-sm">{server.id}</pre>
			<div class="m-2 w-40">
				<div class="grid grid-cols-8">
					{#each server.indicators as i}
						<Indicator color={statucToColor(i)} class="m-2" title={i} />
					{/each}
				</div>
			</div>
			<span class="m-2 text-xs">
				{server.lastHeartbeat}
			</span>
		</div>
	{/each}
</div>
