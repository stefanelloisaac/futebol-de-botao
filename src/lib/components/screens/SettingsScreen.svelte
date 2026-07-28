<script lang="ts">
  import { fly } from 'svelte/transition';
  import { appState } from '$lib/app/appState.svelte';
  import { container } from '$lib/services/container';
  import ScreenLayout from '$lib/components/ui/ScreenLayout.svelte';
  import BackButton from '$lib/components/ui/BackButton.svelte';

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
</script>

<ScreenLayout title="Configurações">
  {#snippet footer()}
    <BackButton />
  {/snippet}
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
</ScreenLayout>

<style>
  .options {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
    max-width: 18.75rem;
  }

  .option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 0.875rem;
    background: var(--cream);
    border-radius: 0.625rem;
    font-family: 'Oswald', sans-serif;
    font-size: 1.0625rem;
    font-weight: 500;
    color: var(--ink);
    box-shadow: 0 0.125rem 0 rgba(0,0,0,0.08);
  }

  .option > span {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .toggle {
    width: 3rem;
    height: 1.625rem;
    border-radius: 0.8125rem;
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
    top: 0.1875rem;
    left: 0.1875rem;
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 0.0625rem 0.1875rem rgba(0,0,0,0.2);
    transition: transform 0.2s;
  }
  .toggle.on .toggle-knob { transform: translateX(1.375rem); }

  .teams {
    width: 100%;
    max-width: 18.75rem;
  }
  .teams h3 {
    font-family: 'Oswald', sans-serif;
    font-weight: 600;
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.0625em;
    color: var(--wood-dk);
    margin: 0 0 0.5rem;
  }

  .team-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0;
    font-size: 1rem;
    color: var(--ink);
  }

  .dot {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
    border: 0.125rem solid var(--ink);
  }
  .dot.red { background: var(--red); }
  .dot.blue { background: var(--blue); }

  .hint {
    font-size: 0.8125rem;
    color: var(--cream-50);
    margin: 0.375rem 0 0;
  }

  .about {
    text-align: center;
    color: var(--wood-dk);
    font-size: 0.9375rem;
  }
  .about p { margin: 0.125rem 0; }
  .about .version {
    font-size: 0.6875rem;
    opacity: 0.6;
  }
</style>
