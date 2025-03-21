<script lang="ts">
	import { v7 } from 'uuid';
	import { activeTest, tests } from '$lib/stores/tests.store';
	import { page } from '$app/state';
	import { Badge, Button, ButtonGroup, Modal } from 'flowbite-svelte';
	import { PlusOutline } from 'flowbite-svelte-icons';
	import { activeTab } from '$lib/stores/activeTab.store';

	let addDialogOpen = $state(false);

	const typescriptTestSource = `import { StressTest } from './StressTest.js';

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

	const pythonDefaultTestSource = `from stress_test import StressTest
import random

class Test(StressTest):
    def __init__(self):
        super().__init__()
        print("Test initialized", flush=True)
        self.request = 1
        self.google_client = self.http.base_url(
            'https://www.google.com').create()

    # Test function
    async def test(self, user_id: str):
        print(f"Test with {user_id} request number {self.request}", flush=True)
        self.request += 1

        # Send request to google and wait for response
        google_response = await self.google_client.get("").send()
        # print(f"Google response: {google_response.status_code}", flush=True)
        # You can process google_response here as needed

    # Optional interval between tests in milliseconds
    def interval(self):
        return 1000
`;

	function addTest() {
		addDialogOpen = true;
	}

	function addPythonTest() {
		tests.addTest({
			name: 'New Python Test ' + $tests.length,
			description: 'This is a new test',
			source: pythonDefaultTestSource,
			modules: [],
			language: 'python'
		});
		addDialogOpen = false;
	}

	function addTypescriptTest() {
		tests.addTest({
			name: 'New Typescript Test ' + $tests.length,
			description: 'This is a new test',
			source: typescriptTestSource,
			modules: [],
			language: 'typescript'
		});
		addDialogOpen = false;
	}

	function languageShort(language: string) {
		if (language === 'typescript') {
			return 'TS';
		}
		if (language === 'python') {
			return 'PY';
		}
		return language;
	}
</script>

<div class="m-2">
	<h2 class="m-2 text-lg font-semibold">Tests</h2>
	<div>
		{#each $tests as test}
			<a
				class="flex w-full flex-row items-center justify-between rounded p-2 hover:bg-gray-200"
				class:active={page.params.id == test.id}
				href="/test/{test.id}/{$activeTab}"
			>
				<span class:italic={page.params.id == test.id} class:font-bold={page.params.id == test.id}>
					{test.name}
				</span>
				<span
					class="flex h-4 w-4 items-center justify-center rounded bg-gray-700 p-1 text-center text-[0.5rem] text-green-300"
				>
					{languageShort(test.language)}
				</span>
			</a>
		{/each}
	</div>
	<div class="flex justify-end p-4">
		<Button size="xs" on:click={addTest}><PlusOutline class="me-2 h-4 w-4" />Add</Button>
	</div>
</div>

<Modal bind:open={addDialogOpen}>
	<div slot="header">Create a new stress test definition.</div>
	<div>Please select your preferred programming language for the test code.</div>
	<div slot="footer" class="flex w-full justify-end">
		<ButtonGroup>
			<Button on:click={addPythonTest}>Python</Button>
			<Button on:click={addTypescriptTest}>Typescript</Button>
		</ButtonGroup>
	</div>
</Modal>

<style lang="postcss">
	@reference "../../app.css";
	.active {
		@apply bg-blue-200;
	}
</style>
