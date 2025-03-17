<script lang="ts">
	import '../app.css';
	import { Navbar, NavBrand } from 'flowbite-svelte';
	import Tests from '../lib/components/Tests.svelte';

	let { children } = $props();
</script>

<div class="flex h-full w-full flex-col">
	<Navbar let:hidden let:toggle class="shadow">
		<NavBrand href="/">
			<span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white"
				>StressJS</span
			>
		</NavBrand>
	</Navbar>
	<div class="flex grow flex-row">
		<div class="min-w-60 max-w-80 shadow-inner shadow-gray-200">
			<Tests />
		</div>
		<div class="ml-2 h-full w-full">
			{@render children()}
		</div>
	</div>
</div>
