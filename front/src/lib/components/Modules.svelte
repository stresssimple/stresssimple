<script lang="ts">
	import { Badge, Button, ButtonGroup, Input, InputAddon, Label, Modal } from 'flowbite-svelte';
	import { CogOutline } from 'flowbite-svelte-icons';
	import { fetchTypeDefinitions, type ExtraModule } from './Monaco/ExtraModule';

	let tsCommonModules = [
		'axios',
		'node-fetch',
		'uuid',
		'faker',
		'p-limit',
		'prom-client',
		'commander',
		'yargs'
	];

	let pyCommonModules = ['requests', 'flask', 'fastapi', 'pydantic', 'numpy', 'pandas'];
	let {
		modules = $bindable<ExtraModule[]>(),
		language
	}: {
		language: string;
		modules: ExtraModule[];
	} = $props();

	let isModalOpen = $state(false);
	let inputText = $state('');
	$effect(() => {
		for (const module of modules) {
			if (!module.typeDefinitions) {
				fetchTypeDefinitions(module.name)
					.then((typeDefinitions) => {
						const index = modules.findIndex((m) => m.name === module.name);
						modules[index].typeDefinitions = typeDefinitions;
						modules[index].typeFetchError = undefined;
						modules = [...modules];
					})
					.catch((e) => {
						const index = modules.findIndex((m) => m.name === module.name);
						modules[index].typeFetchError = e.message;
						modules = [...modules];
					});
			}
		}
	});

	function addModule(module: string) {
		inputText = '';
		modules = [...modules, { name: module }];
		fetchTypeDefinitions(module)
			.then((typeDefinitions) => {
				const index = modules.findIndex((m) => m.name === module);
				modules[index].typeDefinitions = typeDefinitions;
				modules[index].typeFetchError = undefined;
				modules = [...modules];
			})
			.catch((e) => {
				const index = modules.findIndex((m) => m.name === module);
				modules[index].typeFetchError = e.message;
				modules = [...modules];
			});
	}

	function removeModule(module: string) {
		modules = modules.filter((m) => m.name !== module);
	}
</script>

<div class="flex items-center">
	<Button
		pill={true}
		size="xs"
		class="m-2 bg-transparent text-black hover:bg-gray-100"
		on:click={() => (isModalOpen = true)}
	>
		<CogOutline size="xs" class="h-4 w-4" color="blue" />
		{#if !modules || modules.length === 0}
			<span>No extra modules loaded</span>
		{:else}
			<span>Extra modules:</span>
		{/if}
	</Button>
	{#each modules as module}
		<Badge color="blue" class="m-2">
			{#if !module.typeDefinitions}
				<span class="text-red-500" title={module.typeFetchError}>⚠</span>
			{:else}
				<span class="text-green-500" title="Type for {module.name} loaded.">✓</span>
			{/if}
			{module.name}
		</Badge>
	{/each}
</div>

<Modal bind:open={isModalOpen} title="Extra Modules" outsideclose={true}>
	<div class="grid grid-cols-2">
		<div>
			<span>Loaded modules</span>
			{#each modules as module}
				<Badge color="blue" class="m-2 rounded-2xl">
					{#if !module.typeDefinitions}
						<span class="text-red-500">⚠</span>
					{:else}
						<span class="text-green-500">✓</span>
					{/if}
					<span>{module.name}</span>
					<button onclick={() => removeModule(module.name)} class="ml-2 text-sm text-red-500"
						>✗</button
					>
				</Badge>
			{/each}
		</div>
		<div>
			<span>Common packages</span>
			{#if language === 'python'}
				{#each pyCommonModules as module}
					{#if !modules.some((m) => m.name == module)}
						<Badge color="dark" class="m-2 rounded-2xl" onclick={() => addModule(module)}>
							{module}
						</Badge>
					{/if}
				{/each}
			{:else}
				{#each tsCommonModules as module}
					{#if !modules.some((m) => m.name == module)}
						<Badge color="dark" class="m-2 rounded-2xl" onclick={() => addModule(module)}>
							{module}
						</Badge>
					{/if}
				{/each}
			{/if}
		</div>
	</div>

	<div class="flex justify-end">
		<ButtonGroup class="w-full ring-1">
			<Input
				id="module"
				placeholder="Module name"
				class="box-border border-0 focus:ring-0 "
				bind:value={inputText}
				on:keydown={(e) => {
					if (e.key === 'Enter') {
						addModule(inputText);
					}
				}}
			/>
			<InputAddon>
				<button
					class="h-6 w-6 text-green-400"
					disabled={!inputText || modules.some((m) => m.name == inputText)}
					onclick={() => addModule(inputText)}
				>
					✓
				</button>
			</InputAddon>
		</ButtonGroup>
		<Button pill={true} size="xs" class="m-2" on:click={() => (isModalOpen = false)}>Close</Button>
	</div>
</Modal>

<style lang="postcss">
	@reference "tailwindcss";
</style>
