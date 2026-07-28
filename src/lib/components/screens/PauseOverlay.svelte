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
    border-radius: 14px;
    padding: 32px 28px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    min-width: 240px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  }

  h2 {
    font-family: 'Ultra', serif;
    font-weight: 400;
    font-size: 26px;
    color: var(--ink);
    margin: 0;
  }

  .buttons {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
  }

  .btn {
    font-family: 'Oswald', sans-serif;
    font-weight: 600;
    font-size: 20px;
    padding: 12px 0;
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
  .btn.menu {
    background: var(--red);
    color: #fff;
  }
</style>
