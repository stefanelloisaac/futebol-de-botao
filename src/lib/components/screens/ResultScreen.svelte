<script lang="ts">
  import { fly, scale } from 'svelte/transition';
  import { appState } from '$lib/app/appState.svelte';
  import type { TeamId } from '$lib/engine';

  let result = $derived(appState.lastResult);
  let winnerName = $derived(result ? appState.teamNames[result.winner] : '');
  let winnerColor = $derived(result?.winner === 'red' ? 'red' : 'blue');

  function rematch(): void {
    appState.rematch();
  }

  function goHome(): void {
    appState.goHome();
  }
</script>

<div class="screen">
  <div class="screen-body">
    <h2 in:fly={{ y: -16, duration: 250, opacity: 0 }}>Fim de jogo!</h2>

    {#if result}
      <div class={`winner ${winnerColor}`} in:scale={{ duration: 350, delay: 150, start: 0.7, opacity: 0 }}>
        <span class="trophy">
          <svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true">
            <path d="M12 6v4c0 4-2 8-6 10v2c0 4 4 8 8 8h20c4 0 8-4 8-8v-2c-4-2-6-6-6-10V6H12z" fill="#d9a441" stroke="#b8860b" stroke-width="1.5"/>
            <rect x="17" y="28" width="14" height="4" rx="1" fill="#2a231b"/>
            <rect x="14" y="32" width="20" height="3" rx="1" fill="#2a231b"/>
            <rect x="19" y="35" width="10" height="8" rx="1" fill="#7a4d2b" stroke="#5c3820" stroke-width="0.8"/>
          </svg>
        </span>
        <span class="name">{winnerName}</span>
        <span class="venceu">venceu!</span>
      </div>

      <div class="score" in:fly={{ y: 16, duration: 300, delay: 300, opacity: 0 }}>
        <div class="team-score red">
          <span class="name">{appState.teamNames.red}</span>
          <span class="goals">{result.scoreRed}</span>
        </div>
        <span class="sep">×</span>
        <div class="team-score blue">
          <span class="name">{appState.teamNames.blue}</span>
          <span class="goals">{result.scoreBlue}</span>
        </div>
      </div>
    {/if}

    <div class="actions" in:fly={{ y: 16, duration: 300, delay: 450, opacity: 0 }}>
      <button class="btn-primary" onclick={rematch}>Revanche</button>
      <button class="btn-secondary" onclick={goHome}>Menu</button>
    </div>
  </div>
</div>

<style>
  .screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    min-height: 0;
    width: 100%;
    max-width: 440px;
    padding: 24px;
  }

  .screen-body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 24px;
  }

  h2 {
    font-family: 'Ultra', serif;
    font-weight: 400;
    font-size: 32px;
    color: var(--ink);
    margin: 0;
  }

  .winner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
  .winner .trophy { margin-bottom: 4px; }

  .winner .name {
    font-family: 'Ultra', serif;
    font-weight: 400;
    font-size: 28px;
    color: var(--ink);
  }
  .winner .venceu {
    font-family: 'Oswald', sans-serif;
    font-size: 18px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 2px;
  }
  .winner.red .venceu { color: var(--red); }
  .winner.blue .venceu { color: var(--blue); }

  .score {
    display: flex;
    align-items: center;
    gap: 16px;
    background: var(--paper);
    padding: 14px 28px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  }

  .team-score {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }
  .team-score .name {
    font-family: 'Oswald', sans-serif;
    font-size: 13px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--wood-dk);
  }
  .team-score .goals {
    font-family: 'Ultra', serif;
    font-weight: 400;
    font-size: 36px;
    line-height: 1;
    color: var(--ink);
  }
  .team-score.red .goals { color: var(--red); }
  .team-score.blue .goals { color: var(--blue); }

  .sep {
    font-family: 'Ultra', serif;
    font-size: 30px;
    color: var(--wood-lt);
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    max-width: 260px;
  }
</style>
