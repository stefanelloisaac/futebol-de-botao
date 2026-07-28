<script lang="ts">
  import { appState } from '$lib/app/appState.svelte';

  let {
    oncontinue,
    onrestart,
    onmenu
  }: {
    oncontinue: () => void;
    onrestart: () => void;
    onmenu: () => void;
  } = $props();
</script>

<div class="overlay">
  <div class="panel">
    <h2>Pausa</h2>
    <div class="buttons">
      <button class="btn" onclick={oncontinue}>Continuar</button>
      <button class="btn" onclick={onrestart}>Reiniciar</button>
      <button class="btn menu" onclick={onmenu}>Menu</button>
    </div>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.65);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
  }

  .panel {
    background: var(--paper);
    border-radius: 0.875rem;
    padding: 2rem 1.75rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
    min-width: 15rem;
    box-shadow: 0 0.5rem 2rem rgba(0,0,0,0.4);
  }

  h2 {
    font-family: 'Ultra', serif;
    font-weight: 400;
    font-size: 1.625rem;
    color: var(--ink);
    margin: 0;
  }

  .buttons {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    width: 100%;
  }

  .btn {
    font-family: 'Oswald', sans-serif;
    font-weight: 600;
    font-size: 1.25rem;
    padding: 0.75rem 0;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    background: var(--cream);
    color: var(--ink);
    box-shadow: 0 0.1875rem 0 rgba(0,0,0,0.12);
    transition: transform 0.08s, box-shadow 0.08s;
  }
  .btn:active {
    transform: translateY(0.125rem);
    box-shadow: 0 0.0625rem 0 rgba(0,0,0,0.12);
  }
  .btn.menu {
    background: var(--red);
    color: #fff;
  }
</style>
