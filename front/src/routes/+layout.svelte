<script lang="ts">
	import '../app.css';
	import { Navbar, NavBrand } from 'flowbite-svelte';
	import Tests from '../lib/components/Tests.svelte';
	import Servers from '$lib/components/Servers.svelte';
	import { env } from '$env/dynamic/public';
	import NavContainer from 'flowbite-svelte/NavContainer.svelte';

	let { children } = $props();
</script>

<div class="flex h-full w-full flex-col">
	<Navbar let:hidden let:toggle class="shadow">
		<NavBrand href="/" class="">
			<div>
				<span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white"
					>Stress Simple</span
				>
				<span class="ml-2 self-center text-xs text-gray-500 dark:text-gray-400">v0.1</span>
			</div>
		</NavBrand>
		<NavContainer>
			<div class="text-xs text-gray-500 dark:text-gray-400">
				<span>API server</span>
				<a href={env.PUBLIC_API_URL}>{env.PUBLIC_API_URL}</a>
			</div>
		</NavContainer>
	</Navbar>
	<div class="flex grow flex-row overflow-hidden overscroll-none">
		<div class="flex min-w-60 max-w-80 flex-col justify-between shadow-inner shadow-gray-200">
			<Tests />
			<Servers />
		</div>
		<div class="h-full w-full overflow-y-hidden">
			<div class="h-full max-h-full overflow-y-scroll">
				{@render children()}
			</div>
		</div>
	</div>
</div>
