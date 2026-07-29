<script lang="ts">
  import { onDestroy, tick } from 'svelte';
  import { appState } from '$lib/app/appState.svelte';
  import Scoreboard from '$lib/components/Scoreboard.svelte';
  import GameCanvas from '$lib/components/GameCanvas.svelte';
  import PauseOverlay from '$lib/components/screens/PauseOverlay.svelte';
  import type { GameState, GameMode } from '$lib/game/GameClient';
  import type { MatchConfig, MatchEndResult, TeamId } from '$lib/engine';
  import { container } from '$lib/services/container';

  let scoreRed = $state(0);
  let scoreBlue = $state(0);
  let activeTeam = $state<TeamId>('red');
  let paused = $state(false);
  let started = $state(false);

  let goalTimeoutId: ReturnType<typeof setTimeout> | null = null;
  let shaking = $state(false);
  let golFlash = $state<'red' | 'blue' | null>(null);
  let goalHistory = $state<TeamId[]>([]);

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

  function clearGoalAnimation(): void {
    if (goalTimeoutId !== null) clearTimeout(goalTimeoutId);
    goalTimeoutId = null;
    golFlash = null;
    shaking = false;
  }

  async function handleGoal(scorer: TeamId): Promise<void> {
    clearGoalAnimation();
    await tick();

    if (settings.getSoundEnabled()) {
      sound.play('goal');
    }

    if (settings.getVibrationEnabled() && navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 200]);
    }

    golFlash = scorer;
    shaking = true;
    goalHistory = [...goalHistory, scorer];
    goalTimeoutId = setTimeout(() => {
      goalTimeoutId = null;
      golFlash = null;
      shaking = false;
    }, 1600);
  }

  function handleMatchEnd(result: MatchEndResult): void {

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
    // Resetar a UI antes de reativar o loop; handleState é a fonte única do apito.
    paused = false;
    scoreRed = 0;
    scoreBlue = 0;
    activeTeam = 'red';
    clearGoalAnimation();
    started = false;
    goalHistory = [];
    game?.restart();
  }

  onDestroy(() => {
    clearGoalAnimation();
  });

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
  <!-- Top bar: pause button + scoreboard (OUTSIDE canvas) -->
  <div class="match-topbar">
    <button class="pause-btn" onclick={togglePause} aria-label={paused ? 'Continuar' : 'Pausar'}>
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor"/>
        <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor"/>
      </svg>
    </button>

    <Scoreboard {scoreRed} {scoreBlue} {activeTeam} {golFlash} {goalHistory} />
  </div>

  <!-- Canvas area (untouched, full remaining space) -->
  <div class="field-area" class:shaking>
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
</div>

<style>
  .match-screen {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    width: 100%;
  }

  .match-topbar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.5rem;
    min-height: 3rem;
    flex-shrink: 0;
    background: linear-gradient(180deg, var(--wood-lt), var(--wood-dk));
    border-bottom: 0.125rem solid var(--ink);
    box-shadow: 0 0.125rem 0.25rem rgba(0,0,0,0.2);
  }

  .pause-btn {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: var(--ink);
    border: none;
    color: var(--mustard);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding: 0;
    transition: transform 0.08s;
  }
  .pause-btn:active {
    transform: scale(0.9);
  }

  .field-area {
    flex: 1;
    min-height: 0;
    min-width: 0;
    position: relative;
    display: flex;
    overflow: hidden;
  }

  .field-area.shaking {
    animation: shake 0.3s ease;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-0.25rem); }
    50% { transform: translateX(0.25rem); }
    75% { transform: translateX(-0.1875rem); }
  }

  @media (min-width: 48em) {
    .match-screen {
      max-width: 62.5rem;
      margin-inline: auto;
    }
  }

  @media (max-width: 23.75em) {
    .match-topbar {
      gap: 0.25rem;
      padding: 0.25rem 0.375rem;
      min-height: 2.625rem;
    }
    .pause-btn {
      width: 1.75rem;
      height: 1.75rem;
    }
  }
</style>
