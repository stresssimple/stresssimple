<script lang="ts">
	import { Range } from 'flowbite-svelte';
	import { serversStore } from '$lib/stores/servers.store';
</script>

<div>
	<h2 class="m-2 text-lg font-semibold">Servers</h2>
	{#each $serversStore as server}
		<div class="m-2 rounded-lg border border-gray-400 bg-gray-100 p-2">
			<pre class="m-2">{server.name}:{server.id}</pre>
			<div class="m-2">
				<div>Processes {server.allocatedProcesses}/{server.maxProcesses}</div>
			</div>
		</div>
	{/each}
</div>
