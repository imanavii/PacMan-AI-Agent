// In-browser stand-in for the FastAPI game server, so the UI can run before the
// backend exists. It follows the same rules and returns the same JSON shape as
// the real server (see API_CONTRACT.md). Its "agent" is a simple placeholder:
// a BFS to the nearest pellet or coin that steers around cells next to ghosts.
// It is NOT the project's hybrid BFS + A* + Minimax agent.

import { DIRECTIONS, POINTS, key, posKey } from './contract.js';
import { DEFAULT_LEVEL } from './levels.js';

const ORDER = ['UP', 'LEFT', 'DOWN', 'RIGHT'];
const REVERSE = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };

function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const manhattan = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

export function createMockEngine({ level = DEFAULT_LEVEL, seed = 42, ghostEvery = 2, lives = 3 } = {}) {
  const { grid } = level;
  const rows = grid.length;
  const cols = grid[0].length;
  let rng;
  let s;

  const isOpen = (r, c) => r >= 0 && r < rows && c >= 0 && c < cols && grid[r][c] !== '#';

  function moves(pos) {
    const out = [];
    for (const dir of ORDER) {
      const [dr, dc] = DIRECTIONS[dir];
      const r = pos[0] + dr;
      const c = pos[1] + dc;
      if (isOpen(r, c)) out.push({ dir, pos: [r, c] });
    }
    return out;
  }

  function reset() {
    rng = mulberry32(seed);
    const coinKeys = new Set(level.coins.map(posKey));
    const pellets = new Set();
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const k = key(r, c);
        if (isOpen(r, c) && !coinKeys.has(k) && k !== posKey(level.pacStart)) pellets.add(k);
      }
    }
    s = {
      tick: 0,
      status: 'playing',
      pac: { pos: [...level.pacStart], dir: 'LEFT' },
      ghosts: level.ghosts.map((g) => ({ id: g.id, behavior: g.behavior, start: [...g.start], pos: [...g.start], dir: 'LEFT' })),
      pellets,
      coins: coinKeys,
      score: 0,
      lives,
      totals: { pellets: pellets.size, coins: coinKeys.size },
      agent: null,
    };
    refreshPlan();
    return snapshot();
  }

  function bfs(blocked) {
    const start = s.pac.pos;
    const startKey = posKey(start);
    const parent = new Map([[startKey, null]]);
    const queue = [start];
    const explored = [];
    while (queue.length) {
      const cur = queue.shift();
      const ck = posKey(cur);
      if (ck !== startKey) {
        explored.push(cur);
        if (s.pellets.has(ck) || s.coins.has(ck)) {
          const path = [];
          for (let k = ck; k !== null; k = parent.get(k)) path.push(k.split(',').map(Number));
          return { path: path.reverse(), explored };
        }
      }
      for (const m of moves(cur)) {
        const mk = posKey(m.pos);
        if (parent.has(mk) || blocked.has(mk)) continue;
        parent.set(mk, ck);
        queue.push(m.pos);
      }
    }
    return { path: null, explored };
  }

  function plan() {
    const t0 = now();
    const blocked = new Set();
    for (const g of s.ghosts) {
      blocked.add(posKey(g.pos));
      for (const m of moves(g.pos)) blocked.add(posKey(m.pos));
    }
    blocked.delete(posKey(s.pac.pos));
    let result = bfs(blocked);
    if (!result.path) result = bfs(new Set(s.ghosts.map((g) => posKey(g.pos))));
    let action = null;
    if (result.path && result.path.length > 1) {
      const [a, b] = result.path;
      action = Object.keys(DIRECTIONS).find((d) => a[0] + DIRECTIONS[d][0] === b[0] && a[1] + DIRECTIONS[d][1] === b[1]);
    } else {
      // Boxed in: step to the neighbour farthest from the nearest ghost.
      let best = -1;
      for (const m of moves(s.pac.pos)) {
        const d = Math.min(...s.ghosts.map((g) => manhattan(g.pos, m.pos)));
        if (d > best) {
          best = d;
          action = m.dir;
        }
      }
    }
    return {
      action,
      path: result.path ?? [],
      explored_cells: result.explored,
      target: result.path ? result.path[result.path.length - 1] : null,
      explored_nodes: result.explored.length,
      decision_time_ms: Math.round((now() - t0) * 100) / 100,
    };
  }

  function ghostMove(g) {
    let options = moves(g.pos);
    if (options.length > 1) options = options.filter((m) => m.dir !== REVERSE[g.dir]);
    if (g.behavior === 'random') return options[Math.floor(rng() * options.length)];
    let goal = s.pac.pos;
    if (g.behavior === 'ambush') {
      const [dr, dc] = DIRECTIONS[s.pac.dir];
      goal = [s.pac.pos[0] + dr * 4, s.pac.pos[1] + dc * 4];
    }
    return options.reduce((best, m) => (manhattan(m.pos, goal) < manhattan(best.pos, goal) ? m : best));
  }

  function loseLife() {
    s.lives -= 1;
    if (s.lives <= 0) {
      s.lives = 0;
      s.status = 'lost';
      return;
    }
    s.pac = { pos: [...level.pacStart], dir: 'LEFT' };
    s.ghosts.forEach((g) => {
      g.pos = [...g.start];
      g.dir = 'LEFT';
    });
  }

  function step() {
    if (s.status !== 'playing') return snapshot();
    const agent = plan();
    const before = s.pac.pos;
    if (agent.action) {
      const [dr, dc] = DIRECTIONS[agent.action];
      const next = [before[0] + dr, before[1] + dc];
      if (isOpen(next[0], next[1])) {
        s.pac = { pos: next, dir: agent.action };
      }
    }
    const pk = posKey(s.pac.pos);
    if (s.pellets.delete(pk)) s.score += POINTS.pellet;
    if (s.coins.delete(pk)) s.score += POINTS.coin;

    let caught = s.ghosts.some((g) => posKey(g.pos) === pk);
    if (!caught && s.tick % ghostEvery === 0) {
      for (const g of s.ghosts) {
        const prev = g.pos;
        const m = ghostMove(g);
        if (m) {
          g.pos = m.pos;
          g.dir = m.dir;
        }
        const swapped = posKey(prev) === pk && posKey(g.pos) === posKey(before);
        if (posKey(g.pos) === pk || swapped) caught = true;
      }
    }
    s.tick += 1;
    if (caught) loseLife();
    if (s.status === 'playing' && s.pellets.size === 0 && s.coins.size === 0) s.status = 'won';
    refreshPlan();
    return snapshot();
  }

  // "agent" always describes what the agent intends to do from where it stands
  // now: the next action, the route (excluding its own cell) and the target.
  function refreshPlan() {
    if (s.status !== 'playing') {
      s.agent = { action: null, path: [], explored_cells: [], target: null, explored_nodes: 0, decision_time_ms: 0 };
      return;
    }
    const p = plan();
    s.agent = { ...p, path: p.path.slice(1) };
  }

  function snapshot() {
    const toPos = (k) => k.split(',').map(Number);
    return {
      tick: s.tick,
      status: s.status,
      grid: grid.slice(),
      pacman: { pos: [...s.pac.pos], dir: s.pac.dir },
      ghosts: s.ghosts.map((g) => ({ id: g.id, pos: [...g.pos] })),
      pellets: [...s.pellets].map(toPos),
      coins: [...s.coins].map(toPos),
      score: s.score,
      lives: s.lives,
      totals: { ...s.totals },
      agent: {
        ...s.agent,
        path: s.agent.path.map((p) => [...p]),
        explored_cells: s.agent.explored_cells.map((p) => [...p]),
        target: s.agent.target ? [...s.agent.target] : null,
      },
    };
  }

  reset();
  return { reset, step, getState: snapshot };
}
