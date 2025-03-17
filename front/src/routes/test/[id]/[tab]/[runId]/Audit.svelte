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

	let files: any[] = $state<any[]>([]);
	let total: number = $state<number>(0);
	let fileModalVisible = $state<boolean>(false);
	let openFilename = $state<string>('');
	let fileData = $state<any>({});

	onMount(async () => {
		const response = await fetch(
			`${PUBLIC_API_URL}/audit/` + page.params.id + '/' + page.params.runId
		);
		const data = await response.json();
		files = data.data;
		total = data.total;
	});

	async function showFileModal(filename: string) {
		openFilename = filename;
		const fileResponse = await fetch(
			`${PUBLIC_API_URL}/audit/` + page.params.id + '/' + page.params.runId + '/' + filename
		);
		fileData = await fileResponse.json();
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
			<TableHeadCell>File</TableHeadCell>
			<TableHeadCell>Size</TableHeadCell>
			<TableHeadCell>Timestamp</TableHeadCell>
			<TableHeadCell>Method</TableHeadCell>
			<TableHeadCell>Path</TableHeadCell>
			<TableHeadCell>Status</TableHeadCell>
			<TableHeadCell>Actions</TableHeadCell>
		</TableHead>
		<TableBody>
			{#each files as file}
				<TableBodyRow>
					<TableBodyCell>{file.filename}</TableBodyCell>
					<TableBodyCell>{file.size}</TableBodyCell>
					<TableBodyCell>{file.timestamp}</TableBodyCell>
					<TableBodyCell>{file.method}</TableBodyCell>
					<TableBodyCell>{file.url}</TableBodyCell>
					<TableBodyCell>{file.statusCode}</TableBodyCell>
					<TableBodyCell>
						<Button size={'xs'} on:click={() => showFileModal(file.filename)}>View</Button>
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
		<h1 class="text-xl">{fileData.name}</h1>
		<Badge color={fileData.success ? 'green' : 'red'}
			>{fileData.success ? 'Success' : 'Failed'}</Badge
		>
		<Badge color="blue">{(fileData.duration as number).toFixed(4)}sec</Badge>
	</div>

	<div class="flex flex-row gap-3 bg-gray-200 p-2">
		<h2>Request</h2>
		<Badge color="blue">{fileData.request?.method}</Badge>
		<pre>{joinUrls(fileData?.request?.host, fileData?.request?.url)}</pre>
	</div>
	{#if fileData.request?.headers}
		<h3>Headers</h3>
		<pre>{JSON.stringify(fileData.request.headers, null, 2)}</pre>
	{/if}
	{#if fileData.request?.body}
		<h3>Body</h3>
		<pre>{JSON.stringify(fileData.request.body, null, 2)}</pre>
	{/if}

	<div class="flex flex-row gap-3 bg-gray-200 p-2">
		<h2>Response</h2>
		<Badge color={fileData.response?.status >= 300 ? 'red' : 'blue'}
			>{fileData.response?.status} {fileData.response?.statusMessage}</Badge
		>
	</div>
	{#if fileData.response?.headers}
		<h3>Headers</h3>
		<pre>{JSON.stringify(fileData.response.headers, null, 2)}</pre>
	{/if}
	<h3>Body</h3>
	<pre>{JSON.stringify(fileData?.response?.body, null, 2)}</pre>
</Modal>
