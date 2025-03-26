import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';
import axios from 'axios';
import { writable } from 'svelte/store';

function createServersStore() {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const { subscribe, set } = writable<Record<string, any>[]>([]);

	setInterval(async () => {
		if (!browser) {
			return;
		}

		const response = await axios.get(env.PUBLIC_API_URL + '/servers/list/agent');
		const data = await response.data;
		set(data);
	}, 1000);

	return {
		subscribe
	};
}

export const serversStore = createServersStore();
