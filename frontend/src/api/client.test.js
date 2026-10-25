import { describe, expect, it, vi } from 'vitest';
import { createClient } from './client.js';
import { createMockEngine } from '../game/mockEngine.js';

const engine = createMockEngine();
const sample = () => engine.reset();

describe('createClient', () => {
  it('uses the mock engine when no backend URL is set', async () => {
    const client = createClient({ baseUrl: '' });
    expect(client.mode).toBe('mock');
    const s = await client.reset();
    expect(s.tick).toBe(0);
    const s2 = await client.step();
    expect(s2.tick).toBe(1);
  });

  it('calls the backend endpoints when a URL is set', async () => {
    const fetchImpl = vi.fn(async () => ({ ok: true, json: async () => sample() }));
    const client = createClient({ baseUrl: 'http://localhost:8000/api/', fetchImpl });
    expect(client.mode).toBe('live');
    await client.reset();
    await client.step();
    await client.getState();
    expect(fetchImpl.mock.calls.map(([url, opts]) => `${opts.method} ${url}`)).toEqual([
      'POST http://localhost:8000/api/reset',
      'POST http://localhost:8000/api/step',
      'GET http://localhost:8000/api/state',
    ]);
  });

  it('explains when the server is unreachable', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    });
    const client = createClient({ baseUrl: '/api', fetchImpl });
    await expect(client.reset()).rejects.toThrow(/Can't reach the game server at \/api/);
  });

  it('reports HTTP errors and bad JSON', async () => {
    const bad = createClient({ baseUrl: '/api', fetchImpl: async () => ({ ok: false, status: 500 }) });
    await expect(bad.step()).rejects.toThrow(/answered 500 to POST \/step/);
    const notJson = createClient({
      baseUrl: '/api',
      fetchImpl: async () => ({ ok: true, json: async () => { throw new SyntaxError('x'); } }),
    });
    await expect(notJson.step()).rejects.toThrow(/wasn't JSON/);
  });

  it('rejects a reply that breaks the contract', async () => {
    const client = createClient({ baseUrl: '/api', fetchImpl: async () => ({ ok: true, json: async () => ({ score: 1 }) }) });
    await expect(client.reset()).rejects.toThrow(/invalid/);
  });
});
