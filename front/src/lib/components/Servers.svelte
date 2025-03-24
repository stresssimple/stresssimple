<script lang="ts">
	import { Range } from 'flowbite-svelte';
	import { serversStore } from '$lib/stores/servers.store';
</script>

<h2 class="m-2 text-lg font-semibold">Servers</h2>
<div>
	{#each $serversStore as server}
		<pre class="m-4">{server.serverName}:{server.serverId}</pre>
		<div class="m-4">
			<Range min={0} value={server.activeProcesses} max={server.maxProcesses} disabled />
			<div>{server.properties.activeProcesses}/{server.properties.maxProcesses}</div>
		</div>
	{/each}
</div>
