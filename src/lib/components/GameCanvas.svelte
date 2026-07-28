<script lang="ts">
	import { onMount } from 'svelte';
	import { GameClient, type GameMode, type GameState } from '$lib/game/GameClient';
	import type { TeamId } from '$lib/engine';

	let {
		mode,
		onstate,
		ongoal
	}: {
		mode: GameMode;
		onstate?: (state: GameState) => void;
		ongoal?: (scorer: TeamId) => void;
	} = $props();

	let canvas: HTMLCanvasElement;
	let client: GameClient | undefined;

	onMount(() => {
		client = new GameClient(canvas, {
			getMode: () => mode,
			onState: (state) => onstate?.(state),
			onGoal: (scorer) => ongoal?.(scorer)
		});
		client.start();
		return () => client?.stop();
	});

	export function restart(): void {
		client?.restart();
	}
</script>

<canvas bind:this={canvas}></canvas>
