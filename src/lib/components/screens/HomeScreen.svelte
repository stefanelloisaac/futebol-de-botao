<script lang="ts">
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
    <h1>FUTEBOL <span class="b">DE BOTÃO</span></h1>
    <div class="sub">edição de mesa · 1962</div>
  </div>

  <div class="menu">
    <button class="btn primary" onclick={play}>Jogar</button>
    <button class="btn" onclick={openSettings}>Configurações</button>
  </div>

  <div class="howto">
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
    gap: 32px;
    height: 100%;
    padding: 24px;
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
  .btn.primary {
    background: var(--mustard);
    color: #fff;
    font-size: 24px;
  }

  .howto {
    background: var(--paper);
    border-radius: 8px;
    padding: 16px 20px;
    max-width: 340px;
    text-align: center;
  }
  .howto h3 {
    margin: 0 0 8px;
    font-size: 16px;
    color: var(--wood-dk);
  }
  .howto p {
    margin: 0 0 6px;
    font-size: 14px;
    line-height: 1.4;
    color: var(--ink);
  }
  .howto p:last-child { margin-bottom: 0; }
</style>
