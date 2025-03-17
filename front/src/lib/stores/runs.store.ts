import axios from 'axios';
import { writable } from 'svelte/store';
import { PUBLIC_API_URL } from '$env/static/public';
import { browser } from '$app/environment';

function createRunsStore() {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const { subscribe, set } = writable<any[]>([]);

	async function load(testId: string) {
		if (!browser) return;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const result = await axios.get<any[]>(`${PUBLIC_API_URL}/runs/${testId}`);
		set(
			result.data
				.filter((r) => r)
				.map((run) => {
					if (!run) {
						console.error('Run not found');
						return;
					}
					if (run.endTime) run.endTime = new Date(run.endTime);
					if (run.startTime) run.startTime = new Date(run.startTime);
					if (run.lastUpdated) run.lastUpdated = new Date(run.lastUpdated);
					return run;
				})
		);
	}

	return {
		subscribe,
		load: async (testId: string) => {
			await load(testId);
		},
		clear: () => set([])
	};
}

export const runsStore = createRunsStore();
