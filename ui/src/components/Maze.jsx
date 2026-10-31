import { memo } from 'react';
import { Coin, Ghost, Mascot } from './Sprites.jsx';

function Cell({ cell, dir, mouth }) {
  if (cell.wall) {
    const [top, right, bottom, left] = cell.wallEdges;
    return (
      <div className="cell" data-testid="wall">
        <div className="cell-wall" style={{ borderWidth: `${top ? 2 : 0}px ${right ? 2 : 0}px ${bottom ? 2 : 0}px ${left ? 2 : 0}px`, borderRadius: `${top && left ? 5 : 0}px ${top && right ? 5 : 0}px ${bottom && right ? 5 : 0}px ${bottom && left ? 5 : 0}px` }} />
      </div>
    );
  }
  return (
    <div className="cell">
      {cell.danger && <div className="cell-danger" data-testid="danger" />}
      {cell.explored && <div className="cell-explored" data-testid="explored" />}
      {cell.path && <div className="cell-path" data-testid="path" />}
      {cell.pellet && <div className="cell-pellet" data-testid="pellet" />}
      {cell.coin && <Coin className="cell-coin" />}
      {cell.target && <div className="cell-target" data-testid="target" />}
      {cell.pac && <Mascot className="cell-pac" dir={dir} mouth={mouth} />}
      {cell.ghost && <Ghost className="cell-ghost" body={cell.ghost.body} eye={cell.ghost.eye} />}
    </div>
  );
}

const MemoCell = memo(Cell, (a, b) => {
  const x = a.cell;
  const y = b.cell;
  return (
    x.wall === y.wall && String(x.wallEdges) === String(y.wallEdges) && x.pellet === y.pellet && x.coin === y.coin && x.path === y.path &&
    x.target === y.target && x.explored === y.explored && x.danger === y.danger && x.pac === y.pac &&
    x.ghost === y.ghost && (!x.pac || (a.dir === b.dir && a.mouth === b.mouth))
  );
});

export function Maze({ cells, rows, cols, showCoords, crt, label, dir, mouth, overlay }) {
  return (
    // Use the full board area without adding an outer frame or empty margins.
    <div className="maze-wrap" style={{ '--tile-x': `calc((100cqw - ${showCoords ? 22 : 0}px) / ${cols})`, '--tile-y': `calc((100cqh - ${showCoords ? 22 : 0}px) / ${rows})` }}>
      {showCoords && (
        <div className="maze-cols" aria-hidden="true">
          {Array.from({ length: cols }, (_, i) => (
            <span key={i}>{i}</span>
          ))}
        </div>
      )}
      <div className="maze-row">
        {showCoords && (
          <div className="maze-rows" aria-hidden="true">
            {Array.from({ length: rows }, (_, i) => (
              <span key={i}>{i}</span>
            ))}
          </div>
        )}
        <div
          className="maze-grid"
          role="img"
          aria-label={label}
          style={{ gridTemplateColumns: `repeat(${cols}, var(--tile-x))` }}
        >
          {cells.map((cell) => (
            <MemoCell key={cell.key} cell={cell} dir={dir} mouth={mouth} />
          ))}
          {crt && <div className="maze-scanlines" aria-hidden="true" />}
          {overlay}
        </div>
      </div>
    </div>
  );
}
