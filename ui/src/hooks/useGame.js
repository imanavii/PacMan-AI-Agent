import { useCallback, useEffect, useRef, useState } from 'react';

export const TICK_MS = 350;

// Drives the game: loads the first state, steps on a timer while running,
// and exposes start/pause, single step and reset.
export function useGame(client, { tickMs = TICK_MS } = {}) {
  const [state, setState] = useState(null);
  const [wantsToRun, setWantsToRun] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const seq = useRef(0);
  const inFlight = useRef(0);

  const call = useCallback(async (fn, { skipIfBusy = false } = {}) => {
    if (skipIfBusy && inFlight.current > 0) return;
    const id = ++seq.current;
    inFlight.current += 1;
    try {
      const next = await fn();
      if (id === seq.current) {
        setState(next);
        setError(null);
      }
    } catch (e) {
      if (id === seq.current) {
        setError(e?.message || String(e));
        setWantsToRun(false);
      }
    } finally {
      inFlight.current -= 1;
      if (id === seq.current) setLoading(false);
    }
  }, []);

  // Load the opening state from the game server.
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- fetching from an external system
    call(() => client.reset());
  }, [client, call]);

  const canRun = Boolean(state) && state.status === 'playing' && !error;
  const running = wantsToRun && canRun;

  useEffect(() => {
    if (!running) return undefined;
    const timer = setInterval(() => call(() => client.step(), { skipIfBusy: true }), tickMs);
    return () => clearInterval(timer);
  }, [running, client, call, tickMs]);

  const toggleRun = useCallback(() => {
    if (!canRun) return;
    setWantsToRun((r) => !r);
  }, [canRun]);

  const stepOnce = useCallback(() => {
    if (!canRun) return;
    setWantsToRun(false);
    call(() => client.step());
  }, [canRun, call, client]);

  const reset = useCallback(() => {
    setWantsToRun(false);
    setLoading(true);
    call(() => client.reset());
  }, [call, client]);

  return { state, running, error, loading, canRun, toggleRun, stepOnce, reset };
}
