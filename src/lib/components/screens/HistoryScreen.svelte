<script lang="ts">
  import { fly } from 'svelte/transition';
  import { appState } from '$lib/app/appState.svelte';
  import { container } from '$lib/services/container';
  import type { MatchRecord } from '$lib/services/ports/MatchHistoryService';

  let records = $state<MatchRecord[]>(container.history.getAll());

  function formatDate(ts: number): string {
    const d = new Date(ts);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  }

  function modeLabel(mode: string): string {
    return mode === 'single' ? '1 Jogador' : '2 Jogadores';
  }

  function winnerText(record: MatchRecord): string {
    if (!record.winner) return 'Empate';
    if (record.winner === 'red') {
      return 'Vermelho venceu';
    }
    return 'Azul venceu';
  }

  function goBack(): void {
    appState.goHome();
  }
</script>

<div class="history">
  <button class="btn-back" onclick={goBack}>
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    Voltar
  </button>

  <h2 in:fly={{ y: -12, duration: 200, opacity: 0 }}>Histórico de Partidas</h2>

  {#if records.length === 0}
    <p class="empty" in:fly={{ y: 16, duration: 250, delay: 100, opacity: 0 }}>
      Nenhuma partida registrada ainda.
    </p>
  {:else}
    <div class="list" in:fly={{ y: 16, duration: 250, delay: 100, opacity: 0 }}>
      {#each records as record}
        <div class="record">
          <div class="record-header">
            <span class="mode">{modeLabel(record.mode)}</span>
            <span class="date">{formatDate(record.playedAt)}</span>
          </div>
          <div class="score-row">
            <span class="team-score red">
              <span class="team-dot red-dot"></span>
              {record.scoreRed}
            </span>
            <span class="vs">×</span>
            <span class="team-score blue">
              {record.scoreBlue}
              <span class="team-dot blue-dot"></span>
            </span>
          </div>
          <div class="winner-line">{winnerText(record)}</div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .history {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    width: 100%;
    max-width: 420px;
  }

  h2 {
    margin: 0;
    color: var(--ink);
    font-family: 'Ultra', serif;
    font-weight: 400;
    font-size: 1.6rem;
  }

  .empty {
    color: var(--cream-50);
    text-align: center;
    margin-top: 2rem;
    font-size: 1rem;
  }

  .list {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .record {
    background: var(--surface);
    border: 2px solid var(--border);
    border-radius: 10px;
    padding: 0.8rem 1rem;
  }

  .record-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.4rem;
  }

  .mode {
    font-weight: 600;
    font-size: 0.85rem;
    color: var(--wood-dk);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .date {
    font-size: 0.8rem;
    color: var(--cream-50);
  }

  .score-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.2rem;
    font-family: 'Ultra', serif;
    font-size: 1.8rem;
    color: var(--ink);
  }

  .team-score {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .team-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
  }
  .red-dot { background: var(--red); }
  .blue-dot { background: var(--blue); }

  .vs {
    color: var(--cream-50);
    font-family: 'Oswald', sans-serif;
    font-size: 1rem;
  }

  .winner-line {
    text-align: center;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--wood-dk);
    margin-top: 0.25rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
</style>
