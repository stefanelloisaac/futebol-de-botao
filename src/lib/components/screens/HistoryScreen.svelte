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
  <button class="back" onclick={goBack}>
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
  }

  .back {
    align-self: flex-start;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--cream);
    padding: 0.5rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .back:hover {
    background: var(--surface-hover);
  }

  h2 {
    margin: 0;
    color: var(--cream);
    font-size: 1.5rem;
  }

  .empty {
    color: var(--cream-50);
    text-align: center;
    margin-top: 2rem;
  }

  .list {
    width: 100%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .record {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 0.8rem 1rem;
  }

  .record-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.4rem;
  }

  .mode {
    font-size: 0.8rem;
    color: var(--cream-50);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .date {
    font-size: 0.75rem;
    color: var(--cream-50);
  }

  .score-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    font-size: 1.4rem;
    font-weight: 700;
  }

  .team-score {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .team-score.red {
    color: var(--red);
  }

  .team-score.blue {
    color: var(--blue);
  }

  .team-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
  }

  .red-dot {
    background: var(--red);
  }

  .blue-dot {
    background: var(--blue);
  }

  .vs {
    color: var(--cream-50);
    font-weight: 400;
  }

  .winner-line {
    text-align: center;
    font-size: 0.8rem;
    color: var(--cream-50);
    margin-top: 0.2rem;
  }
</style>
