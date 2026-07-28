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
  import ProfileScreen from '$lib/components/screens/ProfileScreen.svelte';
  import HistoryScreen from '$lib/components/screens/HistoryScreen.svelte';
  import RankingScreen from '$lib/components/screens/RankingScreen.svelte';
  import DailyChallengeScreen from '$lib/components/screens/DailyChallengeScreen.svelte';

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
        <div class="screen-transition" in:fly={{ y: -16, duration: 250, opacity: 0 }}>
          <HomeScreen />
        </div>
      {:else if current === 'mode-select'}
        <div class="screen-transition" in:fly={{ y: 12, duration: 200, opacity: 0 }}>
          <ModeSelectScreen />
        </div>
      {:else if current === 'match'}
        <div class="screen-transition" in:scale={{ duration: 200, start: 0.95, opacity: 0 }}>
          <MatchScreen />
        </div>
      {:else if current === 'result'}
        <div class="screen-transition" in:scale={{ duration: 200, start: 0.95, opacity: 0 }}>
          <ResultScreen />
        </div>
      {:else if current === 'settings'}
        <div class="screen-transition" in:fly={{ y: 12, duration: 200, opacity: 0 }}>
          <SettingsScreen />
        </div>
      {:else if current === 'profile'}
        <div class="screen-transition" in:fly={{ y: 12, duration: 200, opacity: 0 }}>
          <ProfileScreen />
        </div>
      {:else if current === 'history'}
        <div class="screen-transition" in:fly={{ y: 12, duration: 200, opacity: 0 }}>
          <HistoryScreen />
        </div>
      {:else if current === 'ranking'}
        <div class="screen-transition" in:fly={{ y: 12, duration: 200, opacity: 0 }}>
          <RankingScreen />
        </div>
      {:else if current === 'daily-challenge'}
        <div class="screen-transition" in:fly={{ y: 12, duration: 200, opacity: 0 }}>
          <DailyChallengeScreen />
        </div>
      {/if}
    {/key}
  </div>
{/if}

<style>
  .splash {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 0.5rem;
    pointer-events: none;
    user-select: none;
    animation: splashFadeOut 0.3s 0.7s both;
  }
  @keyframes splashFadeOut {
    to {
      opacity: 0;
      pointer-events: none;
    }
  }

  .splash-logo {
    width: 6rem;
    height: 6rem;
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
    font-size: 2rem;
    line-height: 0.95;
    text-align: center;
    color: var(--ink);
    margin: 0;
  }

  .splash-sub {
    font-family: 'Oswald', sans-serif;
    font-size: 0.8125rem;
    letter-spacing: 0.1875em;
    text-transform: uppercase;
    color: var(--wood-dk);
    margin: 0;
  }

  .splash-loader {
    width: 8.75rem;
    height: 0.1875rem;
    border-radius: 0.125rem;
    background: var(--cream);
    overflow: hidden;
    margin-top: 1rem;
    position: relative;
  }
  .splash-loader::after {
    content: '';
    position: absolute;
    left: -40%;
    width: 40%;
    height: 100%;
    border-radius: 0.125rem;
    background: var(--mustard);
    animation: loaderSlide 1s ease-in-out infinite;
  }

  @keyframes loaderSlide {
    from { left: -40%; }
    to { left: 100%; }
  }

  .shell {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }

  .screen-transition {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
</style>
