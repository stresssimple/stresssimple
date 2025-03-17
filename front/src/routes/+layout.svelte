<script lang="ts">
	import '../app.css';
	import { Navbar, NavBrand } from 'flowbite-svelte';
	import Tests from '../lib/components/Tests.svelte';

	let { children } = $props();
</script>

<div class="flex h-full w-full flex-col">
	<Navbar let:hidden let:toggle class="shadow">
		<NavBrand href="/">
			<span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white"
				>StressJS</span
			>
		</NavBrand>
	</Navbar>
	<div class="flex grow flex-row">
		<div class="max-w-80 min-w-60 shadow-inner shadow-gray-200">
			<Tests />
		</div>
		<div class="h-full w-full">
			{@render children()}
		</div>
	</div>
</div>
