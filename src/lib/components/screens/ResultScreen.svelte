<script lang="ts">
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

<div class="result">
  <h2>Fim de jogo!</h2>

  {#if result}
    <div class={`winner ${winnerColor}`}>
      <span class="trophy">🏆</span>
      <span class="name">{winnerName}</span>
      <span class="venceu">venceu!</span>
    </div>

    <div class="score">
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

  <div class="actions">
    <button class="btn primary" onclick={rematch}>Revanche</button>
    <button class="btn" onclick={goHome}>Menu</button>
  </div>
</div>

<style>
  .result {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    height: 100%;
    padding: 24px;
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
  .winner .trophy {
    font-size: 54px;
  }
  .winner .name {
    font-family: 'Ultra', serif;
    font-size: 36px;
    font-weight: 400;
  }
  .winner.red .name { color: var(--red); }
  .winner.blue .name { color: var(--blue); }
  .winner .venceu {
    font-family: 'Oswald', sans-serif;
    font-size: 18px;
    color: var(--wood-dk);
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .score {
    display: flex;
    align-items: center;
    gap: 16px;
    background: var(--paper);
    border-radius: 10px;
    padding: 16px 28px;
  }
  .team-score {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }
  .team-score .name {
    font-size: 14px;
    color: var(--wood-dk);
  }
  .team-score .goals {
    font-family: 'Ultra', serif;
    font-size: 42px;
    font-weight: 400;
  }
  .team-score.red .goals { color: var(--red); }
  .team-score.blue .goals { color: var(--blue); }
  .sep {
    font-family: 'Ultra', serif;
    font-size: 32px;
    color: var(--wood-dk);
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    max-width: 260px;
  }

  .btn {
    font-family: 'Oswald', sans-serif;
    font-weight: 600;
    font-size: 20px;
    padding: 14px 0;
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
  .btn.primary {
    background: var(--mustard);
    color: #fff;
  }
</style>
