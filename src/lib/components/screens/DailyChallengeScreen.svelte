<script lang="ts">
  import { fly } from 'svelte/transition';
  import { appState } from '$lib/app/appState.svelte';
  import { container } from '$lib/services/container';
  import type { DailyChallenge } from '$lib/services/ports/DailyChallengeService';

  let challenge = $state<DailyChallenge>(container.daily.getTodayChallenge());
  let difficultyLabel = $derived(
    challenge.config.difficulty === 'hard' ? 'Difícil' :
    challenge.config.difficulty === 'medium' ? 'Médio' : 'Fácil'
  );

  function playChallenge(): void {
    appState.startMatch('single', {
      targetGoals: challenge.config.targetGoals,
      difficulty: 'hard'
    });
  }

  function goBack(): void {
    appState.goHome();
  }
</script>

<div class="daily">
  <button class="btn-back" onclick={goBack}>
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    Voltar
  </button>

  <h2 in:fly={{ y: -12, duration: 200, opacity: 0 }}>Desafio Diário</h2>

  <div class="card" in:fly={{ y: 16, duration: 250, delay: 100, opacity: 0 }}>
    <div class="card-icon">
      <svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true">
        <path d="M12 6v4c0 4-2 8-6 10v2c0 4 4 8 8 8h20c4 0 8-4 8-8v-2c-4-2-6-6-6-10V6H12z" fill="#d9a441" stroke="#b8860b" stroke-width="1.5"/>
        <rect x="17" y="28" width="14" height="4" rx="1" fill="#2a231b"/>
        <rect x="14" y="32" width="20" height="3" rx="1" fill="#2a231b"/>
        <rect x="19" y="35" width="10" height="8" rx="1" fill="#7a4d2b" stroke="#5c3820" stroke-width="0.8"/>
      </svg>
    </div>

    <p class="desc">Vença uma partida no modo difícil com condições especiais.</p>

    <div class="info">
      <span class="info-item">
        <span class="info-label">Meta</span>
        <span class="info-value">{challenge.config.targetGoals} gols</span>
      </span>
      <span class="info-item">
        <span class="info-label">Dificuldade</span>
        <span class="info-value">{difficultyLabel}</span>
      </span>
    </div>

    {#if challenge.completed && challenge.bestResult}
      <div class="best-result">
        <span class="best-label">Melhor resultado:</span>
        <span class="best-score">
          {challenge.bestResult.scoreRed} × {challenge.bestResult.scoreBlue}
        </span>
      </div>
    {/if}
  </div>

  <button class="btn-primary" onclick={playChallenge} in:fly={{ y: 16, duration: 250, delay: 200, opacity: 0 }}>
    Jogar Desafio
  </button>
</div>

<style>
  .daily {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    width: 100%;
    max-width: 400px;
  }

  h2 {
    margin: 0;
    color: var(--ink);
    font-family: 'Ultra', serif;
    font-weight: 400;
    font-size: 1.6rem;
  }

  .card {
    background: var(--surface);
    border: 2px solid var(--border);
    border-radius: 14px;
    padding: 1.5rem;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .card-icon {
    margin-bottom: 0.25rem;
  }

  .desc {
    margin: 0;
    text-align: center;
    color: var(--ink);
    font-size: 0.95rem;
    line-height: 1.4;
  }

  .info {
    display: flex;
    gap: 1.5rem;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
  }

  .info-label {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--cream-50);
  }

  .info-value {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--ink);
  }

  .best-result {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
    padding: 0.6rem 1rem;
    background: var(--mustard);
    border-radius: 8px;
    width: 100%;
  }

  .best-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--ink);
    opacity: 0.7;
  }

  .best-score {
    font-family: 'Ultra', serif;
    font-size: 1.4rem;
    color: var(--ink);
  }
</style>
