<script lang="ts">
	import { page } from '$app/state';
	import {
		Button,
		Label,
		MultiSelect,
		Pagination,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		type SelectOptionType
	} from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { PUBLIC_API_URL } from '$env/static/public';
	import axios from 'axios';
	import AuditModal from './AuditModal.svelte';

	let records: any[] = $state<any[]>([]);
	let total: number = $state<number>(0);
	let values = $state<Record<string, SelectOptionType<string>[]>>({});
	let auditRecord = $state<any>({});
	let fileModalVisible = $state<boolean>(false);

	let filterNames = $state<string[]>([]);
	let filterPaths = $state<string[]>([]);
	let filterMethods = $state<string[]>([]);
	let filterStatuses = $state<string[]>([]);
	let filterSuccesses = $state<string[]>([]);
	let filterBaseUrls = $state<string[]>([]);

	async function updateRecords() {
		const params: Record<string, any> = {
			page: 1,
			pageSize: 10
		};

		if (filterNames.length > 0) params.name = filterNames.join(',');
		if (filterPaths.length > 0) params.path = filterPaths.join(',');
		if (filterMethods.length > 0) params.method = filterMethods.join(',');
		if (filterStatuses.length > 0) params.status = filterStatuses.join(',');
		if (filterSuccesses.length > 0) params.success = filterSuccesses.join(',');
		if (filterBaseUrls.length > 0) params.baseUrl = filterBaseUrls.join(',');

		const response = await axios.get(`${PUBLIC_API_URL}/audit/` + page.params.runId + '/audit', {
			params
		});
		const data = await response.data;
		records = data.audits as any[];
		total = data.total;
	}

	onMount(async () => {
		const valuesResult = await axios.get(
			`${PUBLIC_API_URL}/audit/` + page.params.runId + '/audit/values'
		);
		const converted: Record<string, SelectOptionType<string>[]> = {};
		for (const [key, value] of Object.entries(valuesResult.data)) {
			const arr = value as string[];
			converted[key] = arr.map((v: string) => ({ name: v, value: v }));
		}
		values = converted;
		await updateRecords();
	});

	async function showFileModal(id: string) {
		const fileResponse = await axios.get(
			`${PUBLIC_API_URL}/audit/` + page.params.runId + '/audit/' + id
		);
		auditRecord = fileResponse.data as any;
		if (auditRecord.requestHeaders)
			auditRecord.requestHeaders = JSON.parse(auditRecord.requestHeaders);
		if (auditRecord.responseHeaders)
			auditRecord.responseHeaders = JSON.parse(auditRecord.responseHeaders);
		fileModalVisible = true;
	}
</script>

<h1 class="text-xl">Filter</h1>
<div class="grid grid-cols-3 gap-3 p-4">
	<div>
		<Label>Path</Label>
		<MultiSelect items={values['path']} bind:value={filterPaths} on:change={updateRecords} />
	</div>
	<div>
		<Label>Method</Label>
		<MultiSelect items={values['method']} bind:value={filterMethods} on:change={updateRecords} />
	</div>
	<div>
		<Label>Status</Label>
		<MultiSelect items={values['status']} bind:value={filterStatuses} on:change={updateRecords} />
	</div>
	<div>
		<Label>Name</Label>
		<MultiSelect items={values['name']} bind:value={filterNames} on:change={updateRecords} />
	</div>
	<div>
		<Label>Success</Label>
		<MultiSelect items={values['success']} bind:value={filterSuccesses} on:change={updateRecords} />
	</div>
	<div>
		<Label>Base url</Label>
		<MultiSelect items={values['baseUrl']} bind:value={filterBaseUrls} on:change={updateRecords} />
	</div>
</div>
<div class="flex h-full w-full flex-col">
	<Table>
		<TableHead>
			<TableHeadCell>Timestamp</TableHeadCell>
			<TableHeadCell>Request</TableHeadCell>
			<TableHeadCell>Method</TableHeadCell>
			<TableHeadCell>Path</TableHeadCell>
			<TableHeadCell>Status</TableHeadCell>
			<TableHeadCell>Duration</TableHeadCell>
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
					<TableBodyCell>{(file.duration as number).toFixed(4)}sec</TableBodyCell>
					<TableBodyCell>
						<Button size={'xs'} on:click={() => showFileModal(file.id)}>View</Button>
					</TableBodyCell>
				</TableBodyRow>
			{/each}
		</TableBody>
	</Table>

	<Pagination pages={[{ name: '1' }]} table></Pagination>
</div>

<AuditModal bind:open={fileModalVisible} {auditRecord} />
