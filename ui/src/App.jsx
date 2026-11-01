import { useMemo, useState } from 'react';
import { createClient } from './api/client.js';
import { useGame } from './hooks/useGame.js';
import { useHighScore } from './hooks/useHighScore.js';
import { buildCells, pad } from './game/derive.js';
import { Screen, ScreenOverlay } from './components/Screen.jsx';
import { AnalysisPanel, LegendPanel } from './components/Panels.jsx';
import { ControlPanel } from './components/ControlPanel.jsx';
import { DEFAULT_TOGGLES } from './components/options.js';

function pickOverlay(game) {
  const { state, error, loading, running } = game;
  if (error) return { title: 'NO SIGNAL', body: error, action: 'RETRY', onAction: game.reset };
  if (!state) return { title: loading ? 'LOADING…' : 'NO GAME' };
  if (state.status === 'won') return { title: 'STAGE CLEAR', action: 'PLAY AGAIN', onAction: game.reset };
  if (state.status === 'lost') return { title: 'GAME OVER', body: 'Out of lives', action: 'TRY AGAIN', onAction: game.reset };
  if (!running && state.tick === 0) return { title: 'PRESS START' };
  if (!running) return { title: 'PAUSED' };
  return null;
}

export default function App({ client: injectedClient } = {}) {
  const client = useMemo(() => injectedClient ?? createClient(), [injectedClient]);
  const game = useGame(client);
  const [toggles, setToggles] = useState({ ...DEFAULT_TOGGLES, showExplored: false, showDanger: false, crt: false });
  const hiScore = useHighScore(game.state?.score ?? 0);
  const cells = useMemo(() => game.state ? buildCells(game.state, toggles) : [], [game.state, toggles]);
  const overlay = pickOverlay(game);
  const state = game.state;

  return (
    <main className="game-app" aria-label="Pac-Agent game dashboard">
      <header className="app-header">
        <div className="brand"><span className="brand-mark" aria-hidden="true">PAC</span><h1>Pacman Agent</h1></div>
        <span className="app-subtitle">THE MAZE THAT PLAYS ITSELF</span>
        <span className={`connection ${game.error ? 'offline' : ''}`}>{game.error ? 'Disconnected' : game.loading ? 'Connecting' : 'Local game'}</span>
      </header>

      <section className="stats-bar" aria-label="Game statistics">
        <div className="stat-card"><span>Score</span><strong className="score" data-testid="score">{pad(state?.score ?? 0, 5)}</strong></div>
        <div className="stat-card"><span>Lives</span><div className="life-hearts" aria-label={`${state?.lives ?? 0} lives left`}>{Array.from({ length: 3 }, (_, i) => <span key={i} className={i < (state?.lives ?? 0) ? 'heart active' : 'heart'} aria-hidden="true">♥</span>)}</div></div>
        <div className="stat-card"><span>Stage</span><strong>01</strong></div>
        <div className="stat-card"><span>Pellets left</span><strong data-testid="pellets-left">{pad(state?.pellets.length ?? 0, 3)}</strong></div>
      </section>

      <div className="game-workspace">
        <Screen state={state} cells={cells} showCoords={toggles.showCoords} crt={toggles.crt} overlay={overlay && <ScreenOverlay {...overlay} />} />
        <aside className="game-sidebar" aria-label="Game information and controls">
          <AnalysisPanel state={state} />
          <LegendPanel />
          <ControlPanel dir={state?.pacman.dir} running={game.running} canRun={game.canRun}
            onToggleRun={game.toggleRun} onStep={game.stepOnce} onReset={game.reset}
            toggles={toggles} onToggle={(id) => setToggles((current) => ({ ...current, [id]: !current[id] }))} />
        </aside>
      </div>

      <footer className="app-footer"><span>Autonomous play · {pad(state?.tick ?? 0, 4)} moves</span><span>High score {pad(hiScore, 5)} · Coins <span data-testid="coins">{state ? state.totals.coins - state.coins.length : 0}/{state?.totals.coins ?? 0}</span></span></footer>
    </main>
  );
}
