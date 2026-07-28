<script lang="ts">
  import { onMount } from 'svelte';
  import { fly, scale } from 'svelte/transition';
  import { appState } from '$lib/app/appState.svelte';
  import type { Screen } from '$lib/app/screens';
  import HomeScreen from '$lib/components/screens/HomeScreen.svelte';
  import ModeSelectScreen from '$lib/components/screens/ModeSelectScreen.svelte';
  import MatchScreen from '$lib/components/screens/MatchScreen.svelte';
  import ResultScreen from '$lib/components/screens/ResultScreen.svelte';
  import SettingsScreen from '$lib/components/screens/SettingsScreen.svelte';

  let current = $derived<Screen>(appState.screen);
  let loading = $state(true);

  onMount(() => {
    const t = setTimeout(() => {
      loading = false;
    }, 800);
    return () => clearTimeout(t);
  });
</script>

{#if loading}
  <div class="splash">
    <div class="splash-logo">
      <svg viewBox="0 0 120 120" class="splash-icon" aria-hidden="true">
        <defs>
          <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#3d6b47"/>
            <stop offset="100%" stop-color="#2c5236"/>
          </linearGradient>
        </defs>
        <rect width="120" height="120" rx="20" fill="url(#sg)"/>
        <circle cx="60" cy="60" r="28" fill="#f2e7cf" stroke="#2a231b" stroke-width="2"/>
        <circle cx="60" cy="60" r="22" fill="#b23a34" opacity="0.9"/>
        <circle cx="60" cy="60" r="38" fill="none" stroke="#d9a441" stroke-width="3" opacity="0.7"/>
        <rect x="35" y="12" width="50" height="16" rx="3" fill="none" stroke="#d9a441" stroke-width="3"/>
        <circle cx="60" cy="64" r="14" fill="#2f4b73" stroke="#f2e7cf" stroke-width="1.5"/>
        <text x="60" y="69" text-anchor="middle" fill="#f2e7cf" font-size="13" font-family="sans-serif" font-weight="bold">FB</text>
        <circle cx="60" cy="44" r="5" fill="#f2e7cf" stroke="#2a231b" stroke-width="1"/>
      </svg>
    </div>
    <h1 class="splash-title">FUTEBOL<br/>DE BOTÃO</h1>
    <p class="splash-sub">ediçao de mesa · 1962</p>
    <div class="splash-loader"></div>
  </div>
{:else}
  <div class="shell">
    {#key current}
      {#if current === 'home'}
        <div in:fly={{ y: -16, duration: 250, opacity: 0 }}>
          <HomeScreen />
        </div>
      {:else if current === 'mode-select'}
        <div in:fly={{ y: 12, duration: 200, opacity: 0 }}>
          <ModeSelectScreen />
        </div>
      {:else if current === 'match'}
        <div in:scale={{ duration: 200, start: 0.95, opacity: 0 }}>
          <MatchScreen />
        </div>
      {:else if current === 'result'}
        <div in:fly={{ y: 20, duration: 300, opacity: 0 }}>
          <ResultScreen />
        </div>
      {:else if current === 'settings'}
        <div in:fly={{ y: 12, duration: 200, opacity: 0 }}>
          <SettingsScreen />
        </div>
      {/if}
    {/key}
  </div>
{/if}

<style>
  .shell {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .splash {
    position: fixed;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    background: #dccba6;
    z-index: 999;
    animation: splashFadeOut 0.5s ease-in forwards;
    animation-delay: 0.5s;
  }

  @keyframes splashFadeOut {
    to {
      opacity: 0;
      pointer-events: none;
    }
  }

  .splash-logo {
    width: 96px;
    height: 96px;
  }

  .splash-icon {
    width: 100%;
    height: 100%;
    animation: splashPulse 1s ease-in-out infinite alternate;
  }

  @keyframes splashPulse {
    from { transform: scale(1); }
    to { transform: scale(1.06); }
  }

  .splash-title {
    font-family: 'Ultra', serif;
    font-weight: 400;
    font-size: 32px;
    line-height: 0.95;
    text-align: center;
    color: var(--ink);
    margin: 0;
  }

  .splash-sub {
    font-family: 'Oswald', sans-serif;
    font-size: 13px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--wood-dk);
    margin: 0;
  }

  .splash-loader {
    width: 140px;
    height: 3px;
    border-radius: 2px;
    background: var(--cream);
    overflow: hidden;
    margin-top: 16px;
    position: relative;
  }
  .splash-loader::after {
    content: '';
    position: absolute;
    left: -40%;
    width: 40%;
    height: 100%;
    border-radius: 2px;
    background: var(--mustard);
    animation: loaderSlide 1s ease-in-out infinite;
  }

  @keyframes loaderSlide {
    from { left: -40%; }
    to { left: 100%; }
  }
</style>
