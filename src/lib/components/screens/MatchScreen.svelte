<script lang="ts">
  import { tick } from 'svelte';
  import { appState } from '$lib/app/appState.svelte';
  import type { MatchResult } from '$lib/app/appState.svelte';
  import Scoreboard from '$lib/components/Scoreboard.svelte';
  import GameCanvas from '$lib/components/GameCanvas.svelte';
  import PauseOverlay from '$lib/components/screens/PauseOverlay.svelte';
  import type { GameState, GameMode } from '$lib/game/GameClient';
  import type { MatchConfig, TeamId } from '$lib/engine';

  let scoreRed = $state(0);
  let scoreBlue = $state(0);
  let activeTeam = $state<TeamId>('red');
  let paused = $state(false);

  let golShow = $state(false);
  let shaking = $state(false);

  let game: GameCanvas;
  let mode = $state<GameMode>(appState.mode);
  let matchConfig = $state<MatchConfig>(appState.matchConfig);

  function handleState(state: GameState): void {
    scoreRed = state.scoreRed;
    scoreBlue = state.scoreBlue;
    activeTeam = state.activeTeam;
  }

  async function handleGoal(): Promise<void> {
    golShow = false;
    shaking = false;
    await tick();
    golShow = true;
    shaking = true;
    setTimeout(() => {
      golShow = false;
      shaking = false;
    }, 1400);
  }

  function handleMatchEnd(winner: TeamId): void {
    const result: MatchResult = {
      scoreRed,
      scoreBlue,
      winner
    };
    appState.endMatch(result);
  }

  function togglePause(): void {
    paused = !paused;
    if (paused) {
      game?.pause();
    } else {
      game?.resume();
    }
  }

  function handlePauseContinue(): void {
    paused = false;
    game?.resume();
  }

  function handlePauseRestart(): void {
    paused = false;
    game?.restart();
    scoreRed = 0;
    scoreBlue = 0;
    activeTeam = 'red';
    golShow = false;
    shaking = false;
  }

  function handlePauseMenu(): void {
    paused = false;
    game?.destroy();
    appState.goHome();
  }
</script>

<div class="match-screen">
  <Scoreboard {scoreRed} {scoreBlue} {activeTeam} />

  <div class="stage" class:shake={shaking}>
    <GameCanvas
      bind:this={game}
      {mode}
      {matchConfig}
      onstate={handleState}
      ongoal={handleGoal}
      onmatchend={handleMatchEnd}
    />
    <div class="gol" class:show={golShow}><span>GOL!</span></div>
  </div>

  <div class="ctrls">
    <button class="btn pause-btn" onclick={togglePause}>
      {paused ? '▶' : '⏸'}
    </button>
  </div>
</div>

{#if paused}
  <PauseOverlay
    oncontinue={handlePauseContinue}
    onrestart={handlePauseRestart}
    onmenu={handlePauseMenu}
  />
{/if}

<style>
  .match-screen {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .stage {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  .stage :global(canvas) {
    display: block;
    max-width: 100%;
    max-height: 100%;
  }

  .stage.shake {
    animation: shake 0.6s ease-in-out;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10% { transform: translateX(-4px); }
    30% { transform: translateX(4px); }
    50% { transform: translateX(-3px); }
    70% { transform: translateX(3px); }
    90% { transform: translateX(-1px); }
  }

  .gol {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.12s;
  }
  .gol.show {
    opacity: 1;
  }
  .gol span {
    font-family: 'Ultra', serif;
    font-size: clamp(60px, 18vw, 100px);
    color: var(--mustard);
    text-shadow:
      2px 2px 0 rgba(0,0,0,0.4),
      0 0 40px rgba(217, 164, 65, 0.5);
    animation: pulse 0.4s ease-out;
  }
  @keyframes pulse {
    0% { transform: scale(2); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }

  .ctrls {
    flex: 0 0 auto;
    display: flex;
    justify-content: center;
    padding: 8px;
  }

  .btn {
    font-family: 'Oswald', sans-serif;
    font-weight: 600;
    font-size: 18px;
    padding: 8px 20px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    background: var(--cream);
    color: var(--ink);
    box-shadow: 0 3px 0 rgba(0,0,0,0.12);
    transition: transform 0.08s, box-shadow 0.08s;
  }
  .btn:active {
    transform: translateY(2px);
    box-shadow: 0 1px 0 rgba(0,0,0,0.12);
  }

  .pause-btn {
    font-size: 24px;
    width: 50px;
    height: 50px;
    padding: 0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
