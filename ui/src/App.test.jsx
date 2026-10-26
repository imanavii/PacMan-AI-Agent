import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App.jsx';
import { createFakeClient } from './test/fakeServer.js';

async function renderApp(client = createFakeClient()) {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(<App client={client} />);
  await screen.findByText('PRESS START');
  return user;
}

describe('App', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => vi.useRealTimers());

  it('loads the board with the HUD and waits for start', async () => {
    await renderApp();
    expect(screen.getByRole('heading', { name: 'PAC-AGENT' })).toBeInTheDocument();
    expect(screen.getByTestId('score')).toHaveTextContent('000000');
    expect(screen.getByTestId('coins')).toHaveTextContent('00/01');
    expect(screen.getByTestId('moves')).toHaveTextContent('0000');
    expect(screen.getByTestId('agent-pos')).toHaveTextContent('(1,1)');
    expect(screen.getByRole('img', { name: /Maze, 5 rows by 7 columns/ })).toBeInTheDocument();
  });

  it('steps one move at a time with STEP', async () => {
    const user = await renderApp();
    await user.click(screen.getByRole('button', { name: 'Step one move' }));
    expect(await screen.findByTestId('moves')).toHaveTextContent('0001');
    expect(screen.getByTestId('agent-pos')).toHaveTextContent('(1,2)');
    expect(screen.getByTestId('score')).toHaveTextContent('000010');
    expect(screen.getByText('PAUSED')).toBeInTheDocument();
  });

  it('runs on a timer after START and stops on PAUSE', async () => {
    const user = await renderApp();
    await user.click(screen.getByRole('button', { name: 'START' }));
    expect(screen.queryByText('PRESS START')).not.toBeInTheDocument();
    const ticks = async (n) => {
      for (let i = 0; i < n; i++) {
        await act(async () => {
          vi.advanceTimersByTime(350);
        });
      }
    };
    await ticks(5);
    const moves = Number(screen.getByTestId('moves').textContent);
    expect(moves).toBeGreaterThanOrEqual(4);
    await user.click(screen.getByRole('button', { name: 'PAUSE' }));
    await ticks(5);
    expect(Number(screen.getByTestId('moves').textContent)).toBe(moves);
    expect(screen.getByText('PAUSED')).toBeInTheDocument();
  });

  it('RESET puts the board back to the start', async () => {
    const user = await renderApp();
    const step = screen.getByRole('button', { name: 'Step one move' });
    await user.click(step);
    await user.click(step);
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(await screen.findByText('PRESS START')).toBeInTheDocument();
    expect(screen.getByTestId('moves')).toHaveTextContent('0000');
  });

  it('switches frame size and overlays', async () => {
    const user = await renderApp();
    const large = screen.getByRole('button', { name: 'Large frame' });
    await user.click(large);
    expect(large).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Medium frame' })).toHaveAttribute('aria-pressed', 'false');

    const coords = screen.getByRole('button', { name: 'COORDS' });
    expect(coords).toHaveAttribute('aria-pressed', 'false');
    await user.click(coords);
    expect(coords).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: 'Step one move' }));
    const routeMarks = () => screen.queryAllByTestId('path').length + screen.queryAllByTestId('target').length;
    expect(routeMarks()).toBeGreaterThan(0);
    await user.click(screen.getByRole('button', { name: 'ROUTE' }));
    expect(routeMarks()).toBe(0);
    await user.click(screen.getByRole('button', { name: 'DANGER' }));
    expect(screen.queryAllByTestId('danger')).toHaveLength(0);
  });

  it('shows NO SIGNAL with a retry when the backend is down', async () => {
    let up = false;
    const sample = createFakeClient();
    const client = {
      reset: vi.fn(async () => {
        if (!up) throw new Error("Can't reach the game server at /api. Check that the backend is running.");
        return sample.reset();
      }),
      step: vi.fn(() => sample.step()),
      getState: vi.fn(() => sample.getState()),
    };
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<App client={client} />);
    expect(await screen.findByText('NO SIGNAL')).toBeInTheDocument();
    expect(screen.getByText(/Can't reach the game server/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'START' })).toBeDisabled();
    up = true;
    const status = screen.getByRole('status');
    await user.click(within(status).getByRole('button', { name: 'RETRY' }));
    expect(await screen.findByText('PRESS START')).toBeInTheDocument();
  });
});
