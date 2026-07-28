<script lang="ts">
  import type { TeamId } from '$lib/engine';

  let {
    scoreRed,
    scoreBlue,
    activeTeam,
    golFlash
  }: {
    scoreRed: number;
    scoreBlue: number;
    activeTeam: TeamId;
    golFlash: 'red' | 'blue' | null;
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

<div class="board">
  <div class="team red" class:active={activeTeam === 'red'} class:gol={golFlash === 'red'}>
    <span class="lamp"></span>
    <div class="nm">Vermelho</div>
    <div class="sc" class:bump={redBump}>{scoreRed}</div>
  </div>
  <div class="turn">
    <div class="lbl">Vez do</div>
    <div class="who" class:red={activeTeam === 'red'} class:blue={activeTeam === 'blue'}>
      {activeTeam === 'red' ? 'Vermelho' : 'Azul'}
    </div>
  </div>
  <div class="team blue" class:active={activeTeam === 'blue'} class:gol={golFlash === 'blue'}>
    <span class="lamp"></span>
    <div class="nm">Azul</div>
    <div class="sc" class:bump={blueBump}>{scoreBlue}</div>
  </div>
</div>

<style>
  .board {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 8px 12px;
    background: var(--paper);
    border-bottom: 2px solid rgba(0,0,0,0.08);
    flex-shrink: 0;
  }

  .team {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 6px;
    background: transparent;
    transition: background 0.2s;
  }
  .team.active {
    background: rgba(0,0,0,0.06);
  }
  .team.gol {
    animation: golFlash 0.5s ease-out;
  }
  @keyframes golFlash {
    0% { background: rgba(217,164,65,0.5); }
    100% { background: transparent; }
  }

  .lamp {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: transparent;
    transition: background 0.2s;
  }
  .team.active .lamp {
    background: var(--mustard);
    box-shadow: 0 0 6px var(--mustard);
  }

  .nm {
    font-family: 'Oswald', sans-serif;
    font-weight: 600;
    font-size: 14px;
    color: var(--ink);
  }

  .sc {
    font-family: 'Ultra', serif;
    font-size: 22px;
    color: var(--ink);
    transition: transform 0.12s;
  }
  .sc.bump {
    animation: bump 0.25s ease-out;
  }
  @keyframes bump {
    0% { transform: scale(1.4); }
    100% { transform: scale(1); }
  }

  .turn {
    text-align: center;
    padding: 0 8px;
  }
  .lbl {
    font-family: 'Oswald', sans-serif;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--wood);
  }
  .who {
    font-family: 'Ultra', serif;
    font-size: 16px;
  }
  .who.red { color: var(--red); }
  .who.blue { color: var(--blue); }
</style>
