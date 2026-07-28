<script lang="ts">
  import { onMount } from 'svelte';
  import { GameClient, type GameMode, type GameState } from '$lib/game/GameClient';
  import type { MatchConfig, TeamId } from '$lib/engine';

  let {
    mode,
    matchConfig,
    onstate,
    ongoal,
    onmatchend,
    onshot,
    oncollision
  }: {
    mode: GameMode;
    matchConfig: MatchConfig;
    onstate?: (state: GameState) => void;
    ongoal?: (scorer: TeamId) => void;
    onmatchend?: (winner: TeamId) => void;
    onshot?: (team: TeamId) => void;
    oncollision?: () => void;
  } = $props();

  let canvas: HTMLCanvasElement;
  let client: GameClient | undefined;

  onMount(() => {
    client = new GameClient(canvas, {
      getMode: () => mode,
      matchConfig,
      onState: (state) => onstate?.(state),
      onGoal: (scorer) => ongoal?.(scorer),
      onMatchEnd: (winner) => onmatchend?.(winner),
      onShot: (team) => onshot?.(team),
      onCollision: () => oncollision?.()
    });
    client.start();
    return () => client?.destroy();
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

  export function getTotalShots(): number {
    return client?.totalShots ?? 0;
  }
</script>

<canvas bind:this={canvas}></canvas>

<style>
  canvas {
    display: block;
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
  }
</style>
