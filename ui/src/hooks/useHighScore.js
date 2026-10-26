import { useEffect, useState } from 'react';

const STORAGE_KEY = 'pac-agent.high-score';

function read() {
  try {
    const v = Number(window.localStorage.getItem(STORAGE_KEY));
    return Number.isFinite(v) && v > 0 ? v : 0;
  } catch {
    return 0;
  }
}

// Best score seen in this browser. Saved locally; falls back to memory only.
export function useHighScore(score) {
  const [best, setBest] = useState(read);
  const current = typeof score === 'number' ? score : 0;

  // Raising the best score while rendering avoids an extra render pass.
  if (current > best) setBest(current);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(best));
    } catch {
      // Storage can be blocked (private mode); keep the in-memory value.
    }
  }, [best]);

  return Math.max(best, current);
}
