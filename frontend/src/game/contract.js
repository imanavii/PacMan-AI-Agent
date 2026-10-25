// Shared game-state contract between the FastAPI backend and this frontend.
// Every position is [row, col], counted from the top-left corner (0, 0).
// The full description lives in frontend/API_CONTRACT.md.

export const DIRECTIONS = {
  UP: [-1, 0],
  DOWN: [1, 0],
  LEFT: [0, -1],
  RIGHT: [0, 1],
};

export const STATUSES = ['playing', 'won', 'lost'];

export const POINTS = { pellet: 10, coin: 50 };

export const key = (row, col) => `${row},${col}`;
export const posKey = (pos) => key(pos[0], pos[1]);

const isInt = (v) => Number.isInteger(v);
const isPos = (p) => Array.isArray(p) && p.length === 2 && isInt(p[0]) && isInt(p[1]);
const isNum = (v) => typeof v === 'number' && Number.isFinite(v);

function fail(message) {
  throw new Error(`Game state from the server is invalid: ${message}`);
}

function posList(value, name, required = true) {
  if (value == null) {
    if (required) fail(`"${name}" is missing`);
    return [];
  }
  if (!Array.isArray(value)) fail(`"${name}" must be a list of [row, col] pairs`);
  value.forEach((p, i) => {
    if (!isPos(p)) fail(`"${name}[${i}]" must be [row, col] with whole numbers`);
  });
  return value.map((p) => [p[0], p[1]]);
}

// Checks a raw state object and returns a clean copy with defaults filled in.
// Throws a readable Error when a required field is missing or malformed.
export function normalizeState(raw) {
  if (!raw || typeof raw !== 'object') fail('expected a JSON object');

  const { grid } = raw;
  if (!Array.isArray(grid) || grid.length === 0) fail('"grid" must be a non-empty list of strings');
  const cols = grid[0].length;
  grid.forEach((row, i) => {
    if (typeof row !== 'string') fail(`"grid[${i}]" must be a string`);
    if (row.length !== cols) fail(`"grid[${i}]" has ${row.length} columns, expected ${cols}`);
  });

  if (!raw.pacman || !isPos(raw.pacman.pos)) fail('"pacman.pos" must be [row, col]');
  const dir = raw.pacman.dir ?? 'LEFT';
  if (!DIRECTIONS[dir]) fail(`"pacman.dir" must be one of ${Object.keys(DIRECTIONS).join(', ')}`);

  if (!Array.isArray(raw.ghosts)) fail('"ghosts" must be a list');
  const ghosts = raw.ghosts.map((g, i) => {
    if (!g || !isPos(g.pos)) fail(`"ghosts[${i}].pos" must be [row, col]`);
    return { id: String(g.id ?? `ghost-${i}`), pos: [g.pos[0], g.pos[1]] };
  });

  const pellets = posList(raw.pellets, 'pellets');
  const coins = posList(raw.coins, 'coins', false);

  if (!isNum(raw.score)) fail('"score" must be a number');
  if (!isNum(raw.lives)) fail('"lives" must be a number');
  if (!isNum(raw.tick)) fail('"tick" must be a number');
  if (!STATUSES.includes(raw.status)) fail(`"status" must be one of ${STATUSES.join(', ')}`);

  const totals = raw.totals ?? {};
  const agent = raw.agent ?? {};
  const action = agent.action ?? null;
  if (action !== null && !DIRECTIONS[action]) fail('"agent.action" must be a direction or null');

  return {
    tick: raw.tick,
    status: raw.status,
    grid: grid.slice(),
    rows: grid.length,
    cols,
    pacman: { pos: [raw.pacman.pos[0], raw.pacman.pos[1]], dir },
    ghosts,
    pellets,
    coins,
    score: raw.score,
    lives: raw.lives,
    totals: {
      pellets: isNum(totals.pellets) ? totals.pellets : pellets.length,
      coins: isNum(totals.coins) ? totals.coins : coins.length,
    },
    agent: {
      action,
      path: posList(agent.path, 'agent.path', false),
      exploredCells: posList(agent.explored_cells, 'agent.explored_cells', false),
      target: isPos(agent.target) ? [agent.target[0], agent.target[1]] : null,
      exploredNodes: isNum(agent.explored_nodes) ? agent.explored_nodes : null,
      decisionTimeMs: isNum(agent.decision_time_ms) ? agent.decision_time_ms : null,
    },
  };
}
