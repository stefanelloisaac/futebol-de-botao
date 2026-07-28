<script lang="ts">
  import { fly } from 'svelte/transition';
  import { appState } from '$lib/app/appState.svelte';

  function play(): void {
    appState.goToScreen('mode-select');
  }

  function openSettings(): void {
    appState.goToScreen('settings');
  }

  function openProfile(): void {
    appState.goToScreen('profile');
  }

  function openHistory(): void {
    appState.goToScreen('history');
  }

  function openRanking(): void {
    appState.goToScreen('ranking');
  }
</script>

<div class="screen">
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
      <circle cx="70" cy="32" r="7" fill="#2f4b73" stroke="#406080" stroke-width="1.5"/>
      <circle cx="130" cy="32" r="7" fill="#2f4b73" stroke="#406080" stroke-width="1.5"/>
    </svg>
    <h1>FUTEBOL<br/>DE&nbsp;BOTÃO</h1>
    <p class="sub">ediçao de mesa · 1962</p>
  </div>

  <div class="screen-body">
    <div class="menu" in:fly={{ y: 20, duration: 300, delay: 120, opacity: 0 }}>
      <button class="btn-primary" onclick={play}>JOGAR</button>
      <button class="btn-secondary" onclick={openProfile}>Perfil</button>
      <button class="btn-secondary" onclick={openRanking}>Ranking</button>
      <button class="btn-secondary" onclick={openHistory}>Histórico</button>
      <button class="btn-secondary" onclick={openSettings}>Configurações</button>
    </div>

    <div class="howto" in:fly={{ y: 20, duration: 300, delay: 200, opacity: 0 }}>
      <h3>Como jogar</h3>
      <p>Arraste para trás e solte para chutar o botão na direção da bola. Marque 3 gols para vencer!</p>
    </div>
  </div>
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
    gap: 12px;
  }

  .logo {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
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

  .logo .sub {
    font-family: 'Oswald', sans-serif;
    font-size: 14px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--wood-dk);
    text-align: center;
    margin-top: 6px;
  }

  .screen-body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .menu {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    max-width: 260px;
  }

  .howto {
    text-align: center;
    max-width: 320px;
    font-family: 'Oswald', sans-serif;
    font-size: 15px;
    color: var(--wood-dk);
  }
  .howto h3 {
    font-family: 'Ultra', serif;
    font-weight: 400;
    color: var(--ink);
    margin: 0 0 4px;
    font-size: 18px;
  }
</style>
