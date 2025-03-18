/* eslint-disable @typescript-eslint/no-explicit-any */
import { writable } from 'svelte/store';
import axios from 'axios';
import { PUBLIC_API_URL } from '$env/static/public';

function createRunStore() {
	const { subscribe, set } = writable<any | undefined>();
	let interval = 0;
	return {
		subscribe,
		load: async (testId: string, runId: string) => {
			const response = await axios.get<any>(`${PUBLIC_API_URL}/runs/${runId}`);
			const run = response.data;
			if (!run) {
				console.error('Run not found');
				return;
			}
			if (run.endTime) run.endTime = new Date(run.endTime);
			if (run.startTime) run.startTime = new Date(run.startTime);
			if (run.lastUpdated) run.lastUpdated = new Date(run.lastUpdated);
			set(run);
			if (interval !== 0) return;
			interval = setInterval(async () => {
				const response = await axios.get<any>(`${PUBLIC_API_URL}/runs/${runId}`);
				const run = response.data;
				if (!run) {
					console.error('Run not found');
					return;
				}
				if (run.endTime) run.endTime = new Date(run.endTime);
				if (run.startTime) run.startTime = new Date(run.startTime);
				if (run.lastUpdated) run.lastUpdated = new Date(run.lastUpdated);
				set(run);
				if (run.status === 'completed' || run.status === 'failed' || run.status === 'cancelled') {
					console.log('clearing interval', run.status);
					clearInterval(interval);
				}
			}, 1000);
		},
		clear: () => {
			set(undefined);
			clearInterval(interval);
		}
	};
}

export const runStore = createRunStore();
