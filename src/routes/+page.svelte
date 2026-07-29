<script lang="ts">
  import AppShell from '$lib/components/AppShell.svelte';
</script>

<div class="app-root">
  <AppShell />
</div>

<style>
  .app-root {
    width: 100%;
    min-width: 0;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
  }
</style>
