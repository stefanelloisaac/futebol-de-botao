<script lang="ts">
  import { fly } from 'svelte/transition';
  import { appState } from '$lib/app/appState.svelte';
  import { container } from '$lib/services/container';
  import type { Stats } from '$lib/services/ports/StatsService';

  let profile = $state(container.profile.getProfile());
  let stats = $state<Stats>(container.stats.getStats());
  let editing = $state(false);
  let editName = $state(profile.name);

  function saveName(): void {
    const trimmed = editName.trim();
    if (trimmed.length > 0) {
      container.profile.updateName(trimmed);
      profile = container.profile.getProfile();
    }
    editing = false;
  }

  function goBack(): void {
    appState.goHome();
  }

  function resetStats(): void {
    if (confirm('Tem certeza? Todas as estatísticas serão zeradas.')) {
      container.stats.resetStats();
      stats = container.stats.getStats();
    }
  }

  const winRate = $derived(stats.played > 0 ? ((stats.won / stats.played) * 100).toFixed(1) : '—');
  const bestStreak = $derived(stats.bestStreak > 0 ? stats.bestStreak : '—');
</script>

<div class="profile">
  <button class="back" onclick={goBack}>
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    Voltar
  </button>

  <h2 in:fly={{ y: -12, duration: 200, opacity: 0 }}>Perfil</h2>

  <div class="card" in:fly={{ y: 16, duration: 250, delay: 100, opacity: 0 }}>
    {#if editing}
      <div class="edit-row">
        <input type="text" bind:value={editName} class="name-input" placeholder="Seu apelido" maxlength="20" />
        <button class="save-btn" onclick={saveName}>Salvar</button>
        <button class="cancel-btn" onclick={() => { editing = false; editName = profile.name; }}>Cancelar</button>
      </div>
    {:else}
      <div class="name-row">
        <span class="name">{profile.name}</span>
        <button class="edit-btn" onclick={() => editing = true}>
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
          </svg>
        </button>
      </div>
    {/if}
  </div>

  <div class="stats-grid" in:fly={{ y: 16, duration: 250, delay: 200, opacity: 0 }}>
    <div class="stat-card">
      <span class="stat-value">{stats.played}</span>
      <span class="stat-label">Partidas</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">{stats.won}</span>
      <span class="stat-label">Vitórias</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">{stats.lost}</span>
      <span class="stat-label">Derrotas</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">{winRate}%</span>
      <span class="stat-label">Aproveitamento</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">{stats.goalsFor}</span>
      <span class="stat-label">Gols Pró</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">{stats.goalsAgainst}</span>
      <span class="stat-label">Gols Contra</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">{stats.currentStreak}</span>
      <span class="stat-label">Sequência Atual</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">{bestStreak}</span>
      <span class="stat-label">Melhor Sequência</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">{stats.totalShots}</span>
      <span class="stat-label">Total de Chutes</span>
    </div>
  </div>

  <button class="reset-btn" onclick={resetStats}>
    Zerar estatísticas
  </button>
</div>

<style>
  .profile {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
  }

  .back {
    align-self: flex-start;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--cream);
    padding: 0.5rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .back:hover {
    background: var(--surface-hover);
  }

  h2 {
    margin: 0;
    color: var(--cream);
    font-size: 1.5rem;
  }

  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1.2rem 1.5rem;
    width: 100%;
    max-width: 340px;
  }

  .name-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .name {
    font-size: 1.2rem;
    color: var(--cream);
    font-weight: 600;
  }

  .edit-btn {
    background: none;
    border: none;
    color: var(--cream-50);
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
  }

  .edit-btn:hover {
    color: var(--cream);
    background: var(--surface-hover);
  }

  .edit-row {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-wrap: wrap;
  }

  .name-input {
    flex: 1;
    min-width: 140px;
    background: var(--bg);
    border: 1px solid var(--border);
    color: var(--cream);
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    font-size: 1rem;
  }

  .save-btn {
    background: var(--green);
    border: none;
    color: #fff;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
  }

  .cancel-btn {
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--cream-50);
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    cursor: pointer;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.6rem;
    width: 100%;
    max-width: 340px;
  }

  .stat-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 0.8rem 0.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .stat-value {
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--cream);
  }

  .stat-label {
    font-size: 0.7rem;
    color: var(--cream-50);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    text-align: center;
  }

  .reset-btn {
    background: transparent;
    border: 1px solid var(--red);
    color: var(--red);
    padding: 0.5rem 1.2rem;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.85rem;
    margin-top: 0.5rem;
  }

  .reset-btn:hover {
    background: var(--red);
    color: #fff;
  }
</style>
