// Talks to the FastAPI game server. The base URL defaults to "/api", which the
// Vite dev server forwards to http://localhost:8000 (see vite.config.js).
// Set VITE_API_URL to point somewhere else.
//   POST {base}/reset   POST {base}/step   GET {base}/state
// Every call resolves to a normalised state (see game/contract.js).

import { normalizeState } from '../game/contract.js';

export const DEFAULT_API_URL = '/api';

export function createClient({ baseUrl, fetchImpl = globalThis.fetch } = {}) {
  const base = (baseUrl || import.meta.env?.VITE_API_URL || DEFAULT_API_URL).replace(/\/+$/, '');
  const hint = 'Check that the backend is running.';

  async function request(path, method) {
    let res;
    try {
      res = await fetchImpl(`${base}${path}`, { method, headers: { Accept: 'application/json' } });
    } catch {
      throw new Error(`Can't reach the game server at ${base}. ${hint}`);
    }
    // 502–504 come from the dev proxy when nothing is listening on the backend port.
    if ([502, 503, 504].includes(res.status)) throw new Error(`Can't reach the game server at ${base}. ${hint}`);
    if (!res.ok) throw new Error(`The game server answered ${res.status} to ${method} ${path}. ${hint}`);
    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error(`The game server's reply to ${path} wasn't JSON.`);
    }
    return normalizeState(data);
  }

  return {
    baseUrl: base,
    reset: () => request('/reset', 'POST'),
    step: () => request('/step', 'POST'),
    getState: () => request('/state', 'GET'),
  };
}
