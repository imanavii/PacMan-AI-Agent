import { FRAME_SIZES, TOGGLES } from './options.js';

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

function KeyButton({ active, onClick, label, ariaLabel, className = '' }) {
  return (
    <button
      type="button"
      className={`key-btn ${active ? 'is-active' : ''} ${className}`}
      aria-pressed={active}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export function ControlPanel({ dir, running, canRun, onToggleRun, onStep, onReset, size, onSize, toggles, onToggle }) {
  const runLabel = running ? 'PAUSE' : 'START';
  return (
    <section className="control-panel" aria-label="Control panel">
      <Joystick dir={dir} />

      <div className="arcade-buttons">
        <div className="arcade-btn-block">
          <button
            type="button"
            className={`arcade-btn arcade-btn-start ${running ? 'is-down' : ''}`}
            aria-label={runLabel}
            onClick={onToggleRun}
            disabled={!canRun}
          >
            {running ? (
              <svg width="18" height="18" viewBox="0 0 6 6" shapeRendering="crispEdges" aria-hidden="true">
                <path d="M1 1h1v4H1z M4 1h1v4H4z" fill="#3E2731" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 6 6" shapeRendering="crispEdges" aria-hidden="true">
                <path d="M1 0h1v6H1z M2 1h1v4H2z M3 2h1v2H3z" fill="#3E2731" />
              </svg>
            )}
          </button>
          <span className="sticker">{runLabel}</span>
        </div>
        <div className="arcade-btn-block">
          <button type="button" className="arcade-btn arcade-btn-step" aria-label="Step one move" onClick={onStep} disabled={!canRun} />
          <span className="sticker sticker-tilt-r">STEP</span>
        </div>
        <div className="arcade-btn-block">
          <button type="button" className="arcade-btn arcade-btn-reset" aria-label="Reset" onClick={onReset} />
          <span className="sticker">RESET</span>
        </div>
      </div>

      <div className="settings">
        <div role="group" aria-label="Frame size" className="setting-group">
          <span className="setting-label">FRAME</span>
          <div className="key-row">
            {FRAME_SIZES.map((f) => (
              <KeyButton
                key={f.id}
                active={size === f.id}
                onClick={() => onSize(f.id)}
                label={f.label}
                ariaLabel={`${f.name} frame`}
                className="key-btn-frame"
              />
            ))}
          </div>
        </div>
        <div role="group" aria-label="Show on screen" className="setting-group">
          <span className="setting-label">SHOW ON SCREEN</span>
          <div className="key-row key-row-wrap">
            {TOGGLES.map((t) => (
              <button
                type="button"
                key={t.id}
                className="toggle-btn"
                aria-pressed={Boolean(toggles[t.id])}
                onClick={() => onToggle(t.id)}
              >
                <span className={`toggle-led ${toggles[t.id] ? 'is-on' : ''}`} aria-hidden="true" />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
