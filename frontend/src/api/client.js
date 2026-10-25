// Talks to the game. With no VITE_API_URL set it runs the in-browser mock engine;
// with VITE_API_URL set (for example "/api") it calls the FastAPI backend:
//   POST {base}/reset   POST {base}/step   GET {base}/state
// Every call resolves to a normalised state (see game/contract.js).

import { normalizeState } from '../game/contract.js';
import { createMockEngine } from '../game/mockEngine.js';

export function createClient({ baseUrl = import.meta.env?.VITE_API_URL, fetchImpl = globalThis.fetch, engine } = {}) {
  if (!baseUrl) {
    const mock = engine ?? createMockEngine();
    return {
      mode: 'mock',
      reset: async () => normalizeState(mock.reset()),
      step: async () => normalizeState(mock.step()),
      getState: async () => normalizeState(mock.getState()),
    };
  }

  const base = baseUrl.replace(/\/+$/, '');

  async function request(path, method) {
    let res;
    try {
      res = await fetchImpl(`${base}${path}`, { method, headers: { Accept: 'application/json' } });
    } catch {
      throw new Error(`Can't reach the game server at ${base}. Check that the backend is running.`);
    }
    if (!res.ok) throw new Error(`The game server answered ${res.status} to ${method} ${path}.`);
    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error(`The game server's reply to ${path} wasn't JSON.`);
    }
    return normalizeState(data);
  }

  return {
    mode: 'live',
    baseUrl: base,
    reset: () => request('/reset', 'POST'),
    step: () => request('/step', 'POST'),
    getState: () => request('/state', 'GET'),
  };
}
