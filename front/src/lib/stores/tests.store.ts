/* eslint-disable @typescript-eslint/no-explicit-any */
import { writable } from 'svelte/store';
// import type { TestDefinitions } from 'stress.dto';
import { env } from '$env/dynamic/public';

import axios from 'axios';
import { browser } from '$app/environment';
function createTestsStore() {
	const { subscribe, update } = writable<any[]>([]);

	function fetchTests() {
		if (browser) {
			axios.get<any[]>(`${env.PUBLIC_API_URL}/tests`).then((response) => {
				update(() => response.data);
			});
		}
	}
	fetchTests();

	return {
		subscribe,
		addTest: async (test: any) => {
			await axios.post(`${env.PUBLIC_API_URL}/tests`, test);
			fetchTests();
		},
		deleteTest: async (id: string) => {
			await axios.delete(`${env.PUBLIC_API_URL}/tests/${id}`);
			fetchTests();
		},
		save: async (test: any) => {
			await axios.put(`${env.PUBLIC_API_URL}/tests`, test);
			fetchTests();
		},
		clone: async (id: string) => {
			await axios.post(`${env.PUBLIC_API_URL}/tests/${id}/clone`);
			fetchTests();
		}
	};
}

export const tests = createTestsStore();

function createActiveTestStore() {
	const { subscribe, set } = writable<any | null>(null);

	return {
		subscribe,
		setActiveById: async (id: string) => {
			const response = await axios.get<any>(`${env.PUBLIC_API_URL}/tests/${id}`);
			const test = response.data;
			set(test);
		}
	};
}

export const activeTest = createActiveTestStore();
