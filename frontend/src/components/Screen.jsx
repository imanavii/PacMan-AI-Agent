import { Coin, Mascot } from './Sprites.jsx';
import { Maze } from './Maze.jsx';
import { fmtPos, pad } from '../game/derive.js';

export function ScreenOverlay({ title, body, action, onAction }) {
  return (
    <div className="screen-overlay" role="status">
      <div className="screen-overlay-box">
        <span className="screen-overlay-title">{title}</span>
        {body && <span className="screen-overlay-body">{body}</span>}
        {action && (
          <button type="button" className="screen-overlay-btn" onClick={onAction}>
            {action}
          </button>
        )}
      </div>
    </div>
  );
}

export function Screen({ state, cells, tile, showCoords, crt, hiScore, overlay }) {
  if (!state) {
    return (
      <div className="screen">
        <div className="screen-empty">{overlay}</div>
      </div>
    );
  }
  const coinsGot = state.totals.coins - state.coins.length;
  const dir = state.pacman.dir;
  const mouth = state.status === 'playing' && state.tick % 2 === 0 ? 'open' : 'closed';
  const label = `Maze, ${state.rows} rows by ${state.cols} columns. Agent at row ${state.pacman.pos[0]}, column ${state.pacman.pos[1]}, facing ${dir.toLowerCase()}. ${state.ghosts.length} ghosts on the board.`;

  return (
    <div className="screen">
      <div className="hud hud-top">
        <div>
          <div className="hud-label hud-label-red">1UP</div>
          <div className="hud-value" data-testid="score">{pad(state.score, 6)}</div>
        </div>
        <div className="hud-center">
          <div className="hud-label hud-label-red">HIGH SCORE</div>
          <div className="hud-value">{pad(hiScore, 6)}</div>
        </div>
        <div className="hud-right">
          <div className="hud-label hud-label-orange">COINS</div>
          <div className="hud-coins">
            <Coin width={20} height={20} />
            <span className="hud-value" data-testid="coins">
              {pad(coinsGot, 2)}
              <span className="hud-dim">/{pad(state.totals.coins, 2)}</span>
            </span>
          </div>
        </div>
      </div>

      <Maze
        cells={cells}
        rows={state.rows}
        cols={state.cols}
        tile={tile}
        showCoords={showCoords}
        crt={crt}
        label={label}
        dir={dir}
        mouth={mouth}
        overlay={overlay}
      />

      <div className="hud hud-bottom">
        <div className="hud-lives" aria-label={`${state.lives} lives left`}>
          {Array.from({ length: Math.max(0, state.lives) }, (_, i) => (
            <Mascot key={i} width={22} height={20} dir="DOWN" mouth="closed" />
          ))}
          <span className="hud-small">LIVES {state.lives}</span>
        </div>
        <span className="hud-small">
          PELLETS <span className="hud-num hud-num-yellow" data-testid="pellets-left">{pad(state.pellets.length, 3)}</span>
          <span className="hud-dim"> LEFT</span>
        </span>
        <span className="hud-small">
          AGENT <span className="hud-num hud-num-cyan">{fmtPos(state.pacman.pos)}</span>
        </span>
        <span className="hud-small hud-green">STAGE 1</span>
      </div>
    </div>
  );
}
