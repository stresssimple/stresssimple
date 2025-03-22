<script lang="ts">
	import { beforeNavigate, goto } from '$app/navigation';
	import { activeTest, tests } from '$lib/stores/tests.store';
	import { Button, ButtonGroup, Modal, Textarea } from 'flowbite-svelte';
	import { EditOutline } from 'flowbite-svelte-icons';

	import Monaco from '$lib/components/Monaco/Monaco.svelte';
	import Modules from '$lib/components/Modules.svelte';
	import { ExtraModule } from '$lib/components/Monaco/ExtraModule';
	import { page } from '$app/state';
	import DeleteConfirmation from '$lib/components/DeleteConfirmation.svelte';
	let deleteConfirmDialog: DeleteConfirmation;

	let editName = $state(false);
	let nameInput: HTMLInputElement | null = $state(null);

	let test = $state($activeTest);
	let originalTest = '';
	let extraModules: ExtraModule[] = $state([]);
	$effect(() => {
		originalTest = JSON.parse(JSON.stringify($activeTest));
		test = JSON.parse(JSON.stringify($activeTest));
	});

	$effect(() => {
		extraModules = $activeTest.modules.map((m: string) => {
			return {
				name: m
			};
		});
	});

	$effect(() => {
		test.modules = extraModules.map((m) => m.name);
	});

	let isDirty = $derived(() => {
		return JSON.stringify(test) !== JSON.stringify(originalTest);
	});

	let saveModal = $state(false);
	let navigating: string | undefined = undefined;

	beforeNavigate((e) => {
		if (isDirty()) {
			navigating = e.to?.url.toString();
			saveModal = true;
			e.cancel();
		}
	});

	const save = async () => {
		await tests.save(test);
		await activeTest.setActiveById(test.id);
		test = $activeTest;
		originalTest = $activeTest;
		extraModules = $activeTest.modules.map((m: string) => {
			return {
				name: m
			};
		});
		if (navigating) {
			saveModal = false;
			goto(navigating);
			navigating = undefined;
		}
	};
	const discard = () => {
		test = $activeTest;
		originalTest = $activeTest;
		extraModules = $activeTest.modules.map((m: string) => {
			return {
				name: m
			};
		});
		if (navigating) {
			saveModal = false;
			goto(navigating);
			navigating = undefined;
		}
	};
	async function deleteTest(id: string | undefined) {
		if (!id) return;
		await tests.deleteTest(id);
		goto('/');
	}

	const clone = () => {
		tests.clone($activeTest.id);
	};
</script>

<div class="flex h-full w-full flex-col">
	<div class="flex w-full flex-row justify-between">
		<div class="text-2xl">
			{#if editName}
				<input
					bind:value={test.name}
					bind:this={nameInput}
					onblur={() => (editName = !editName)}
					class="rounded"
				/>
			{:else}
				<span>{test.name}</span>
				<Button
					size="xs"
					color="none"
					on:click={() => {
						editName = !editName;
						setTimeout(() => nameInput?.focus(), 10);
					}}
				>
					<EditOutline size="sm" color="blue" />
				</Button>
			{/if}
		</div>
		<ButtonGroup class="mb-4" size="sm">
			<Button class="w-24" disabled={!isDirty()} on:click={save}>Save</Button>
			<Button class="w-24" disabled={!isDirty()} on:click={discard}>Discard</Button>
			<Button class="w-24" on:click={clone}>Clone</Button>
			<Button
				class="w-24"
				color="red"
				on:click={() => deleteConfirmDialog.openDeleteModal($activeTest.name, $activeTest.id)}
				>Delete</Button
			>
		</ButtonGroup>
	</div>
	<div>
		<Textarea id="description" rows={1} bind:value={test.description} />
	</div>
	<div>
		<Modules bind:modules={extraModules} language={test.language} />
		<Monaco
			bind:source={test.source}
			modules={extraModules}
			onSave={save}
			language={test.language}
		/>
	</div>
</div>

<Modal
	title="Editor has unsaved changes"
	bind:open={saveModal}
	autoclose={false}
	outsideclose={false}
	on:close={() => (navigating = undefined)}
>
	<p>Do you want to save changes?</p>
	<Button on:click={() => save()}>Save</Button>
	<Button on:click={() => discard()}>Discard</Button>
</Modal>
<DeleteConfirmation bind:this={deleteConfirmDialog} onConfirmed={deleteTest} />

<style lang="postcss">
</style>
