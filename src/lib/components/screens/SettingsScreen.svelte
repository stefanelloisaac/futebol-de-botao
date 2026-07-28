<script lang="ts">
  import { appState } from '$lib/app/appState.svelte';

  function toggleSound(): void {
    appState.soundEnabled = !appState.soundEnabled;
  }

  function toggleVibration(): void {
    appState.vibrationEnabled = !appState.vibrationEnabled;
  }

  function goBack(): void {
    appState.goHome();
  }
</script>

<div class="settings">
  <h2>Configurações</h2>

  <div class="options">
    <label class="option">
      <span>Som</span>
      <button class="toggle" class:on={appState.soundEnabled} onclick={toggleSound}>
        {appState.soundEnabled ? 'ON' : 'OFF'}
      </button>
    </label>

    <label class="option">
      <span>Vibração</span>
      <button class="toggle" class:on={appState.vibrationEnabled} onclick={toggleVibration}>
        {appState.vibrationEnabled ? 'ON' : 'OFF'}
      </button>
    </label>
  </div>

  <div class="teams">
    <h3>Times</h3>
    <div class="team-row">
      <span class="dot red"></span>
      <span>Vermelho</span>
    </div>
    <div class="team-row">
      <span class="dot blue"></span>
      <span>Azul</span>
    </div>
    <p class="hint">Nomes personalizados em breve!</p>
  </div>

  <button class="btn back" onclick={goBack}>Voltar</button>
</div>

<style>
  .settings {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    height: 100%;
    padding: 24px;
    overflow-y: auto;
  }

  h2 {
    font-family: 'Ultra', serif;
    font-weight: 400;
    font-size: 28px;
    color: var(--ink);
    margin: 0;
  }

  .options {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    max-width: 300px;
  }

  .option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    background: var(--cream);
    border-radius: 8px;
    font-family: 'Oswald', sans-serif;
    font-size: 18px;
    font-weight: 500;
    color: var(--ink);
  }

  .toggle {
    font-family: 'Oswald', sans-serif;
    font-weight: 600;
    font-size: 16px;
    padding: 6px 18px;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    background: var(--wood-lt);
    color: #fff;
    transition: background 0.15s;
  }
  .toggle.on {
    background: var(--felt);
  }

  .teams {
    background: var(--paper);
    border-radius: 8px;
    padding: 16px 20px;
    width: 100%;
    max-width: 300px;
  }
  .teams h3 {
    margin: 0 0 10px;
    font-family: 'Oswald', sans-serif;
    font-size: 16px;
    color: var(--wood-dk);
  }
  .team-row {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: 'Oswald', sans-serif;
    font-size: 18px;
    padding: 6px 0;
  }
  .dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
  }
  .dot.red { background: var(--red); }
  .dot.blue { background: var(--blue); }
  .hint {
    font-size: 13px;
    color: var(--wood-dk);
    margin: 8px 0 0;
    font-style: italic;
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
