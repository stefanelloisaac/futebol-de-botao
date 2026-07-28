<script lang="ts">
  import { onMount } from 'svelte';
  import { GameClient, type GameMode, type GameState } from '$lib/game/GameClient';
  import type { MatchConfig, TeamId } from '$lib/engine';

  let {
    mode,
    matchConfig,
    onstate,
    ongoal,
    onmatchend
  }: {
    mode: GameMode;
    matchConfig: MatchConfig;
    onstate?: (state: GameState) => void;
    ongoal?: (scorer: TeamId) => void;
    onmatchend?: (winner: TeamId) => void;
  } = $props();

  let canvas: HTMLCanvasElement;
  let client: GameClient | undefined;

  onMount(() => {
    client = new GameClient(canvas, {
      getMode: () => mode,
      matchConfig,
      onState: (state) => onstate?.(state),
      onGoal: (scorer) => ongoal?.(scorer),
      onMatchEnd: (winner) => onmatchend?.(winner)
    });
    client.start();
    return () => client?.stop();
  });

  export function restart(): void {
    client?.restart();
  }

  export function pause(): void {
    client?.pause();
  }

  export function resume(): void {
    client?.resume();
  }

  export function destroy(): void {
    client?.destroy();
  }
</script>

<canvas bind:this={canvas}></canvas>
