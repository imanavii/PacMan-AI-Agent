import { describe, expect, it } from 'vitest';
import { normalizeState } from './contract.js';

const valid = () => ({
  tick: 3,
  status: 'playing',
  grid: ['#####', '#...#', '#####'],
  pacman: { pos: [1, 1], dir: 'RIGHT' },
  ghosts: [{ id: 'red', pos: [1, 3] }],
  pellets: [[1, 2]],
  coins: [],
  score: 20,
  lives: 3,
  totals: { pellets: 4, coins: 1 },
  agent: { action: 'RIGHT', path: [[1, 2]], explored_cells: [[1, 2]], target: [1, 2], explored_nodes: 1, decision_time_ms: 0.4 },
});

describe('normalizeState', () => {
  it('accepts a valid state and converts field names', () => {
    const s = normalizeState(valid());
    expect(s.rows).toBe(3);
    expect(s.cols).toBe(5);
    expect(s.agent.exploredCells).toEqual([[1, 2]]);
    expect(s.agent.exploredNodes).toBe(1);
    expect(s.agent.decisionTimeMs).toBe(0.4);
  });

  it('fills in optional fields', () => {
    const raw = valid();
    delete raw.agent;
    delete raw.coins;
    delete raw.totals;
    delete raw.pacman.dir;
    const s = normalizeState(raw);
    expect(s.coins).toEqual([]);
    expect(s.totals).toEqual({ pellets: 1, coins: 0 });
    expect(s.pacman.dir).toBe('LEFT');
    expect(s.agent).toMatchObject({ action: null, path: [], exploredCells: [], target: null });
  });

  it.each([
    ['missing grid', (r) => delete r.grid, /grid/],
    ['ragged grid', (r) => (r.grid[1] = '#..#'), /grid\[1\]/],
    ['bad pacman position', (r) => (r.pacman.pos = [1]), /pacman\.pos/],
    ['bad direction', (r) => (r.pacman.dir = 'NORTH'), /pacman\.dir/],
    ['bad pellet', (r) => (r.pellets = [[1, 'a']]), /pellets\[0\]/],
    ['bad status', (r) => (r.status = 'paused'), /status/],
    ['missing score', (r) => delete r.score, /score/],
    ['bad action', (r) => (r.agent.action = 'JUMP'), /agent\.action/],
  ])('rejects %s with a readable message', (_, mutate, pattern) => {
    const raw = valid();
    mutate(raw);
    expect(() => normalizeState(raw)).toThrow(pattern);
  });

  it('rejects non-objects', () => {
    expect(() => normalizeState(null)).toThrow(/JSON object/);
  });
});
