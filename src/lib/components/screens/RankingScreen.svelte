<script lang="ts">
  import { fly } from 'svelte/transition';
  import { appState } from '$lib/app/appState.svelte';
  import { container } from '$lib/services/container';
  import type { RankingEntry } from '$lib/services/ports/RankingService';
  import ScreenLayout from '$lib/components/ui/ScreenLayout.svelte';
  import BackButton from '$lib/components/ui/BackButton.svelte';

  let rankings = $state<RankingEntry[]>(container.ranking.getRankings());

  function medal(rank: number): string {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  }
</script>

<ScreenLayout title="Ranking">
  {#snippet footer()}
    <BackButton />
  {/snippet}
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
</ScreenLayout>

<style>
  .list {
    width: 100%;
    max-width: 23.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .entry {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    background: var(--surface);
    border: 0.125rem solid var(--border);
    border-radius: 0.625rem;
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
    color: var(--ink);
  }

  .medal {
    font-size: 1.3rem;
  }

  .rank-num {
    font-size: 0.95rem;
  }

  .name {
    flex: 1;
    color: var(--ink);
    font-weight: 500;
  }

  .score {
    font-weight: 700;
    color: var(--ink);
    font-variant-numeric: tabular-nums;
  }

  .entry.is-player .name,
  .entry.is-player .score {
    color: var(--gold);
  }
</style>
