<script lang="ts">
	import axios from 'axios';
	import { beforeNavigate, goto } from '$app/navigation';
	import { activeTest, tests } from '$lib/stores/tests.store';
	import { Button, ButtonGroup, Modal } from 'flowbite-svelte';

	import Monaco from '$lib/components/Monaco/Monaco.svelte';
	import Modules from '$lib/components/Monaco/Modules.svelte';
	import { ExtraModule } from '$lib/components/Monaco/ExtraModule';
	import { page } from '$app/state';

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

	const save = () => {
		tests.save(test);
		activeTest.setActiveById(test.id);
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
</script>

<div class="flex h-full w-full flex-col">
	<div class="flex w-full flex-row justify-between">
		<div class="text-2xl">{test.name}</div>

		<Modules bind:modules={extraModules} testId={page.params.id} />
		<ButtonGroup class="mb-4" size="sm">
			<Button disabled={!isDirty()} on:click={save}>Save</Button>
			<Button disabled={!isDirty()} on:click={discard}>Discard</Button>
		</ButtonGroup>
	</div>
	<div>
		<Monaco bind:source={test.source} modules={extraModules} onSave={save} />
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
</style>
