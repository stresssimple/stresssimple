<script lang="ts">
	import bg from '../bg.jpg';
</script>

<div style="background-image: url({bg})" class="bg-image h-screen w-full">
	<div class="container flex h-full w-full items-center justify-around">
		<div
			class="m-4 flex w-1/2 flex-col items-center rounded-lg border-2 bg-white/90 p-8 shadow-2xl"
		>
			<h1 class="m-2 p-4 text-3xl">Stress JS</h1>
			<p class="text-lg italic">Stress testing made simple.</p>
		</div>
	</div>
</div>

<style lang="postcss">
	@reference "../app.css";
	.bg-image {
		@apply h-screen bg-cover bg-center;
	}
</style>
