<script lang="ts">
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
  <h2>Modo de jogo</h2>

  <div class="modes">
    <button class="mode-card" onclick={selectSingle}>
      <span class="icon">🤖</span>
      <span class="label">1 Jogador</span>
      <span class="desc">Vs. IA</span>
    </button>

    <button class="mode-card" onclick={selectLocal}>
      <span class="icon">👥</span>
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
    padding: 24px 16px;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    background: var(--cream);
    box-shadow: 0 3px 0 rgba(0,0,0,0.12);
    transition: transform 0.08s, box-shadow 0.08s;
    font-family: 'Oswald', sans-serif;
  }
  .mode-card:active {
    transform: translateY(2px);
    box-shadow: 0 1px 0 rgba(0,0,0,0.12);
  }

  .icon {
    font-size: 40px;
  }
  .label {
    font-weight: 600;
    font-size: 22px;
    color: var(--ink);
  }
  .desc {
    font-size: 14px;
    color: var(--wood-dk);
  }

  .btn {
    font-family: 'Oswald', sans-serif;
    font-weight: 600;
    font-size: 18px;
    padding: 12px 32px;
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
</style>
