<script lang="ts">
	import { Badge, Modal } from 'flowbite-svelte';
	let { open = $bindable(), auditRecord } = $props();
	let openFilename = $state<string>('');
	function joinUrls(baseUrl: string, ...paths: string[]) {
		const url = new URL(baseUrl);
		for (const path of paths) {
			url.pathname = new URL(path, url).pathname;
		}
		return url.href;
	}
</script>

<Modal
	size="lg"
	title="File {openFilename}"
	{open}
	outsideclose
	autoclose
	on:close={() => (open = false)}
>
	<div class="flex flex-row gap-3">
		<h1 class="text-xl">{auditRecord.name}</h1>
		<Badge color={auditRecord.success ? 'green' : 'red'}
			>{auditRecord.success ? 'Success' : 'Failed'}</Badge
		>
		<Badge color="blue">{(auditRecord.duration as number).toFixed(4)}sec</Badge>
	</div>

	<div class="flex flex-row gap-3 bg-gray-200 p-2">
		<h2>Request</h2>
		<Badge color="blue">{auditRecord.method}</Badge>
		<pre>{joinUrls(auditRecord.baseUrl, auditRecord.path)}</pre>
	</div>
	{#if auditRecord.requestHeaders}
		<h3>Headers</h3>
		<table class="border border-gray-200">
			<tbody>
				{#each Object.entries(auditRecord.requestHeaders) as [key, value]}
					<tr>
						<td class="border border-gray-200">
							<span class="mr-2">
								{key}
							</span>
						</td>
						<td class="border border-gray-200">
							<span class="mr-2">
								{value}
							</span>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
	{#if auditRecord.requestBody}
		<h3>Body</h3>
		{#if typeof auditRecord.requestBody === 'string'}
			<pre>{auditRecord.requestBody?.trim()}</pre>
		{:else if auditRecord.requestBody instanceof FormData}
			{#each auditRecord.requestBody.entries() as [key, value]}
				{key}: {value}
			{/each}
		{:else}
			<pre>{JSON.stringify(auditRecord.requestBody, null, 2)}</pre>
		{/if}
	{/if}

	<div class="flex flex-row gap-3 bg-gray-200 p-2">
		<h2>Response</h2>
		{#if auditRecord.status}
			<Badge color={auditRecord.status >= 300 ? 'red' : 'blue'}>{auditRecord.status}</Badge>
			<span>{auditRecord.statusDescription}</span>
		{/if}
	</div>
	{#if auditRecord.responseHeaders}
		<h3>Headers</h3>
		<table class="border border-gray-200">
			<tbody>
				{#each Object.entries(auditRecord.responseHeaders) as [key, value]}
					<tr>
						<td class="border border-gray-200">
							<span class="mr-2">
								{key}
							</span>
						</td>
						<td class="border border-gray-200">
							<span class="mr-2">
								{value}
							</span>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
	<h3>Body</h3>
	{#if typeof auditRecord.responseBody === 'string'}
		<pre>{auditRecord.responseBody?.trim()}</pre>
	{:else if auditRecord.responseBody instanceof FormData}
		{#each auditRecord.responseBody.entries() as [key, value]}
			{key}: {value}
		{/each}
	{:else}
		<pre>{JSON.stringify(auditRecord.responseBody, null, 2)}</pre>
	{/if}
</Modal>
