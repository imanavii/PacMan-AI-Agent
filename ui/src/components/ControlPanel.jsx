import { TOGGLES } from './options.js';

const OFFSET = { LEFT: [-18, 0], RIGHT: [18, 0], UP: [0, -18], DOWN: [0, 18] };

export function Joystick({ dir }) {
  const [x, y] = OFFSET[dir] ?? [0, 0];
  const led = (d) => (dir === d ? 'var(--c-yellow)' : 'var(--c-panel)');
  return (
    <div className="joystick-block">
      <div className="joystick" role="img" aria-label={`Joystick pushed ${dir ?? 'nowhere'}`}>
        <svg className="joy-led joy-up" width="16" height="12" viewBox="0 0 4 3" shapeRendering="crispEdges" aria-hidden="true">
          <path d="M1 0h2v1H1z M0 1h4v2H0z" fill={led('UP')} />
        </svg>
        <svg className="joy-led joy-down" width="16" height="12" viewBox="0 0 4 3" shapeRendering="crispEdges" aria-hidden="true">
          <path d="M0 0h4v2H0z M1 2h2v1H1z" fill={led('DOWN')} />
        </svg>
        <svg className="joy-led joy-left" width="12" height="16" viewBox="0 0 3 4" shapeRendering="crispEdges" aria-hidden="true">
          <path d="M0 1h1v2H0z M1 0h2v4H1z" fill={led('LEFT')} />
        </svg>
        <svg className="joy-led joy-right" width="12" height="16" viewBox="0 0 3 4" shapeRendering="crispEdges" aria-hidden="true">
          <path d="M0 0h2v4H0z M2 1h1v2H2z" fill={led('RIGHT')} />
        </svg>
        <div className="joy-base" />
        <div className="joy-pivot" />
        <div className="joy-ball" style={{ transform: `translate(${x}px, ${y}px)` }} />
      </div>
      <span className="sticker">AGENT MOVE · {dir ?? '—'}</span>
    </div>
  );
}

export function ControlPanel({ dir, running, canRun, onToggleRun, onStep, onReset, toggles, onToggle }) {
  return <section className="info-panel control-panel" aria-label="Control panel">
    <h2>Controls</h2>
    <div className="control-main"><Joystick dir={dir} /><div className="playback-buttons">
      <button type="button" className="play-button" aria-label={running ? 'PAUSE' : 'START'} disabled={!canRun} onClick={onToggleRun}>{running ? 'Pause' : 'Play'}</button>
      <div className="secondary-buttons"><button type="button" aria-label="Step one move" disabled={!canRun} onClick={onStep}>Step</button><button type="button" aria-label="Reset" onClick={onReset}>Reset</button></div>
    </div></div>
    <div className="display-toggles" role="group" aria-label="Display overlays">{TOGGLES.filter((t) => t.id !== 'crt').map((toggle) =>
      <button type="button" key={toggle.id} aria-pressed={Boolean(toggles[toggle.id])} onClick={() => onToggle(toggle.id)}>{toggle.label}</button>)}</div>
  </section>;
}
