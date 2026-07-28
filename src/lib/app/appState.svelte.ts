import type { Screen } from './screens';
import type { GameMode } from '$lib/game/GameClient';
import type { MatchConfig, TeamId } from '$lib/engine';
import { container } from '$lib/services/container';

export interface MatchResult {
  scoreRed: number;
  scoreBlue: number;
  winner: TeamId;
}

function createAppState() {
  const settings = container.settings;
  const sound = container.sound;

  let screen = $state<Screen>('home');
  let mode = $state<GameMode>('single');
  let matchConfig = $state<MatchConfig>({ targetGoals: 3 });
  let lastResult = $state<MatchResult | null>(null);
  let lastShots = $state(0);

  let soundEnabled = $state(settings.getSoundEnabled());
  let vibrationEnabled = $state(settings.getVibrationEnabled());
  let teamNames = $state<Record<TeamId, string>>({
    red: settings.getTeamName('red'),
    blue: settings.getTeamName('blue')
  });

  sound.setMuted(!soundEnabled);

  return {
    get screen() { return screen; },
    set screen(v: Screen) { screen = v; },
    get mode() { return mode; },
    set mode(v: GameMode) { mode = v; },
    get matchConfig() { return matchConfig; },
    get lastResult() { return lastResult; },
    set lastResult(v: MatchResult | null) { lastResult = v; },
    get lastShots() { return lastShots; },
    set lastShots(v: number) { lastShots = v; },
    get soundEnabled() { return soundEnabled; },
    set soundEnabled(v: boolean) {
      soundEnabled = v;
      settings.setSoundEnabled(v);
      sound.setMuted(!v);
    },
    get vibrationEnabled() { return vibrationEnabled; },
    set vibrationEnabled(v: boolean) {
      vibrationEnabled = v;
      settings.setVibrationEnabled(v);
    },
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

      // Record stats
      const isPlayerWin = (mode === 'single' && result.winner === 'red') ||
                          (mode === 'local' && result.winner === 'red');
      // For local multiplayer, we count it as "won" for the local player (red)
      // when red wins, otherwise "lost"
      container.stats.recordMatch(
        isPlayerWin,
        result.scoreRed,
        result.scoreBlue,
        lastShots
      );

      // Record match history
      container.history.add({
        mode,
        config: { ...matchConfig },
        scoreRed: result.scoreRed,
        scoreBlue: result.scoreBlue,
        winner: result.winner
      });

      // Update ranking score based on goals for
      const stats = container.stats.getStats();
      const rankingScore = stats.won * 200 + stats.goalsFor * 30 - stats.goalsAgainst * 10;
      container.ranking.updatePlayerScore(rankingScore);

      // Submit daily challenge result if playing in daily mode
      if (matchConfig.difficulty === 'hard') {
        container.daily.submitResult({
          scoreRed: result.scoreRed,
          scoreBlue: result.scoreBlue
        });
      }

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
