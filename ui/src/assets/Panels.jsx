import { Coin, Ghost, Mascot } from './Sprites.jsx';
import { fmtPos, ghostStyle, pad } from '../game/derive.js';
import { POINTS } from '../game/contract.js';

function LegendRow({ icon, label, value, valueClass = '' }) {
  return (
    <li className="legend-row">
      <span className="legend-icon">{icon}</span>
      <span className="legend-label">{label}</span>
      <span className={`legend-value ${valueClass}`}>{value}</span>
    </li>
  );
}

export function LegendPanel() {
  return (
    <aside className="side-panel" aria-label="What's on screen">
      <h2 className="side-title">WHAT'S ON SCREEN</h2>
      <ul className="legend-list">
        <LegendRow icon={<Mascot width={22} height={20} dir="LEFT" />} label="AGENT" value="AI PLAYER" />
        <LegendRow icon={<Ghost width={22} height={20} />} label="GHOST" value="AVOID" />
        <LegendRow icon={<span className="legend-pellet" />} label="PELLET" value={`+${POINTS.pellet}`} valueClass="legend-yellow" />
        <LegendRow icon={<Coin width={18} height={18} />} label="COIN" value={`+${POINTS.coin}`} valueClass="legend-orange" />
        <LegendRow icon={<span className="legend-route" />} label="ROUTE" value="PLANNED" />
        <LegendRow icon={<span className="legend-target" />} label="TARGET" value="GOAL" />
        <LegendRow icon={<span className="legend-searched" />} label="SEARCHED" value="LOOKED AT" />
        <LegendRow icon={<span className="legend-danger" />} label="DANGER" value="2 CELLS" />
      </ul>
      <div className="legend-parade" aria-hidden="true">
        <Mascot width={28} height={25} dir="RIGHT" />
        <span className="legend-pellet-sm" />
        <span className="legend-pellet-sm" />
        <Ghost width={24} height={22} body="#E43B44" />
        <Ghost width={24} height={22} body="#F6757A" />
        <Ghost width={24} height={22} body="#2CE8F5" eye="#181425" />
        <Ghost width={24} height={22} body="#F77622" />
      </div>
    </aside>
  );
}

export function BoardPanel({ state }) {
  const coinsLeft = state ? state.coins : [];
  return (
    <aside className="side-panel" aria-label="On the board">
      <h2 className="side-title">ON THE BOARD</h2>
      <div className="board-moves">
        <span className="hud-small hud-dim">MOVES</span>
        <span className="board-moves-value" data-testid="moves">{pad(state ? state.tick : 0, 4)}</span>
      </div>
      <ul className="board-list">
        <li className="board-row">
          <span className="board-swatch" style={{ background: '#FEE761' }} aria-hidden="true" />
          <span className="board-label">AGENT · {state ? state.pacman.dir : '—'}</span>
          <span className="board-pos board-pos-cyan" data-testid="agent-pos">{state ? fmtPos(state.pacman.pos) : '—'}</span>
        </li>
        {state &&
          state.ghosts.map((g, i) => {
            const st = ghostStyle(g.id, i);
            return (
              <li className="board-row" key={g.id}>
                <span className="board-swatch" style={{ background: st.body }} aria-hidden="true" />
                <span className="board-label">{st.label} GHOST</span>
                <span className="board-pos">{fmtPos(g.pos)}</span>
              </li>
            );
          })}
        <li className="board-row">
          <span className="board-swatch board-swatch-target" aria-hidden="true" />
          <span className="board-label">NEXT TARGET</span>
          <span className="board-pos board-pos-green">{state ? fmtPos(state.agent.target) : '—'}</span>
        </li>
      </ul>
      <div className="board-coins">
        <span className="hud-small legend-orange">COINS LEFT</span>
        <div className="board-coin-list">
          {coinsLeft.map((c) => (
            <span className="board-coin" key={`${c[0]},${c[1]}`}>
              {fmtPos(c)}
            </span>
          ))}
          {state && coinsLeft.length === 0 && <span className="hud-small hud-green">ALL COLLECTED</span>}
        </div>
      </div>
      <p className="board-note">every spot is (row, col), counted from the top-left corner</p>
    </aside>
  );
}
