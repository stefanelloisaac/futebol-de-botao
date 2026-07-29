<script lang="ts">
  import type { Snippet } from 'svelte';
  import { fly } from 'svelte/transition';

  let {
    title,
    children,
    footer
  }: {
    title: string;
    children: Snippet;
    footer?: Snippet;
  } = $props();
</script>

<div class="screen-layout">
  <h2 class="screen-title" in:fly={{ y: -12, duration: 200, opacity: 0 }}>{title}</h2>
  <div class="screen-body">
    {@render children()}
  </div>
  {#if footer}
    <div class="screen-footer">
      {@render footer()}
    </div>
  {/if}
</div>

<style>
  .screen-layout {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    min-height: 0;
    width: 100%;
    max-width: 27.5rem;
    margin-inline: auto;
    padding: 1.5rem;
    gap: 1.5rem;
  }

  .screen-title {
    font-family: 'Ultra', serif;
    font-weight: 400;
    font-size: 1.75rem;
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
    gap: 1.25rem;
  }

  .screen-footer {
    flex-shrink: 0;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-top: 0.5rem;
  }
</style>
