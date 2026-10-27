// Test-only stand-in for the game server: a tiny fixed board where the agent
// walks right along the top row. Used by the tests so they don't need a backend.
// It is not part of the app.

import { normalizeState } from '../game/contract.js';

const GRID = ['#######', '#.....#', '#.###.#', '#.....#', '#######'];
const START = [1, 1];
const COIN = [3, 1];
const GHOST = { id: 'red', pos: [3, 3] };
const END_COL = 5;

const key = (p) => `${p[0]},${p[1]}`;

function openCells() {
  const out = [];
  GRID.forEach((row, r) => [...row].forEach((ch, c) => ch !== '#' && out.push([r, c])));
  return out;
}

export function createFakeServer() {
  let s;

  function plan() {
    const [r, c] = s.pos;
    if (c >= END_COL) return { action: null, path: [], explored_cells: [], target: null, explored_nodes: 0, decision_time_ms: 0 };
    const path = [];
    for (let col = c + 1; col <= END_COL; col++) path.push([r, col]);
    return { action: 'RIGHT', path, explored_cells: [[r + 1, c]], target: [r, END_COL], explored_nodes: 1, decision_time_ms: 0.1 };
  }

  function snapshot() {
    return {
      tick: s.tick,
      status: 'playing',
      grid: GRID.slice(),
      pacman: { pos: [...s.pos], dir: 'RIGHT' },
      ghosts: [{ id: GHOST.id, pos: [...GHOST.pos] }],
      pellets: s.pellets.map((p) => [...p]),
      coins: s.coins.map((p) => [...p]),
      score: s.score,
      lives: 3,
      totals: { pellets: s.totalPellets, coins: 1 },
      agent: plan(),
    };
  }

  function reset() {
    const pellets = openCells().filter((p) => key(p) !== key(START) && key(p) !== key(COIN));
    s = { tick: 0, pos: [...START], pellets, coins: [[...COIN]], score: 0, totalPellets: pellets.length };
    return snapshot();
  }

  function step() {
    if (s.pos[1] < END_COL) s.pos = [s.pos[0], s.pos[1] + 1];
    const before = s.pellets.length;
    s.pellets = s.pellets.filter((p) => key(p) !== key(s.pos));
    s.score += (before - s.pellets.length) * 10;
    s.tick += 1;
    return snapshot();
  }

  reset();
  return { reset, step, getState: snapshot };
}

// Same interface as createClient(), returning normalised states.
export function createFakeClient() {
  const server = createFakeServer();
  return {
    baseUrl: '/api',
    reset: async () => normalizeState(server.reset()),
    step: async () => normalizeState(server.step()),
    getState: async () => normalizeState(server.getState()),
  };
}
