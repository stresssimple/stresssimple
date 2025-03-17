<script lang="ts">
	import { Button, Input, Modal } from 'flowbite-svelte';

	let deleteModalOpen = $state(false);
	let deleteConfirm = $state<string>('');
	let deleteIntentName = $state<string>('item name');
	let deleteIntentId: string | undefined;

	export function openDeleteModal(item: string, id?: string) {
		deleteIntentName = item;
		deleteIntentId = id;
		deleteModalOpen = true;
	}

	const {
		onConfirmed
	}: {
		onConfirmed: (id: string | undefined) => void;
	} = $props();
</script>

<Modal open={deleteModalOpen} on:close={() => (deleteModalOpen = false)} color="red">
	<div slot="header">
		<h2 class="pb-8 text-xl">Delete confirmation</h2>
		<div>
			Are you sure you want to delete <strong>{deleteIntentName}</strong>?
		</div>
	</div>

	<div class="flex flex-col gap-4">
		<div class="flex flex-row gap-2">
			Type <pre class="bg-gray-200 px-2">delete</pre>
			to continue
		</div>
		<Input bind:value={deleteConfirm} />
	</div>

	<div slot="footer" class="flex w-full flex-row justify-end gap-2">
		<Button color="none" on:click={() => (deleteModalOpen = false)}>Cancel</Button>
		<Button
			color="red"
			disabled={deleteConfirm != 'delete'}
			on:click={() => {
				deleteModalOpen = false;
				onConfirmed(deleteIntentId);
			}}>Delete</Button
		>
	</div>
</Modal>
