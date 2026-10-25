import { describe, expect, it } from 'vitest';
import { createMockEngine } from './mockEngine.js';
import { normalizeState, posKey } from './contract.js';
import { DEFAULT_LEVEL } from './levels.js';

const isOpen = (grid, [r, c]) => grid[r][c] !== '#';

describe('mock engine', () => {
  it('starts with a valid state that passes the contract check', () => {
    const s = normalizeState(createMockEngine().reset());
    expect(s.status).toBe('playing');
    expect(s.tick).toBe(0);
    expect(s.score).toBe(0);
    expect(s.lives).toBe(3);
    expect(s.pacman.pos).toEqual(DEFAULT_LEVEL.pacStart);
    expect(s.ghosts).toHaveLength(4);
    expect(s.coins).toHaveLength(DEFAULT_LEVEL.coins.length);
    expect(s.totals.pellets).toBe(s.pellets.length);
    expect(s.pellets.some((p) => posKey(p) === posKey(s.pacman.pos))).toBe(false);
  });

  it('only ever moves the agent one open cell at a time', () => {
    const engine = createMockEngine();
    let prev = engine.reset();
    for (let i = 0; i < 300; i++) {
      const next = engine.step();
      if (next.status !== 'playing') break;
      const moved = Math.abs(next.pacman.pos[0] - prev.pacman.pos[0]) + Math.abs(next.pacman.pos[1] - prev.pacman.pos[1]);
      const respawned = next.lives < prev.lives;
      if (!respawned) expect(moved).toBeLessThanOrEqual(1);
      expect(isOpen(next.grid, next.pacman.pos)).toBe(true);
      next.ghosts.forEach((g) => expect(isOpen(next.grid, g.pos)).toBe(true));
      prev = next;
    }
  });

  it('scores 10 per pellet and 50 per coin, and the score matches what was collected', () => {
    const engine = createMockEngine();
    const start = engine.reset();
    let s = start;
    for (let i = 0; i < 120 && s.status === 'playing'; i++) s = engine.step();
    const pelletsEaten = start.pellets.length - s.pellets.length;
    const coinsEaten = start.coins.length - s.coins.length;
    expect(s.score).toBe(pelletsEaten * 10 + coinsEaten * 50);
    expect(pelletsEaten).toBeGreaterThan(0);
  });

  it('reports the agent route, target and searched cells each step', () => {
    const engine = createMockEngine();
    engine.reset();
    const s = engine.step();
    expect(['UP', 'DOWN', 'LEFT', 'RIGHT']).toContain(s.agent.action);
    expect(s.agent.explored_nodes).toBe(s.agent.explored_cells.length);
    expect(s.agent.target).not.toBeNull();
    expect(typeof s.agent.decision_time_ms).toBe('number');
  });

  it('is repeatable for the same seed', () => {
    const run = () => {
      const e = createMockEngine({ seed: 7 });
      e.reset();
      let s;
      for (let i = 0; i < 80; i++) s = e.step();
      return JSON.stringify({ ...s, agent: { ...s.agent, decision_time_ms: 0 } });
    };
    expect(run()).toEqual(run());
  });

  it('loses a life on contact and ends the game at zero lives', () => {
    const level = {
      grid: ['#####', '#...#', '#####'],
      pacStart: [1, 1],
      ghosts: [{ id: 'red', start: [1, 3], behavior: 'chase' }],
      coins: [],
    };
    const engine = createMockEngine({ level, lives: 1, ghostEvery: 1 });
    let s = engine.reset();
    for (let i = 0; i < 10 && s.status === 'playing'; i++) s = engine.step();
    expect(s.status).toBe('lost');
    expect(s.lives).toBe(0);
  });

  it('wins when every pellet and coin is collected', () => {
    const level = { grid: ['#####', '#...#', '#####'], pacStart: [1, 1], ghosts: [], coins: [[1, 3]] };
    const engine = createMockEngine({ level });
    let s = engine.reset();
    for (let i = 0; i < 5 && s.status === 'playing'; i++) s = engine.step();
    expect(s.status).toBe('won');
    expect(s.score).toBe(10 + 50);
    expect(engine.step()).toEqual(s);
  });
});
