<script lang="ts">
	import { tick } from 'svelte';
	import Scoreboard from '$lib/components/Scoreboard.svelte';
	import GameCanvas from '$lib/components/GameCanvas.svelte';
	import type { GameMode, GameState } from '$lib/game/GameClient';
	import type { TeamId } from '$lib/engine';

	let scoreRed = $state(0);
	let scoreBlue = $state(0);
	let activeTeam = $state<TeamId>('red');
	let mode = $state<GameMode>('single');

	let golShow = $state(false);
	let shaking = $state(false);

	let game: GameCanvas;

	function handleState(state: GameState): void {
		scoreRed = state.scoreRed;
		scoreBlue = state.scoreBlue;
		activeTeam = state.activeTeam;
	}

	async function handleGoal(): Promise<void> {
		golShow = false;
		shaking = false;
		await tick();
		golShow = true;
		shaking = true;
		setTimeout(() => {
			golShow = false;
			shaking = false;
		}, 1400);
	}

	function toggleMode(): void {
		mode = mode === 'single' ? 'local' : 'single';
	}

	function restart(): void {
		game?.restart();
	}
</script>

<div class="wrap">
	<div class="title">
		<h1>FUTEBOL <span class="b">DE BOTÃO</span></h1>
		<div class="sub">edição de mesa · 1962</div>
	</div>

	<Scoreboard {scoreRed} {scoreBlue} {activeTeam} />

	<div class="stage" class:shake={shaking}>
		<GameCanvas bind:this={game} {mode} onstate={handleState} ongoal={handleGoal} />
		<div class="gol" class:show={golShow}><span>GOL!</span></div>
	</div>

	<div class="ctrls">
		<button class="btn" class:on={mode === 'single'} onclick={toggleMode}>
			{mode === 'single' ? '1 Jogador' : '2 Jogadores'}
		</button>
		<button class="btn" onclick={restart}>Reiniciar</button>
	</div>

	<p class="hint">Puxe um <b>disco da sua cor</b> pra trás e solte pra dar a tacada.</p>
</div>
