<script lang="ts">
	import { page } from '$app/state';
	import LineChart from '$lib/components/LineChart.svelte';
	import axios from 'axios';
	import { onDestroy, onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { PUBLIC_API_URL } from '$env/static/public';

	let usersLabels = writable<string[]>([]);
	let usersData = writable<Record<string, number[]>>({});
	let httpLabels = writable<string[]>([]);
	let httpData = writable<Record<string, number[]>>({});
	let rpsLabels = writable<string[]>([]);
	let rpsData = writable<Record<string, number[]>>({});

	function getData() {
		axios
			.get(`${PUBLIC_API_URL}/runs/report/${page.params.runId}`)
			.then((res) => res.data)
			.then((data) => {
				usersData.set(data.users.data);
				usersLabels.set(data.users.labels);
				// usersLabels.set(data.users.labels.map((label: Date) => toHumanDate(new Date(label))));
				httpData.set(data.http.data);
				httpLabels.set(data.http.labels);
				// httpLabels.set(data.http.labels.map((label: Date) => toHumanDate(new Date(label))));
				rpsData.set(data.rps.data);
				rpsLabels.set(data.rps.labels);
				// rpsLabels.set(data.rps.labels.map((label: Date) => toHumanDate(new Date(label))));
			});
	}

	let interval: number;
	async function getRun() {
		getData();
		interval = setInterval(getData, 2000);
	}

	onMount(async () => {
		console.log('onMount');
		usersData.set({});
		usersLabels.set([]);
		httpData.set({});
		httpLabels.set([]);
		rpsData.set({});
		rpsLabels.set([]);
		getRun();
	});
	onDestroy(() => {
		console.log('onDestroy');
		clearInterval(interval);
	});
</script>

<div class="grid grid-cols-2 gap-4 p-4">
	<div class="container h-64">
		<LineChart
			labels={$usersLabels}
			data={$usersData}
			options={{
				maintainAspectRatio: false,
				plugins: {
					legend: {
						position: 'bottom'
					},
					title: {
						display: true,
						text: 'Users'
					},
					subtitle: {
						display: true,
						text: 'Users over time',
						padding: 4
					}
				},
				scales: {
					y: {
						beginAtZero: true,
						suggestedMax: 10,
						title: {
							display: true,
							text: 'Active users'
						}
					}
				}
			}}
			dataOptions={{}}
		/>
	</div>
	<div class="container h-64">
		<LineChart
			labels={$httpLabels}
			data={$httpData}
			options={{
				maintainAspectRatio: false,
				plugins: {
					legend: {
						position: 'bottom'
					},
					title: {
						display: true,
						text: 'HTTP'
					},
					subtitle: {
						display: true,
						text: 'Request duration over time',
						padding: 4
					}
				},
				scales: {
					y: {
						beginAtZero: true,
						title: {
							display: true,
							text: 'seconds'
						}
					}
				}
			}}
			dataOptions={{}}
		/>
	</div>
	<div class="container col-span-2 h-64">
		<LineChart
			labels={$rpsLabels}
			data={$rpsData}
			options={{
				maintainAspectRatio: false,
				plugins: {
					legend: {
						position: 'bottom'
					},
					title: {
						display: true,
						text: 'HTTP RPS'
					},
					subtitle: {
						display: true,
						text: 'HTTP Requests per second over time',
						padding: 4
					}
				},
				scales: {
					y: {
						beginAtZero: true,
						title: {
							display: true,
							text: 'Requests per second'
						}
					}
				}
			}}
			dataOptions={{}}
		/>
	</div>
</div>
