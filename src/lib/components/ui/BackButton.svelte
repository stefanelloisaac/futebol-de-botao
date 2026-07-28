<script lang="ts">
  import { appState } from '$lib/app/appState.svelte';

  let { onclick }: { onclick?: () => void } = $props();

  function handleClick(): void {
    if (onclick) {
      onclick();
    } else {
      appState.goHome();
    }
  }
</script>

<button class="back-btn" onclick={handleClick}>
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
    <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  Voltar
</button>

<style>
  .back-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    background: var(--surface);
    border: 0.125rem solid var(--border);
    color: var(--ink);
    padding: 0.5rem 1.2rem;
    border-radius: 0.5rem;
    cursor: pointer;
    font-size: 0.95rem;
    font-family: 'Oswald', sans-serif;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.03125em;
    min-height: 2.75rem;
    transition: background 0.12s;
  }
  .back-btn:hover {
    background: var(--surface-hover);
  }
</style>
