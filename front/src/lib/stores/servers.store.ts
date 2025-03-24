import { PUBLIC_API_URL } from '$env/static/public';
import axios from 'axios';
import { writable } from 'svelte/store';

function createServersStore() {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const { subscribe, set } = writable<Record<string, any>[]>([]);

	setInterval(async () => {
		const response = await axios.get(PUBLIC_API_URL + '/servers/list/agent');
		const data = await response.data;
		set(data);
	}, 1000);

	return {
		subscribe
	};
}

export const serversStore = createServersStore();
