<script lang="ts">
  import { fly } from 'svelte/transition';
  import { appState } from '$lib/app/appState.svelte';
  import { container } from '$lib/services/container';

  const settings = container.settings;
  const sound = container.sound;

  function toggleSound(): void {
    appState.soundEnabled = !appState.soundEnabled;
    settings.setSoundEnabled(appState.soundEnabled);
    sound.setMuted(!appState.soundEnabled);
  }

  function toggleVibration(): void {
    appState.vibrationEnabled = !appState.vibrationEnabled;
    settings.setVibrationEnabled(appState.vibrationEnabled);
  }

  function goBack(): void {
    appState.goHome();
  }
</script>

<div class="settings">
  <h2 in:fly={{ y: -12, duration: 200, opacity: 0 }}>Configurações</h2>

  <div class="options" in:fly={{ y: 16, duration: 250, delay: 100, opacity: 0 }}>
    <label class="option">
      <span>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M11 5L6 9H2v6h4l5 4V5z"/>
          <path d="M19.1 4.9a10 10 0 010 14.2M15.5 8.5a5 5 0 010 7"/>
        </svg>
        Som
      </span>
      <button class="toggle" class:on={appState.soundEnabled} onclick={toggleSound} aria-label="Alternar som">
        <span class="toggle-knob"></span>
      </button>
    </label>

    <label class="option">
      <span>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        Vibração
      </span>
      <button class="toggle" class:on={appState.vibrationEnabled} onclick={toggleVibration} aria-label="Alternar vibração">
        <span class="toggle-knob"></span>
      </button>
    </label>
  </div>

  <div class="teams" in:fly={{ y: 16, duration: 250, delay: 200, opacity: 0 }}>
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

  <div class="about" in:fly={{ y: 16, duration: 250, delay: 300, opacity: 0 }}>
    <p>Futebol de Botão — edição de mesa · 1962</p>
    <p class="version">v0.2.0</p>
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
    padding: 12px 14px;
    background: var(--cream);
    border-radius: 10px;
    font-family: 'Oswald', sans-serif;
    font-size: 17px;
    font-weight: 500;
    color: var(--ink);
    box-shadow: 0 2px 0 rgba(0,0,0,0.08);
  }

  .option > span {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .toggle {
    width: 48px;
    height: 26px;
    border-radius: 13px;
    border: none;
    cursor: pointer;
    position: relative;
    background: var(--wood-lt);
    transition: background 0.2s;
    padding: 0;
  }
  .toggle.on {
    background: var(--mustard);
  }
  .toggle-knob {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    transition: transform 0.2s;
  }
  .toggle.on .toggle-knob {
    transform: translateX(22px);
  }

  .teams {
    width: 100%;
    max-width: 300px;
  }
  .teams h3 {
    font-family: 'Oswald', sans-serif;
    font-weight: 600;
    font-size: 16px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--ink);
    margin: 0 0 8px;
  }
  .team-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 0;
    font-family: 'Oswald', sans-serif;
    font-size: 16px;
    color: var(--ink);
  }
  .dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .dot.red { background: var(--red); }
  .dot.blue { background: var(--blue); }

  .hint {
    font-family: 'Oswald', sans-serif;
    font-size: 13px;
    color: var(--wood-dk);
    font-style: italic;
    margin: 6px 0 0;
  }

  .about {
    text-align: center;
    font-family: 'Oswald', sans-serif;
    font-size: 14px;
    color: var(--wood-dk);
  }
  .about p { margin: 2px 0; }
  .about .version {
    font-size: 11px;
    opacity: 0.6;
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
