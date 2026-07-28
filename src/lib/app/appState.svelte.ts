import type { Screen } from './screens';
import type { GameMode } from '$lib/game/GameClient';
import type { MatchConfig, TeamId } from '$lib/engine';

export interface MatchResult {
  scoreRed: number;
  scoreBlue: number;
  winner: TeamId;
}

function createAppState() {
  let screen = $state<Screen>('home');
  let mode = $state<GameMode>('single');
  let matchConfig = $state<MatchConfig>({ targetGoals: 3 });
  let lastResult = $state<MatchResult | null>(null);
  let soundEnabled = $state(true);
  let vibrationEnabled = $state(true);
  let teamNames = $state<Record<TeamId, string>>({ red: 'Vermelho', blue: 'Azul' });

  return {
    get screen() { return screen; },
    set screen(v: Screen) { screen = v; },
    get mode() { return mode; },
    set mode(v: GameMode) { mode = v; },
    get matchConfig() { return matchConfig; },
    get lastResult() { return lastResult; },
    set lastResult(v: MatchResult | null) { lastResult = v; },
    get soundEnabled() { return soundEnabled; },
    set soundEnabled(v: boolean) { soundEnabled = v; },
    get vibrationEnabled() { return vibrationEnabled; },
    set vibrationEnabled(v: boolean) { vibrationEnabled = v; },
    get teamNames() { return teamNames; },
    set teamNames(v: Record<TeamId, string>) { teamNames = v; },

    goToScreen(s: Screen) {
      screen = s;
    },

    startMatch(m: GameMode, cfg?: MatchConfig) {
      mode = m;
      if (cfg) matchConfig = cfg;
      screen = 'match';
    },

    endMatch(result: MatchResult) {
      lastResult = result;
      screen = 'result';
    },

    rematch() {
      screen = 'match';
    },

    goHome() {
      screen = 'home';
    },

    restartMatch() {
      screen = 'match';
    }
  };
}

export const appState = createAppState();
