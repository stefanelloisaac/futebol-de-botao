// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GameClient } from '../GameClient';
import { Match, type TeamId } from '../../engine';

const matchSpies = vi.hoisted(() => ({
  applyShot: vi.fn(),
  update: vi.fn(),
  snapshot: vi.fn(),
  onShot: undefined as ((team: TeamId) => void) | undefined
}));

vi.mock('../../engine', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../engine')>();
  class TestMatch {
    constructor(_config: unknown, events: { onShot?: (team: TeamId) => void }) {
      matchSpies.onShot = events.onShot;
    }
    snapshot() {
      return matchSpies.snapshot();
    }
    update() {
      return matchSpies.update();
    }
    applyShot(command: unknown) {
      return matchSpies.applyShot(command);
    }
  }
  return { ...actual, Match: TestMatch };
});

vi.mock('../../engine/ai/simpleAi', () => ({
  computeAiShot: vi.fn(() => ({ discId: 2, team: 'blue', fx: 1, fy: 0 })),
  getAiDelay: vi.fn(() => 100)
}));

vi.mock('../../render/PitchRenderer', () => ({
  PitchRenderer: class { draw(): void {} }
}));

function snapshot(activeTeam: TeamId = 'blue') {
  return {
    discs: [],
    ball: { position: { x: 200, y: 330 }, radius: 8 },
    scoreRed: 0,
    scoreBlue: 0,
    activeTeam,
    phase: 'aim' as const,
    winner: null
  };
}

function createClient(onShot = vi.fn(), width = 400, height = 660) {
  const canvas = document.createElement('canvas');
  Object.defineProperty(canvas, 'getBoundingClientRect', {
    value: () => ({ left: 0, top: 0, width, height })
  });
  canvas.getContext = vi.fn(() => ({
    setTransform: vi.fn(), clearRect: vi.fn(), save: vi.fn(), restore: vi.fn()
  })) as unknown as typeof canvas.getContext;
  const client = new GameClient(canvas, {
    getMode: () => 'single',
    matchConfig: { targetGoals: 3 },
    onShot
  });
  return { client, onShot };
}

describe('GameClient AI lifecycle', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('não executa IA agendada após pause', () => {
    vi.useFakeTimers();
    matchSpies.snapshot.mockReturnValue(snapshot());
    const { client } = createClient();
    client.start();
    vi.advanceTimersByTime(1);
    client.pause();
    vi.advanceTimersByTime(200);
    expect(matchSpies.applyShot).not.toHaveBeenCalled();
    client.destroy();
  });

  it('timer da partida A não afeta a partida B após restart', () => {
    vi.useFakeTimers();
    matchSpies.snapshot.mockReturnValue(snapshot());
    const { client } = createClient();
    client.start();
    vi.advanceTimersByTime(1);
    client.restart();
    vi.advanceTimersByTime(100);
    expect(matchSpies.applyShot).not.toHaveBeenCalled();
    client.destroy();
  });

  it('chute de IA dispara onShot e totalShots exatamente uma vez', () => {
    vi.useFakeTimers();
    matchSpies.snapshot.mockReturnValue(snapshot());
    matchSpies.applyShot.mockImplementation(() => {
      matchSpies.onShot?.('blue');
      return true;
    });
    const onShot = vi.fn();
    const { client } = createClient(onShot);
    client.start();
    vi.advanceTimersToNextTimer();
    vi.advanceTimersByTime(100);
    expect(matchSpies.applyShot).toHaveBeenCalledTimes(1);
    expect(onShot).toHaveBeenCalledTimes(1);
    expect(onShot).toHaveBeenCalledWith('blue');
    expect(client.totalShots).toBe(1);
    client.destroy();
  });
});

describe('GameClient viewport policy', () => {
  it('mantém mobile em portrait/fill', () => {
    const { client } = createClient(vi.fn(), 390, 844);
    const viewport = (client as unknown as { viewport: { orientation: string; fit: string } }).viewport;

    expect(viewport.orientation).toBe('portrait');
    expect(viewport.fit).toBe('fill');
    client.destroy();
  });

  it('usa landscape/contain só no desktop para preservar discos circulares', () => {
    const { client } = createClient(vi.fn(), 1280, 720);
    const viewport = (client as unknown as {
      viewport: { orientation: string; fit: string; scaleX: number; scaleY: number };
    }).viewport;

    expect(viewport.orientation).toBe('landscape');
    expect(viewport.fit).toBe('contain');
    expect(viewport.scaleX).toBeCloseTo(viewport.scaleY, 10);
    client.destroy();
  });
});
