<script lang="ts">
  import { fly } from 'svelte/transition';
  import { appState } from '$lib/app/appState.svelte';

  function play(): void {
    appState.goToScreen('mode-select');
  }

  function openSettings(): void {
    appState.goToScreen('settings');
  }
</script>

<div class="home">
  <div class="logo">
    <svg viewBox="0 0 200 140" class="logo-svg" aria-hidden="true">
      <defs>
        <linearGradient id="felt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#3d6b47"/>
          <stop offset="100%" stop-color="#2c5236"/>
        </linearGradient>
        <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#9a6638"/>
          <stop offset="50%" stop-color="#7a4d2b"/>
          <stop offset="100%" stop-color="#5c3820"/>
        </linearGradient>
      </defs>
      <rect x="10" y="10" width="180" height="120" rx="6" fill="url(#felt)" stroke="url(#wood)" stroke-width="3"/>
      <circle cx="100" cy="70" r="18" fill="none" stroke="#efe4c9" stroke-width="1.2" opacity="0.6"/>
      <circle cx="100" cy="70" r="3" fill="#efe4c9" opacity="0.5"/>
      <line x1="10" y1="70" x2="190" y2="70" stroke="#efe4c9" stroke-width="0.8" opacity="0.4"/>
      <rect x="70" y="10" width="60" height="6" rx="2" fill="none" stroke="#d9a441" stroke-width="2.5"/>
      <rect x="70" y="124" width="60" height="6" rx="2" fill="none" stroke="#d9a441" stroke-width="2.5"/>
      <circle cx="60" cy="100" r="8" fill="#b23a34" stroke="#c94a42" stroke-width="1.5"/>
      <circle cx="100" cy="85" r="8" fill="#b23a34" stroke="#c94a42" stroke-width="1.5"/>
      <circle cx="140" cy="100" r="8" fill="#b23a34" stroke="#c94a42" stroke-width="1.5"/>
      <circle cx="100" cy="112" r="10" fill="#b23a34" stroke="#c94a42" stroke-width="1.5"/>
      <circle cx="60" cy="40" r="8" fill="#2f4b73" stroke="#3d5c88" stroke-width="1.5"/>
      <circle cx="100" cy="55" r="8" fill="#2f4b73" stroke="#3d5c88" stroke-width="1.5"/>
      <circle cx="140" cy="40" r="8" fill="#2f4b73" stroke="#3d5c88" stroke-width="1.5"/>
      <circle cx="100" cy="28" r="10" fill="#2f4b73" stroke="#3d5c88" stroke-width="1.5"/>
      <circle cx="100" cy="70" r="5" fill="#f2e7cf" stroke="#2a231b" stroke-width="0.8"/>
    </svg>
    <h1>FUTEBOL <span class="b">DE BOTÃO</span></h1>
    <div class="sub">edição de mesa · 1962</div>
  </div>

  <div class="menu" in:fly={{ y: 20, duration: 350, delay: 200, opacity: 0 }}>
    <button class="btn primary" onclick={play}>Jogar</button>
    <button class="btn" onclick={openSettings}>Configurações</button>
  </div>

  <div class="howto" in:fly={{ y: 20, duration: 350, delay: 350, opacity: 0 }}>
    <h3>Como jogar</h3>
    <p>Arraste um disco para trás e solte — como um estilingue — para chutar a bola em direção ao gol adversário.</p>
    <p>Vence quem fizer {appState.matchConfig.targetGoals} gols primeiro!</p>
  </div>
</div>

<style>
  .home {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 24px;
    height: 100%;
    padding: 20px 24px;
  }

  .logo {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .logo-svg {
    width: 140px;
    height: auto;
    margin-bottom: 4px;
    filter: drop-shadow(0 2px 6px rgba(0,0,0,0.15));
  }

  .logo h1 {
    font-family: 'Ultra', serif;
    font-weight: 400;
    margin: 0;
    font-size: clamp(36px, 10vw, 52px);
    line-height: 0.92;
    letter-spacing: 0.5px;
    color: var(--ink);
    text-align: center;
  }
  .logo .b {
    color: var(--mustard);
  }
  .logo .sub {
    font-family: 'Oswald', sans-serif;
    font-size: 14px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--wood-dk);
    text-align: center;
    margin-top: 6px;
  }

  .menu {
    display: flex;
    flex-direction: column;
    gap: 14px;
    width: 100%;
    max-width: 260px;
  }

  .btn {
    font-family: 'Oswald', sans-serif;
    font-weight: 600;
    font-size: 20px;
    padding: 14px 0;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    background: var(--cream);
    color: var(--ink);
    box-shadow: 0 3px 0 rgba(0,0,0,0.12);
    transition: transform 0.08s, box-shadow 0.08s;
    width: 100%;
  }
  .btn:active {
    transform: translateY(2px);
    box-shadow: 0 1px 0 rgba(0,0,0,0.12);
  }
  .btn.primary {
    background: var(--mustard);
    color: #1a150f;
  }

  .howto {
    text-align: center;
    max-width: 320px;
    font-family: 'Oswald', sans-serif;
    font-size: 15px;
    color: var(--wood-dk);
    line-height: 1.5;
  }
  .howto h3 {
    font-weight: 600;
    font-size: 17px;
    color: var(--ink);
    margin: 0 0 6px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .howto p {
    margin: 4px 0;
  }
</style>
