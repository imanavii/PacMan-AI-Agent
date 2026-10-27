import { useMemo, useState } from 'react';
import { createClient } from './api/client.js';
import { useGame } from './hooks/useGame.js';
import { useHighScore } from './hooks/useHighScore.js';
import { buildCells } from './game/derive.js';
import { Screen, ScreenOverlay } from './components/Screen.jsx';
import { BoardPanel, LegendPanel } from './components/Panels.jsx';
import { ControlPanel } from './components/ControlPanel.jsx';
import { DEFAULT_TOGGLES, FRAME_SIZES } from './components/options.js';
import { Background, Parade } from './components/Ambient.jsx';
import { COURSE_LABEL, TEAM_NAMES } from './config.js';

function pickOverlay(game) {
  const { state, error, loading, running } = game;
  if (error) return { title: 'NO SIGNAL', body: error, action: 'RETRY', onAction: game.reset };
  if (!state) return { title: loading ? 'LOADING…' : 'NO GAME' };
  if (state.status === 'won') return { title: 'STAGE CLEAR', body: 'every pellet and coin collected', action: 'PLAY AGAIN', onAction: game.reset };
  if (state.status === 'lost') return { title: 'GAME OVER', body: 'out of lives', action: 'TRY AGAIN', onAction: game.reset };
  if (!running && state.tick === 0) return { title: 'PRESS START' };
  if (!running) return { title: 'PAUSED' };
  return null;
}

export default function App({ client: injectedClient } = {}) {
  const client = useMemo(() => injectedClient ?? createClient(), [injectedClient]);
  const game = useGame(client);
  const [size, setSize] = useState('m');
  const [toggles, setToggles] = useState(DEFAULT_TOGGLES);
  const hiScore = useHighScore(game.state?.score ?? 0);

  const cells = useMemo(() => (game.state ? buildCells(game.state, toggles) : []), [game.state, toggles]);
  const tile = FRAME_SIZES.find((f) => f.id === size)?.tile ?? 29;
  const overlay = pickOverlay(game);

  return (
    <div className="page">
      <div className="stripes" aria-hidden="true">
        <span className="stripe stripe-red" />
        <span className="stripe stripe-orange" />
        <span className="stripe stripe-blue" />
      </div>
      <Background />

      <div className="page-content">
        <div className="cabinet-wrap">
          <Parade />
          <main className="cabinet" aria-label="Pac-Agent arcade cabinet">
            <div className="marquee">
              <h1 className="marquee-title">PAC-AGENT</h1>
              <div className="marquee-sub">THE MAZE THAT PLAYS ITSELF</div>
            </div>

            <div className="cabinet-body">
              <LegendPanel />
              <Screen
                state={game.state}
                cells={cells}
                tile={tile}
                showCoords={toggles.showCoords}
                crt={toggles.crt}
                hiScore={hiScore}
                overlay={overlay && <ScreenOverlay {...overlay} />}
              />
              <BoardPanel state={game.state} />
            </div>

            <ControlPanel
              dir={game.state?.pacman.dir}
              running={game.running}
              canRun={game.canRun}
              onToggleRun={game.toggleRun}
              onStep={game.stepOnce}
              onReset={game.reset}
              size={size}
              onSize={setSize}
              toggles={toggles}
              onToggle={(id) => setToggles((t) => ({ ...t, [id]: !t[id] }))}
            />

            <div className="coin-door">
              <div className="coin-slot" aria-hidden="true">
                <span className="coin-slot-gap" />
                <span className="coin-slot-label">25¢</span>
              </div>
              <div className="coin-slot" aria-hidden="true">
                <span className="coin-slot-gap" />
                <span className="coin-slot-label">25¢</span>
              </div>
              <p className="coin-note">no coins needed. the robot plays by itself, just watch :)</p>
            </div>
          </main>
        </div>

        <div className="parade-spacer" aria-hidden="true" />
        <footer className="footer">
          <span>© 2026 {TEAM_NAMES} · {COURSE_LABEL}</span>
          <span>PELLET 10 · COIN 50</span>
        </footer>
      </div>
    </div>
  );
}
