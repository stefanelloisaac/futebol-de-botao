<script lang="ts">
  import type { TeamId } from '$lib/engine';

  let {
    scoreRed,
    scoreBlue,
    activeTeam,
    golFlash,
    goalHistory = []
  }: {
    scoreRed: number;
    scoreBlue: number;
    activeTeam: TeamId;
    golFlash: 'red' | 'blue' | null;
    goalHistory?: TeamId[];
  } = $props();

  let prevRed = $state<number>(0);
  let prevBlue = $state<number>(0);
  let redBump = $state(false);
  let blueBump = $state(false);

  $effect(() => {
    const r = scoreRed;
    const b = scoreBlue;
    redBump = r > prevRed;
    blueBump = b > prevBlue;
    prevRed = r;
    prevBlue = b;
  });
</script>

<div class="sb-bar">
  <!-- Red score -->
  <div class="sb-side red">
    <span class="sb-lamp" class:on={activeTeam === 'red'}></span>
    <span class="sb-score" class:bump={redBump} class:golflash={golFlash === 'red'}>{scoreRed}</span>
    <span class="sb-label">Verm</span>
  </div>

  <!-- Turn indicator -->
  <div class="sb-turn">
    <span class="sb-turn-dot" class:red={activeTeam === 'red'} class:blue={activeTeam === 'blue'}></span>
    <span class="sb-turn-text">Vez</span>
  </div>

  <!-- Blue score -->
  <div class="sb-side blue">
    <span class="sb-label">Azul</span>
    <span class="sb-score" class:bump={blueBump} class:golflash={golFlash === 'blue'}>{scoreBlue}</span>
    <span class="sb-lamp" class:on={activeTeam === 'blue'}></span>
  </div>
</div>

{#if goalHistory.length > 0}
  <div class="sb-goals">
    {#each goalHistory as scorer}
      <span class="sb-goal-dot {scorer}"></span>
    {/each}
  </div>
{/if}

<style>
  .sb-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.625rem;
    flex: 1;
    min-width: 0;
  }

  .sb-side {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    flex-shrink: 0;
  }

  .sb-lamp {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: #5a5040;
    border: 0.09375rem solid rgba(255,255,255,0.25);
    flex-shrink: 0;
    transition: background 0.2s, box-shadow 0.2s;
  }
  .sb-lamp.on {
    background: var(--mustard);
    box-shadow: 0 0 0.375rem var(--mustard);
  }

  .sb-score {
    font-family: 'Ultra', serif;
    font-size: 1.375rem;
    line-height: 1;
    color: var(--cream);
    min-width: 1.5rem;
    text-align: center;
    transition: transform 0.12s;
  }
  .sb-score.bump {
    animation: sbBump 0.25s ease-out;
  }
  .sb-score.golflash {
    animation: sbGolFlash 0.5s ease-out;
  }
  @keyframes sbBump {
    0% { transform: scale(1.5); }
    100% { transform: scale(1); }
  }
  @keyframes sbGolFlash {
    0% { color: var(--mustard); }
    100% { color: var(--cream); }
  }

  .sb-label {
    font-family: 'Oswald', sans-serif;
    font-weight: 600;
    font-size: 0.6875rem;
    text-transform: uppercase;
    letter-spacing: 0.03125em;
  }
  .sb-side.red .sb-label { color: #f0b3ae; }
  .sb-side.blue .sb-label { color: #a9c2e8; }

  .sb-turn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.125rem;
    flex-shrink: 0;
    min-width: 2.25rem;
  }

  .sb-turn-dot {
    width: 0.375rem;
    height: 0.375rem;
    border-radius: 50%;
    background: #5a5040;
    border: 0.0625rem solid rgba(255,255,255,0.2);
    transition: background 0.2s, box-shadow 0.2s;
  }
  .sb-turn-dot.red {
    background: var(--red);
    box-shadow: 0 0 0.25rem var(--red);
  }
  .sb-turn-dot.blue {
    background: var(--blue);
    box-shadow: 0 0 0.25rem var(--blue);
  }

  .sb-turn-text {
    font-family: 'Oswald', sans-serif;
    font-weight: 500;
    font-size: 0.5625rem;
    text-transform: uppercase;
    letter-spacing: 0.0625em;
    color: var(--cream);
    opacity: 0.7;
  }

  /* Goal dots */
  .sb-goals {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    padding: 0 0.5rem;
    height: 0.75rem;
  }

  .sb-goal-dot {
    width: 0.4375rem;
    height: 0.4375rem;
    border-radius: 50%;
    border: 0.0625rem solid rgba(0,0,0,0.3);
    flex-shrink: 0;
  }
  .sb-goal-dot.red { background: var(--red); }
  .sb-goal-dot.blue { background: var(--blue); }

  @media (max-width: 23.75em) {
    .sb-bar {
      gap: 0.375rem;
    }
    .sb-side {
      gap: 0.25rem;
    }
    .sb-score {
      font-size: 1.125rem;
      min-width: 1.25rem;
    }
    .sb-label {
      font-size: 0.625rem;
    }
    .sb-turn {
      min-width: 1.75rem;
    }
    .sb-turn-text {
      font-size: 0.5rem;
    }
    .sb-goals {
      gap: 0.1875rem;
      height: 0.625rem;
    }
    .sb-goal-dot {
      width: 0.375rem;
      height: 0.375rem;
    }
  }
</style>
