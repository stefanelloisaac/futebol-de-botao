<script lang="ts">
  import { fly } from 'svelte/transition';
  import { appState } from '$lib/app/appState.svelte';
  import type { Difficulty } from '$lib/engine';

  let selectedDifficulty = $state<Difficulty>('medium');

  function selectSingle(): void {
    appState.startMatch('single', { targetGoals: 3, difficulty: selectedDifficulty });
  }

  function selectLocal(): void {
    appState.startMatch('local', { targetGoals: 3 });
  }

  function selectDaily(): void {
    appState.goToScreen('daily-challenge');
  }

  function goBack(): void {
    appState.goHome();
  }

  function difficultyLabel(d: Difficulty): string {
    switch (d) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Médio';
      case 'hard': return 'Difícil';
    }
  }
</script>

<div class="screen">
  <h2 in:fly={{ y: -12, duration: 200, opacity: 0 }}>Modo de jogo</h2>

  <div class="screen-body">
    <div class="modes" in:fly={{ y: 16, duration: 250, delay: 100, opacity: 0 }}>
      <button class="mode-card" onclick={selectSingle}>
        <span class="icon">
          <svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true">
            <rect x="4" y="8" width="40" height="32" rx="4" fill="var(--felt)" stroke="var(--wood-dk)" stroke-width="1.5"/>
            <circle cx="24" cy="24" r="10" fill="var(--cream)" stroke="var(--ink)" stroke-width="1"/>
            <circle cx="24" cy="24" r="6" fill="var(--red)" opacity="0.9"/>
            <text x="24" y="27" text-anchor="middle" fill="var(--cream)" font-size="7" font-family="sans-serif" font-weight="bold">IA</text>
          </svg>
        </span>
        <span class="label">1 Jogador</span>
        <span class="desc">Vs. IA</span>
      </button>
      <button class="mode-card" onclick={selectLocal}>
        <span class="icon">
          <svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true">
            <rect x="4" y="8" width="40" height="32" rx="4" fill="var(--felt)" stroke="var(--wood-dk)" stroke-width="1.5"/>
            <circle cx="16" cy="24" r="7" fill="#b23a34" stroke="var(--cream)" stroke-width="1"/>
            <circle cx="32" cy="24" r="7" fill="#2f4b73" stroke="var(--cream)" stroke-width="1"/>
            <text x="16" y="27" text-anchor="middle" fill="var(--cream)" font-size="6" font-family="sans-serif" font-weight="bold">1</text>
            <text x="32" y="27" text-anchor="middle" fill="var(--cream)" font-size="6" font-family="sans-serif" font-weight="bold">2</text>
          </svg>
        </span>
        <span class="label">2 Jogadores</span>
        <span class="desc">Local</span>
      </button>
      <button class="mode-card daily" onclick={selectDaily}>
        <span class="icon">
          <svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true">
            <path d="M12 6v4c0 4-2 8-6 10v2c0 4 4 8 8 8h20c4 0 8-4 8-8v-2c-4-2-6-6-6-10V6H12z" fill="#d9a441" stroke="#b8860b" stroke-width="1.5"/>
            <rect x="17" y="26" width="14" height="4" rx="1" fill="#2a231b"/>
            <rect x="14" y="30" width="20" height="3" rx="1" fill="#2a231b"/>
          </svg>
        </span>
        <span class="label">Desafio Diário</span>
        <span class="desc">Difícil</span>
      </button>
    </div>

    <div class="difficulty-section" in:fly={{ y: 16, duration: 250, delay: 200, opacity: 0 }}>
      <p class="diff-label">Dificuldade da IA (1 Jogador):</p>
      <div class="diff-buttons">
        {#each ['easy', 'medium', 'hard'] as d}
          <button
            class="diff-btn"
            class:selected={selectedDifficulty === d}
            onclick={() => selectedDifficulty = d as Difficulty}
          >
            {difficultyLabel(d as Difficulty)}
          </button>
        {/each}
      </div>
    </div>
  </div>

  <button class="btn-back" onclick={goBack}>
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    Voltar
  </button>
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
    gap: 24px;
  }

  h2 {
    font-family: 'Ultra', serif;
    font-weight: 400;
    font-size: 28px;
    color: var(--ink);
    margin: 0;
    flex-shrink: 0;
  }

  .screen-body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
  }

  .modes {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    max-width: 300px;
  }

  .mode-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    min-height: 52px;
    border: 2px solid var(--ink);
    border-radius: 10px;
    background: var(--cream);
    cursor: pointer;
    transition: transform 0.08s, box-shadow 0.08s;
    text-align: left;
    width: 100%;
  }
  .mode-card:active {
    transform: translateY(2px);
    box-shadow: none;
  }
  .mode-card.daily {
    border-color: var(--mustard);
    background: linear-gradient(135deg, var(--cream), #f0e0b8);
  }

  .icon {
    flex: 0 0 40px;
  }

  .label {
    font-family: 'Oswald', sans-serif;
    font-weight: 600;
    font-size: 18px;
    color: var(--ink);
    display: block;
  }

  .desc {
    font-family: 'Oswald', sans-serif;
    font-size: 13px;
    color: var(--wood-dk);
    display: block;
  }

  .difficulty-section {
    width: 100%;
    max-width: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .diff-label {
    font-family: 'Oswald', sans-serif;
    font-size: 14px;
    color: var(--wood-dk);
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .diff-buttons {
    display: flex;
    gap: 8px;
  }

  .diff-btn {
    font-family: 'Oswald', sans-serif;
    font-weight: 600;
    font-size: 15px;
    padding: 8px 18px;
    min-height: 44px;
    border: 2px solid var(--ink);
    border-radius: 8px;
    background: var(--cream);
    color: var(--ink);
    cursor: pointer;
    transition: background 0.12s, color 0.12s;
  }
  .diff-btn.selected {
    background: var(--mustard);
    border-color: var(--mustard);
    color: var(--ink);
  }
  .diff-btn:hover { background: var(--paper); }
  .diff-btn.selected:hover { background: var(--mustard); }
</style>
