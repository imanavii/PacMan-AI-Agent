import { Maze } from './Maze.jsx';

export function ScreenOverlay({ title, body, action, onAction }) {
  return <div className="screen-overlay" role="status"><div className="screen-overlay-box">
    <span className="screen-overlay-title">{title}</span>
    {body && <span className="screen-overlay-body">{body}</span>}
    {action && <button type="button" className="screen-overlay-btn" onClick={onAction}>{action}</button>}
  </div></div>;
}

export function Screen({ state, cells, showCoords, crt, overlay }) {
  if (!state) return <section className="screen screen-empty" aria-label="Game board">{overlay}</section>;
  const label = `Maze, ${state.rows} rows by ${state.cols} columns. Agent at row ${state.pacman.pos[0]}, column ${state.pacman.pos[1]}, facing ${state.pacman.dir.toLowerCase()}. ${state.ghosts.length} ghosts on the board.`;
  return <section className="screen" aria-label="Game board">
    <Maze cells={cells} rows={state.rows} cols={state.cols} showCoords={showCoords} crt={crt}
      label={label} dir={state.pacman.dir} mouth={state.status === 'playing' && state.tick % 2 === 0 ? 'open' : 'closed'} overlay={overlay} />
  </section>;
}
