// Pure helpers that turn a normalised game state into what the screen draws.

import { key, posKey } from './contract.js';

export const GHOST_COLORS = {
  red: { body: '#E43B44', eye: '#FFFFFF', label: 'RED' },
  pink: { body: '#F6757A', eye: '#FFFFFF', label: 'PINK' },
  cyan: { body: '#2CE8F5', eye: '#181425', label: 'CYAN' },
  orange: { body: '#F77622', eye: '#FFFFFF', label: 'ORANGE' },
};
const FALLBACK = [GHOST_COLORS.red, GHOST_COLORS.pink, GHOST_COLORS.cyan, GHOST_COLORS.orange];

export function ghostStyle(id, index) {
  return GHOST_COLORS[id] ?? { ...FALLBACK[index % FALLBACK.length], label: String(id).toUpperCase() };
}

export const DANGER_RADIUS = 2;

export function dangerKeys(state, radius = DANGER_RADIUS) {
  const out = new Set();
  for (const g of state.ghosts) {
    for (let dr = -radius; dr <= radius; dr++) {
      for (let dc = -radius; dc <= radius; dc++) {
        if (Math.abs(dr) + Math.abs(dc) > radius) continue;
        const r = g.pos[0] + dr;
        const c = g.pos[1] + dc;
        if (r < 0 || r >= state.rows || c < 0 || c >= state.cols) continue;
        if (state.grid[r][c] === '#') continue;
        out.add(key(r, c));
      }
    }
  }
  return out;
}

// One entry per grid cell, row by row, with the layers each cell should draw.
export function buildCells(state, { showExplored = true, showPath = true, showDanger = true } = {}) {
  const pellets = new Set(state.pellets.map(posKey));
  const coins = new Set(state.coins.map(posKey));
  const pacKey = posKey(state.pacman.pos);
  const targetKey = state.agent.target ? posKey(state.agent.target) : null;
  const pathKeys = new Set(state.agent.path.map(posKey));
  const exploredKeys = new Set(state.agent.exploredCells.map(posKey));
  const danger = showDanger ? dangerKeys(state) : new Set();
  const ghostAt = new Map();
  state.ghosts.forEach((g, i) => ghostAt.set(posKey(g.pos), ghostStyle(g.id, i)));

  const cells = [];
  for (let r = 0; r < state.rows; r++) {
    for (let c = 0; c < state.cols; c++) {
      const k = key(r, c);
      const wall = state.grid[r][c] === '#';
      const ghost = ghostAt.get(k) ?? null;
      const pac = k === pacKey;
      cells.push({
        key: k,
        wall,
        pellet: !wall && pellets.has(k) && !ghost && !pac,
        coin: !wall && coins.has(k) && !ghost && !pac,
        path: showPath && !wall && pathKeys.has(k) && k !== targetKey && !pac,
        target: showPath && k === targetKey && !pac,
        explored: showExplored && !wall && exploredKeys.has(k) && !pathKeys.has(k) && !pac,
        danger: !wall && danger.has(k) && !ghost && !pac,
        pac,
        ghost,
      });
    }
  }
  return cells;
}

export const pad = (n, width) => String(Math.max(0, Math.round(n))).padStart(width, '0');
export const fmtPos = (p) => (p ? `(${p[0]},${p[1]})` : '—');
