<script lang="ts">
	import { page } from '$app/state';
	import {
		Badge,
		Button,
		Modal,
		Pagination,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { PUBLIC_API_URL } from '$env/static/public';
	import axios from 'axios';
	import type { AuditRecord } from './a';

	let records: AuditRecord[] = $state<AuditRecord[]>([]);
	let total: number = $state<number>(0);
	let fileModalVisible = $state<boolean>(false);
	let openFilename = $state<string>('');
	let auditRecord = $state<Partial<AuditRecord>>({});

	onMount(async () => {
		const response = await axios.get(`${PUBLIC_API_URL}/audit/` + page.params.runId + '/audit');
		const data = await response.data;
		records = data.audits as AuditRecord[];
		total = data.total;
	});

	async function showFileModal(id: string) {
		const fileResponse = await axios.get(
			`${PUBLIC_API_URL}/audit/` + page.params.runId + '/audit/' + id
		);
		auditRecord = fileResponse.data as AuditRecord;
		if (auditRecord.requestHeaders)
			auditRecord.requestHeaders = JSON.parse(auditRecord.requestHeaders);
		if (auditRecord.responseHeaders)
			auditRecord.responseHeaders = JSON.parse(auditRecord.responseHeaders);
		fileModalVisible = true;
	}

	function joinUrls(baseUrl: string, ...paths: string[]) {
		const url = new URL(baseUrl);
		for (const path of paths) {
			url.pathname = new URL(path, url).pathname;
		}
		return url.href;
	}
</script>

<div class="flex h-full w-full flex-col">
	<Table>
		<TableHead>
			<TableHeadCell>Timestamp</TableHeadCell>
			<TableHeadCell>Request</TableHeadCell>
			<TableHeadCell>Method</TableHeadCell>
			<TableHeadCell>Path</TableHeadCell>
			<TableHeadCell>Status</TableHeadCell>
			<TableHeadCell>Actions</TableHeadCell>
		</TableHead>
		<TableBody>
			{#each records as file}
				<TableBodyRow>
					<TableBodyCell>{file.timestamp}</TableBodyCell>
					<TableBodyCell>{file.name}</TableBodyCell>
					<TableBodyCell>{file.method}</TableBodyCell>
					<TableBodyCell>{file.path}</TableBodyCell>
					<TableBodyCell>{file.status}</TableBodyCell>
					<TableBodyCell>
						<Button size={'xs'} on:click={() => showFileModal(file.id)}>View</Button>
					</TableBodyCell>
				</TableBodyRow>
			{/each}
		</TableBody>
	</Table>

	<Pagination pages={[{ name: '1' }]} table></Pagination>
</div>

<Modal
	size="lg"
	title="File {openFilename}"
	open={fileModalVisible}
	outsideclose
	autoclose
	on:close={() => (fileModalVisible = false)}
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
		<pre>{JSON.stringify(auditRecord.requestHeaders, null, 2)}</pre>
	{/if}
	{#if auditRecord.requestBody}
		<h3>Body</h3>
		<pre>{auditRecord.requestBody}</pre>
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
		<pre>{JSON.stringify(auditRecord.responseHeaders, null, 2)}</pre>
	{/if}
	<h3>Body</h3>
	<pre>{auditRecord?.responseBody}</pre>
</Modal>
