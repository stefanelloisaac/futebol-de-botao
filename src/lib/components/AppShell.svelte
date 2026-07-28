<script lang="ts">
  import { appState } from '$lib/app/appState.svelte';
  import type { Screen } from '$lib/app/screens';
  import HomeScreen from '$lib/components/screens/HomeScreen.svelte';
  import ModeSelectScreen from '$lib/components/screens/ModeSelectScreen.svelte';
  import MatchScreen from '$lib/components/screens/MatchScreen.svelte';
  import ResultScreen from '$lib/components/screens/ResultScreen.svelte';
  import SettingsScreen from '$lib/components/screens/SettingsScreen.svelte';

  let current = $derived<Screen>(appState.screen);
</script>

<div class="shell">
  {#if current === 'home'}
    <HomeScreen />
  {:else if current === 'mode-select'}
    <ModeSelectScreen />
  {:else if current === 'match'}
    <MatchScreen />
  {:else if current === 'result'}
    <ResultScreen />
  {:else if current === 'settings'}
    <SettingsScreen />
  {/if}
</div>

<style>
  .shell {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
</style>
