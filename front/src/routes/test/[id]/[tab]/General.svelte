<script lang="ts">
	import { beforeNavigate, goto } from '$app/navigation';
	import { activeTest, tests } from '$lib/stores/tests.store';
	import { Button, ButtonGroup, Input, Label, Modal, Textarea } from 'flowbite-svelte';

	let navigating: string | undefined = undefined;
	let saveModal = $state(false);

	let originalName = $derived($activeTest.name);
	let originalDescription = $derived($activeTest.description);
	let name = $state($activeTest.name);
	let description = $state($activeTest.description);
	$effect(() => {
		name = $activeTest.name;
		description = $activeTest.description;
	});

	let isDirty = $derived(() => {
		return name !== originalName || description !== originalDescription;
	});

	beforeNavigate((e) => {
		console.log('beforeNavigate', e);
		if (isDirty()) {
			navigating = e.to?.url.toString();
			saveModal = true;
			e.cancel();
			console.log('isDirty');
		}
	});

	const save = () => {
		const test = { ...$activeTest, name, description };
		console.log('save general', test);
		tests.save(test);

		if (navigating) {
			saveModal = false;
			goto(navigating);
			navigating = undefined;
		}
	};
	const discard = () => {
		console.log('discard');
		// test = JSON.parse(JSON.stringify($activeTest));
		name = $activeTest.name;
		description = $activeTest.description;
		if (navigating) {
			saveModal = false;
			goto(navigating);
			navigating = undefined;
		}
	};
</script>

<div class="flex h-full w-full flex-col">
	<div class="flex flex-row justify-between">
		<div class="text-2xl">{name}</div>
		<ButtonGroup class="mb-4" size="sm">
			<Button disabled={!isDirty()} on:click={save}>Save</Button>
			<Button disabled={!isDirty()} on:click={discard}>Discard</Button>
		</ButtonGroup>
	</div>
	<div>
		<Label for="id">ID</Label>
		<Input type="text" id="id" value={$activeTest.id} disabled />
		<Label for="name">Name</Label>
		<Input type="text" id="name" bind:value={name} />
		<Label for="description">Description</Label>
		<Textarea id="description" rows={5} bind:value={description} />
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

<style lang="postcss">
	@reference "tailwindcss";

	:global(label) {
		@apply mt-4 mb-2;
	}
</style>
