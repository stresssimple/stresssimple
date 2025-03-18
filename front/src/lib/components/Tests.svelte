<script lang="ts">
	import { v7 } from 'uuid';
	import { activeTest, tests } from '$lib/stores/tests.store';
	import { page } from '$app/state';
	import { Button } from 'flowbite-svelte';
	import { PlusOutline } from 'flowbite-svelte-icons';
	import { activeTab } from '$lib/stores/activeTab.store';

	const defaultTestSource = `import { StressTest } from './StressTest.js';

export class Test extends StressTest {
    private request:number = 1;
    // Create http client
    private googleClient = this.http.baseUrl("https://google.com").create();

    // Test function
    public async test(userId: string): Promise<void> {
        console.log("Test with " + userId + ' request number '+this.request++);

        // Send request to google and wait for response
        const googleResponse = await this.googleClient.get("").name("google").send();
    }

    // Optional interval between tests in milliseconds
    public interval(): number { 
        return Math.random() * 1000;
    }
}`;

	function addTest() {
		let id: string = v7();
		tests.addTest({
			name: 'New Test ' + $tests.length,
			description: 'This is a new test',
			source: defaultTestSource,
			modules: []
		});
		activeTest.setActiveById(id);
	}
</script>

<div class="m-2">
	<h2 class="m-2 text-lg font-semibold">Tests</h2>
	<div>
		{#each $tests as test}
			<a
				class="block w-full rounded p-2 hover:bg-gray-200"
				class:active={page.params.id == test.id}
				href="/test/{test.id}/{$activeTab}"
			>
				<span class:italic={page.params.id == test.id} class:font-bold={page.params.id == test.id}
					>{test.name}</span
				>
			</a>
		{/each}
	</div>
	<div class="flex justify-end p-4">
		<Button size="xs" on:click={addTest}><PlusOutline class="me-2 h-4 w-4" />Add</Button>
	</div>
</div>

<style lang="postcss">
	@reference "../../app.css";
	.active {
		@apply bg-blue-200;
	}
</style>
