<script lang="ts">
	import type { TeamId } from '$lib/engine';

	let {
		scoreRed,
		scoreBlue,
		activeTeam
	}: {
		scoreRed: number;
		scoreBlue: number;
		activeTeam: TeamId;
	} = $props();
</script>

<div class="board">
	<div class="team red" class:active={activeTeam === 'red'}>
		<span class="lamp"></span>
		<div class="nm">Vermelho</div>
		<div class="sc">{scoreRed}</div>
	</div>
	<div class="turn">
		<div class="lbl">Vez do</div>
		<div class="who" class:red={activeTeam === 'red'} class:blue={activeTeam === 'blue'}>
			{activeTeam === 'red' ? 'Vermelho' : 'Azul'}
		</div>
	</div>
	<div class="team blue" class:active={activeTeam === 'blue'}>
		<span class="lamp"></span>
		<div class="nm">Azul</div>
		<div class="sc">{scoreBlue}</div>
	</div>
</div>
