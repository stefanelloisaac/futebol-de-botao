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

  <div class="stage" class:shake={shaking}>
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
    <div class="gol" class:show={golShow} class:red={golScorer === 'red'} class:blue={golScorer === 'blue'}>
      <span class="gol-text">GOL!</span>
      <span class="gol-sparkles"></span>
    </div>
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
    transform: scale(0.4);
    transition: opacity 0.15s, transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .gol.show {
    opacity: 1;
    transform: scale(1);
  }

  .gol-text {
    font-family: 'Ultra', serif;
    font-weight: 400;
    font-size: clamp(48px, 18vw, 80px);
    color: var(--mustard);
    text-shadow:
      0 2px 0 #5c3820,
      0 4px 0 #3d2a14,
      0 0 30px rgba(217, 164, 65, 0.4);
    animation: golPulse 0.8s ease-in-out infinite alternate;
  }

  .gol.red .gol-text {
    color: var(--red);
    text-shadow:
      0 2px 0 #5c1a16,
      0 4px 0 #3a0e0b,
      0 0 30px rgba(178, 58, 52, 0.4);
  }

  .gol.blue .gol-text {
    color: var(--blue);
    text-shadow:
      0 2px 0 #14273d,
      0 4px 0 #0a1523,
      0 0 30px rgba(47, 75, 115, 0.4);
  }

  @keyframes golPulse {
    from { transform: scale(1); }
    to { transform: scale(1.08); }
  }

  .gol-sparkles {
    position: absolute;
    inset: -20px;
    background:
      radial-gradient(circle at 30% 40%, rgba(217, 164, 65, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 70% 60%, rgba(217, 164, 65, 0.2) 0%, transparent 50%),
      radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.15) 0%, transparent 40%);
    animation: sparkleRotate 2s linear infinite;
  }

  .gol.red .gol-sparkles {
    background:
      radial-gradient(circle at 30% 40%, rgba(200, 60, 50, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 70% 60%, rgba(200, 60, 50, 0.2) 0%, transparent 50%),
      radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.15) 0%, transparent 40%);
  }

  .gol.blue .gol-sparkles {
    background:
      radial-gradient(circle at 30% 40%, rgba(60, 90, 140, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 70% 60%, rgba(60, 90, 140, 0.2) 0%, transparent 50%),
      radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.15) 0%, transparent 40%);
  }

  @keyframes sparkleRotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .ctrls {
    display: flex;
    justify-content: center;
    padding: 8px;
    flex-shrink: 0;
  }

  .btn.pause-btn {
    font-family: 'Oswald', sans-serif;
    font-weight: 600;
    font-size: 18px;
    padding: 6px 28px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    background: var(--cream);
    color: var(--ink);
    box-shadow: 0 2px 0 rgba(0,0,0,0.1);
    transition: transform 0.08s, box-shadow 0.08s;
  }
  .btn.pause-btn:active {
    transform: translateY(2px);
    box-shadow: 0 0 0 rgba(0,0,0,0.1);
  }
</style>
