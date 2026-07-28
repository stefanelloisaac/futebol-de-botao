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

<div class="screen">
  <h2 in:fly={{ y: -12, duration: 200, opacity: 0 }}>Configurações</h2>

  <div class="screen-body">
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
  .toggle.on { background: var(--mustard); }

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
  .toggle.on .toggle-knob { transform: translateX(22px); }

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
    color: var(--wood-dk);
    margin: 0 0 8px;
  }

  .team-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 0;
    font-size: 16px;
    color: var(--ink);
  }

  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid var(--ink);
  }
  .dot.red { background: var(--red); }
  .dot.blue { background: var(--blue); }

  .hint {
    font-size: 13px;
    color: var(--cream-50);
    margin: 6px 0 0;
  }

  .about {
    text-align: center;
    color: var(--wood-dk);
    font-size: 15px;
  }
  .about p { margin: 2px 0; }
  .about .version {
    font-size: 11px;
    opacity: 0.6;
  }
</style>
