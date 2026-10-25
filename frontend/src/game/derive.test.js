import { describe, expect, it } from 'vitest';
import { buildCells, dangerKeys, fmtPos, pad } from './derive.js';
import { normalizeState } from './contract.js';

const state = () =>
  normalizeState({
    tick: 1,
    status: 'playing',
    grid: ['#######', '#.....#', '#######'],
    pacman: { pos: [1, 1], dir: 'RIGHT' },
    ghosts: [{ id: 'red', pos: [1, 5] }],
    pellets: [[1, 2], [1, 3]],
    coins: [[1, 4]],
    score: 0,
    lives: 3,
    agent: { action: 'RIGHT', path: [[1, 2], [1, 3]], explored_cells: [[1, 2], [1, 3], [1, 4]], target: [1, 3] },
  });

const at = (cells, cols, r, c) => cells[r * cols + c];

describe('buildCells', () => {
  it('marks every layer in the right cell', () => {
    const s = state();
    const cells = buildCells(s);
    expect(cells).toHaveLength(21);
    expect(at(cells, 7, 0, 0).wall).toBe(true);
    expect(at(cells, 7, 1, 1)).toMatchObject({ pac: true, pellet: false });
    expect(at(cells, 7, 1, 2)).toMatchObject({ pellet: true, path: true, explored: false });
    expect(at(cells, 7, 1, 3)).toMatchObject({ target: true, path: false });
    expect(at(cells, 7, 1, 4)).toMatchObject({ coin: true, explored: true, danger: true });
    expect(at(cells, 7, 1, 5).ghost).toMatchObject({ body: '#E43B44' });
  });

  it('hides overlays that are switched off', () => {
    const cells = buildCells(state(), { showExplored: false, showPath: false, showDanger: false });
    expect(cells.some((c) => c.path || c.target || c.explored || c.danger)).toBe(false);
    expect(cells.filter((c) => c.pellet)).toHaveLength(2);
  });
});

describe('helpers', () => {
  it('finds danger cells within two steps of a ghost, skipping walls', () => {
    const keys = dangerKeys(state());
    expect([...keys].sort()).toEqual(['1,3', '1,4', '1,5']);
  });

  it('formats numbers and positions', () => {
    expect(pad(42, 6)).toBe('000042');
    expect(pad(-3, 2)).toBe('00');
    expect(fmtPos([7, 10])).toBe('(7,10)');
    expect(fmtPos(null)).toBe('—');
  });
});
