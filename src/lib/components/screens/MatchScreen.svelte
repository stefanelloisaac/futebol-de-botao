<script lang="ts">
  import { tick } from 'svelte';
  import { appState } from '$lib/app/appState.svelte';
  import type { MatchResult } from '$lib/app/appState.svelte';
  import Scoreboard from '$lib/components/Scoreboard.svelte';
  import GameCanvas from '$lib/components/GameCanvas.svelte';
  import PauseOverlay from '$lib/components/screens/PauseOverlay.svelte';
  import type { GameState, GameMode } from '$lib/game/GameClient';
  import type { MatchConfig, TeamId } from '$lib/engine';
  import { container } from '$lib/services/container';

  let scoreRed = $state(0);
  let scoreBlue = $state(0);
  let activeTeam = $state<TeamId>('red');
  let paused = $state(false);
  let started = $state(false);

  let golShow = $state(false);
  let golScorer = $state<TeamId | null>(null);
  let shaking = $state(false);
  let golFlash = $state<'red' | 'blue' | null>(null);

  let game: GameCanvas;
  let mode = $state<GameMode>(appState.mode);
  let matchConfig = $state<MatchConfig>(appState.matchConfig);

  const sound = container.sound;
  const settings = container.settings;

  function handleState(state: GameState): void {
    scoreRed = state.scoreRed;
    scoreBlue = state.scoreBlue;
    activeTeam = state.activeTeam;

    if (!started && state.phase === 'aim') {
      started = true;
      if (settings.getSoundEnabled()) {
        sound.play('whistle_start');
      }
      sound.startAmbient();
    }
  }

  async function handleGoal(scorer: TeamId): Promise<void> {
    golShow = false;
    shaking = false;
    golFlash = null;
    golScorer = null;
    await tick();

    if (settings.getSoundEnabled()) {
      sound.play('goal');
    }

    if (settings.getVibrationEnabled() && navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 200]);
    }

    golScorer = scorer;
    golShow = true;
    golFlash = scorer;
    shaking = true;
    setTimeout(() => {
      golShow = false;
      golFlash = null;
      shaking = false;
    }, 1600);
  }

  function handleMatchEnd(winner: TeamId): void {
    const result: MatchResult = {
      scoreRed,
      scoreBlue,
      winner
    };

    // Record total shots for stats before ending the match
    appState.lastShots = game?.getTotalShots() ?? 0;

    if (settings.getSoundEnabled()) {
      sound.play('whistle_end');
    }
    sound.stopAmbient();

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
    golFlash = null;
    shaking = false;
    started = false;

    if (settings.getSoundEnabled()) {
      sound.play('whistle_start');
    }
  }

  function handlePauseMenu(): void {
    paused = false;
    game?.destroy();
    sound.stopAmbient();
    appState.goHome();
  }

  function handleShot(): void {
    if (settings.getSoundEnabled()) {
      sound.play('shot');
    }
  }

  function handleCollision(): void {
    if (settings.getSoundEnabled()) {
      sound.play('collision');
    }
    if (settings.getVibrationEnabled() && navigator.vibrate) {
      navigator.vibrate(30);
    }
  }
</script>

<div class="match-screen">
  <Scoreboard {scoreRed} {scoreBlue} {activeTeam} {golFlash} />

  <div class="field-wrap" class:shaking>
    <GameCanvas
      bind:this={game}
      {mode}
      {matchConfig}
      onstate={handleState}
      ongoal={handleGoal}
      onmatchend={handleMatchEnd}
      onshot={handleShot}
      oncollision={handleCollision}
    />

    {#if paused}
      <PauseOverlay
        oncontinue={handlePauseContinue}
        onrestart={handlePauseRestart}
        onmenu={handlePauseMenu}
      />
    {/if}
  </div>

  <button class="pause-btn" onclick={togglePause} aria-label={paused ? 'Continuar' : 'Pausar'}>
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor"/>
      <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor"/>
    </svg>
  </button>
</div>

<style>
  .match-screen {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    width: 100%;
    position: relative;
  }

  .field-wrap {
    flex: 1;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    position: relative;
    overflow: hidden;
  }

  .field-wrap.shaking {
    animation: shake 0.3s ease;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-4px); }
    50% { transform: translateX(4px); }
    75% { transform: translateX(-3px); }
  }

  .pause-btn {
    position: absolute;
    bottom: 14px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--ink);
    border: none;
    color: var(--mustard);
    width: 48px;
    height: 48px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.25);
    z-index: 5;
  }

  .pause-btn:active {
    transform: translateX(-50%) scale(0.93);
  }
</style>
