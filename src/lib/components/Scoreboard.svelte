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

  let prevRed = $state(scoreRed);
  let prevBlue = $state(scoreBlue);
  let redBump = $derived(scoreRed > prevRed);
  let blueBump = $derived(scoreBlue > prevBlue);

  $effect(() => {
    prevRed = scoreRed;
    prevBlue = scoreBlue;
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
    animation: golPulse 0.8s ease-out;
  }

  @keyframes golPulse {
    0% { background: rgba(217, 164, 65, 0.5); }
    100% { background: transparent; }
  }

  .lamp {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: transparent;
    transition: background 0.2s;
    flex-shrink: 0;
  }
  .team.active .lamp {
    background: var(--mustard);
    box-shadow: 0 0 6px var(--mustard);
  }

  .nm {
    font-family: 'Oswald', sans-serif;
    font-size: 13px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--wood-dk);
  }
  .team.active .nm {
    color: var(--ink);
    font-weight: 600;
  }

  .sc {
    font-family: 'Ultra', serif;
    font-weight: 400;
    font-size: 26px;
    line-height: 1;
    color: var(--ink);
    min-width: 24px;
    text-align: center;
    transition: transform 0.15s;
  }
  .sc.bump {
    animation: bump 0.3s ease-out;
  }

  @keyframes bump {
    0% { transform: scale(1.4); }
    100% { transform: scale(1); }
  }

  .turn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
  }
  .turn .lbl {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--wood-dk);
    font-family: 'Oswald', sans-serif;
    font-weight: 400;
  }
  .turn .who {
    font-family: 'Oswald', sans-serif;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: color 0.2s;
  }
  .turn .who.red { color: var(--red); }
  .turn .who.blue { color: var(--blue); }
</style>
