/* eslint-disable @typescript-eslint/no-explicit-any */
import { writable } from 'svelte/store';
// import type { TestDefinitions } from 'stress.dto';
import { PUBLIC_API_URL } from '$env/static/public';

import axios from 'axios';
import { browser } from '$app/environment';
function createTestsStore() {
	const { subscribe, update } = writable<any[]>([]);

	if (browser) {
		axios.get<any[]>(`${PUBLIC_API_URL}/tests`).then((response) => {
			update(() => response.data);
		});
	}

	return {
		subscribe,
		addTest: (test: any) => {
			update((tests) => [...tests, test]);
			axios.post(`${PUBLIC_API_URL}/tests`, test);
		},
		removeTest: (id: string) => update((tests) => tests.filter((test) => test.id !== id)),
		save: (test: any) => {
			update((tests) => tests.map((t) => (t.id === test.id ? test : t)));
			axios.put(`${PUBLIC_API_URL}/tests`, test);
		}
	};
}

export const tests = createTestsStore();

function createActiveTestStore() {
	const { subscribe, set } = writable<any | null>(null);

	return {
		subscribe,
		setActiveById: (id: string) => {
			tests.subscribe((tests) => {
				const test = tests.find((t) => t.id === id);
				if (test) {
					set(test);
				} else {
					set(null);
				}
			});
		}
	};
}

export const activeTest = createActiveTestStore();
