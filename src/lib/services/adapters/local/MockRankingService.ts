import type { RankingEntry, RankingService } from '$lib/services/ports/RankingService';
import type { StoragePort } from '$lib/services/ports/StoragePort';

const RANKING_KEY = 'fdb_ranking';
const RANKING_SIZE = 10;

interface BotProfile {
  name: string;
  score: number;
}

const BOTS: BotProfile[] = [
  { name: 'Mestre', score: 2850 },
  { name: 'Veterano', score: 2400 },
  { name: 'Craque', score: 2100 },
  { name: 'Bom de Bola', score: 1850 },
  { name: 'Meio-Campo', score: 1600 },
  { name: 'Atacante', score: 1350 },
  { name: 'Zagueiro', score: 1100 },
  { name: 'Novato', score: 800 },
  { name: 'Iniciante', score: 500 }
];

function buildLeaderboard(playerScore: number): RankingEntry[] {
  const entries: { id: string; name: string; score: number }[] = [];

  // Add bots
  for (const bot of BOTS) {
    entries.push({ id: `bot-${bot.name}`, name: bot.name, score: bot.score });
  }

  // Add player
  entries.push({ id: 'player', name: 'Você', score: playerScore });

  // Sort by score descending
  entries.sort((a, b) => b.score - a.score);

  return entries.map((e, i) => ({
    playerId: e.id,
    name: e.name,
    score: e.score,
    rank: i + 1
  }));
}

export class MockRankingService implements RankingService {
  private storage: StoragePort;

  constructor(storage: StoragePort) {
    this.storage = storage;
  }

  getRankings(): RankingEntry[] {
    const playerScore = this.storage.get<number>(RANKING_KEY) ?? 0;
    return buildLeaderboard(playerScore);
  }

  updatePlayerScore(score: number): void {
    this.storage.set(RANKING_KEY, score);
  }
}
