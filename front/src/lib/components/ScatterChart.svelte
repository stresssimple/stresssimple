<script lang="ts">
	import { Chart, type ChartDataset, type ChartOptions, type Plugin } from 'chart.js/auto';
	import { onMount } from 'svelte';
	let canvas: HTMLCanvasElement;
	let chart: Chart | null = null;
	let {
		data,
		options = {},
		dataOptions = {},
		plugins = [],
		refreshInterval = 1000
	}: {
		data: Record<string, { x: number; y: number }[]>;
		options?: ChartOptions<'scatter'>;
		dataOptions?: Record<string, ChartDataset<'scatter', number>>;
		plugins?: Plugin<'scatter'>[];
		refreshInterval?: number;
	} = $props();

	function createChart() {
		if (chart) {
			chart.destroy();
		}
		let datasets = Object.keys(data).map((category, i) => {
			return {
				...dataOptions[category],
				label: category,
				data: data[category]
			};
		});
		if (datasets.length === 0) {
			datasets = [
				{
					label: 'No data',
					data: []
				}
			];
		}
		chart = new Chart(canvas, {
			type: 'scatter',
			options: {
				...options,
				spanGaps: true
			},
			data: {
				datasets: datasets
			},
			plugins: plugins
		});
	}

	onMount(async () => {
		createChart();
		setInterval(() => {
			if (!chart) return;

			if (Object.keys(data).length === 0) {
				if (chart.data.datasets[0].data.length != 0) {
					chart.data.datasets[0].label = 'No data';
					chart.data.datasets[0].data = [];
					chart.update();
				}
				return;
			}

			//
			// <!--
			// 	This conditional statement checks if the number of datasets in the chart's data is less than the number of keys in the provided data object,
			// 	or if there is only one dataset and its data array is empty.
			// 	If either condition is true, it implies that the chart needs to be updated with new data.
			// -->
			if (
				chart.data.datasets.length < Object.keys(data).length ||
				(chart.data.datasets.length === 1 && chart.data.datasets[0].data.length === 0)
			) {
				chart.data.datasets = Object.keys(data).map((category, i) => {
					return {
						label: category,
						data: data[category]
					};
				});
			} else {
				chart.data.datasets.forEach((dataset, i) => {
					dataset.data = data[Object.keys(data)[i]];
				});
			}
			chart.update();
		}, refreshInterval);
	});
</script>

<div class="canvas-container m-2 h-full w-full rounded shadow shadow-blue-400">
	<canvas bind:this={canvas}></canvas>
</div>
