<script lang="ts">
  import { fly } from 'svelte/transition';
  import { appState } from '$lib/app/appState.svelte';
  import { container } from '$lib/services/container';
  import type { RankingEntry } from '$lib/services/ports/RankingService';

  let rankings = $state<RankingEntry[]>(container.ranking.getRankings());

  function goBack(): void {
    appState.goHome();
  }

  function medal(rank: number): string {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  }
</script>

<div class="ranking">
  <button class="back" onclick={goBack}>
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    Voltar
  </button>

  <h2 in:fly={{ y: -12, duration: 200, opacity: 0 }}>Ranking</h2>

  <div class="list" in:fly={{ y: 16, duration: 250, delay: 100, opacity: 0 }}>
    {#each rankings as entry, i}
      <div class="entry" class:is-player={entry.playerId === 'player'}>
        <span class="rank">
          {#if i < 3}
            <span class="medal">{medal(entry.rank)}</span>
          {:else}
            <span class="rank-num">{entry.rank}º</span>
          {/if}
        </span>
        <span class="name">{entry.name}</span>
        <span class="score">{entry.score}</span>
      </div>
    {/each}
  </div>
</div>

<style>
  .ranking {
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

  .list {
    width: 100%;
    max-width: 380px;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .entry {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 0.7rem 1rem;
  }

  .entry.is-player {
    border-color: var(--gold);
    background: rgba(217, 164, 65, 0.08);
  }

  .rank {
    width: 2.2rem;
    text-align: center;
    font-weight: 700;
    color: var(--cream);
  }

  .medal {
    font-size: 1.3rem;
  }

  .rank-num {
    font-size: 0.95rem;
  }

  .name {
    flex: 1;
    color: var(--cream);
    font-weight: 500;
  }

  .score {
    font-weight: 700;
    color: var(--cream);
    font-variant-numeric: tabular-nums;
  }

  .entry.is-player .name,
  .entry.is-player .score {
    color: var(--gold);
  }
</style>
