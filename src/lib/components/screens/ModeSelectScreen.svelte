<script lang="ts">
  import { fly } from 'svelte/transition';
  import { appState } from '$lib/app/appState.svelte';

  function selectSingle(): void {
    appState.startMatch('single');
  }

  function selectLocal(): void {
    appState.startMatch('local');
  }

  function goBack(): void {
    appState.goHome();
  }
</script>

<div class="mode-select">
  <h2 in:fly={{ y: -12, duration: 200, opacity: 0 }}>Modo de jogo</h2>

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
      <span class="desc">Mesmo aparelho</span>
    </button>
  </div>

  <button class="btn back" onclick={goBack}>Voltar</button>
</div>

<style>
  .mode-select {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 24px;
    height: 100%;
    padding: 24px;
  }

  h2 {
    font-family: 'Ultra', serif;
    font-weight: 400;
    font-size: 28px;
    color: var(--ink);
    margin: 0;
  }

  .modes {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    max-width: 300px;
  }

  .mode-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 22px 16px 18px;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    background: var(--cream);
    box-shadow: 0 3px 0 rgba(0,0,0,0.12);
    transition: transform 0.1s, box-shadow 0.1s, background 0.15s;
    font-family: 'Oswald', sans-serif;
  }
  .mode-card:hover {
    background: #ede0c0;
  }
  .mode-card:active {
    transform: translateY(3px);
    box-shadow: 0 1px 0 rgba(0,0,0,0.12);
  }

  .mode-card .icon {
    margin-bottom: 4px;
  }

  .mode-card .label {
    font-weight: 600;
    font-size: 22px;
    color: var(--ink);
  }

  .mode-card .desc {
    font-size: 14px;
    color: var(--wood-dk);
    font-weight: 400;
  }

  .btn.back {
    font-family: 'Oswald', sans-serif;
    font-weight: 500;
    font-size: 18px;
    padding: 10px 30px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    background: transparent;
    color: var(--wood-dk);
    border: 1.5px solid var(--wood-lt);
    transition: background 0.15s, color 0.15s;
  }
  .btn.back:hover {
    background: var(--cream);
    color: var(--ink);
  }
</style>
