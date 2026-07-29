import type { MatchSnapshot, ShotCommand, TeamId, Vec2, Difficulty } from '../types';
import { FIELD, DISC_RADIUS, BALL_RADIUS } from '../constants';

function sub(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x - b.x, y: a.y - b.y };
}
function len(v: Vec2): number {
  return Math.hypot(v.x, v.y);
}
function normalise(v: Vec2): Vec2 {
  const l = len(v) || 1;
  return { x: v.x / l, y: v.y / l };
}

/** The goal a team attacks (red shoots up, blue shoots down). */
function targetGoal(team: TeamId): Vec2 {
  return team === 'red'
    ? { x: FIELD.width / 2, y: FIELD.margin }
    : { x: FIELD.width / 2, y: FIELD.height - FIELD.margin };
}

interface DifficultyParams {
  /** Angular spread (radians). Higher = more inaccurate. */
  angleNoise: number;
  /** Speed multiplier. Lower = slower/weaker shots. */
  powerBase: number;
  /** Random power added on top. */
  powerRange: number;
  /** How often the AI picks a suboptimal disc (0-1). */
  blunderChance: number;
}

const DIFFICULTY_MAP: Record<Difficulty, DifficultyParams> = {
  easy: {
    angleNoise: 0.6,
    powerBase: 8,
    powerRange: 6,
    blunderChance: 0.35
  },
  medium: {
    angleNoise: 0.28,
    powerBase: 15,
    powerRange: 7,
    blunderChance: 0.1
  },
  hard: {
    angleNoise: 0.12,
    powerBase: 18,
    powerRange: 6,
    blunderChance: 0.02
  }
};

/**
 * Picks the disc nearest the ball and flicks it so the ball is pushed toward the
 * opponent goal, with randomness calibrated by difficulty.
 */
export function computeAiShot(
  snapshot: MatchSnapshot,
  team: TeamId,
  difficulty: Difficulty = 'medium',
  rng: () => number = Math.random
): ShotCommand | null {
  const params = DIFFICULTY_MAP[difficulty];
  const own = snapshot.discs.filter((d) => d.team === team);
  if (own.length === 0) return null;

  const ball = snapshot.ball.position;
  const candidates = own
    .map((disc) => ({ disc, distance: len(sub(disc.position, ball)) }))
    .sort((a, b) => a.distance - b.distance);
  const closest = candidates[0];
  let shooter = closest.disc;

  // A blunder may select another *valid* nearby disc. It never changes which
  // candidate is the closest, so difficulty cannot corrupt the ranking.
  if (rng() < params.blunderChance) {
    const alternatives = candidates.filter((candidate) =>
      candidate.disc.id !== closest.disc.id && candidate.distance <= closest.distance * 1.8
    );
    if (alternatives.length > 0) {
      shooter = alternatives[Math.min(alternatives.length - 1, Math.floor(rng() * alternatives.length))].disc;
    }
  }

  const desired = normalise(sub(targetGoal(team), ball));
  const contact: Vec2 = {
    x: ball.x - desired.x * (DISC_RADIUS + BALL_RADIUS),
    y: ball.y - desired.y * (DISC_RADIUS + BALL_RADIUS)
  };
  const aim = normalise(sub(contact, shooter.position));
  const angle = Math.atan2(aim.y, aim.x) + (rng() - 0.5) * params.angleNoise;
  const power = params.powerBase + rng() * params.powerRange;

  return {
    team,
    discId: shooter.id,
    velocity: { x: Math.cos(angle) * power, y: Math.sin(angle) * power }
  };
}

/** How long the AI waits before shooting, based on difficulty. */
export function getAiDelay(difficulty: Difficulty = 'medium'): number {
  switch (difficulty) {
    case 'easy': return 1200;
    case 'medium': return 650;
    case 'hard': return 350;
  }
}
